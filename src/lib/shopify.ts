// Shopify API Configuration - PRODUCTION STORE ONLY
// Store: lovable-project-i664s.myshopify.com

export const SHOPIFY_CONFIG = {
  STORE_DOMAIN: 'lovable-project-i664s.myshopify.com',
  API_VERSION: '2025-07',
  STOREFRONT_TOKEN: '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',
  get STOREFRONT_URL() {
    return `https://${this.STORE_DOMAIN}/api/${this.API_VERSION}/graphql.json`;
  }
} as const;

// TypeScript interfaces for Shopify data
export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    vendor: string;
    productType: string;
    priceRange: {
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
    images: {
      edges: Array<{
        node: {
          url: string;
          altText: string | null;
        };
      }>;
    };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    options: Array<{
      name: string;
      values: string[];
    }>;
  };
}

export interface ProductsResponse {
  data: {
    products: {
      edges: ShopifyProduct[];
    };
  };
}

// GraphQL query for fetching products (Storefront API compatible)
const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          description
          handle
          vendor
          productType
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 3) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          options {
            name
            values
          }
        }
      }
    }
  }
`;

// Storefront API helper function
export async function storefrontApiRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  console.log('[Shopify] Making API request to:', SHOPIFY_CONFIG.STOREFRONT_URL);
  console.log('[Shopify] Variables:', variables);
  
  const response = await fetch(SHOPIFY_CONFIG.STOREFRONT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.STOREFRONT_TOKEN
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  console.log('[Shopify] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Shopify] API Error:', errorText);
    throw new Error(`Shopify API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Shopify] Response data:', data);
  
  if (data.errors) {
    console.error('[Shopify] GraphQL Errors:', data.errors);
    throw new Error(`Shopify GraphQL error: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

// Fetch all products from the store
export async function fetchProducts(limit: number = 50): Promise<ShopifyProduct[]> {
  const response = await storefrontApiRequest<ProductsResponse>(PRODUCTS_QUERY, { first: limit });
  return response.data.products.edges;
}

// Calculate total inventory across all products (count available variants)
export function calculateTotalInventory(products: ShopifyProduct[]): number {
  return products.reduce((total, product) => {
    const availableVariants = product.node.variants.edges.filter(v => v.node.availableForSale).length;
    return total + availableVariants;
  }, 0);
}

// Get product count by vendor
export function getProductsByVendor(products: ShopifyProduct[]): Record<string, number> {
  return products.reduce((acc, product) => {
    const vendor = product.node.vendor || 'Unknown';
    acc[vendor] = (acc[vendor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// Format currency
export function formatCurrency(amount: string, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}
