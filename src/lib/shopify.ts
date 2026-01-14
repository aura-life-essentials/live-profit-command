// Shopify API Configuration - PRODUCTION STORE ONLY
// Store: lovable-project-i664s.myshopify.com

export const SHOPIFY_CONFIG = {
  STORE_DOMAIN: 'lovable-project-i664s.myshopify.com',
  API_VERSION: '2025-07',
  STOREFRONT_TOKEN: '39c9e9ce48ef993cf46a84facb2cb27e',
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
          quantityAvailable: number | null;
          selectedOptions: Array<{
            name: string;
            value: string;
          }>;
        };
      }>;
    };
    totalInventory: number | null;
  };
}

export interface ProductsResponse {
  data: {
    products: {
      edges: ShopifyProduct[];
    };
  };
}

// GraphQL query for fetching products with inventory
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
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          totalInventory
        }
      }
    }
  }
`;

// Storefront API helper function
export async function storefrontApiRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
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

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Shopify GraphQL error: ${data.errors.map((e: { message: string }) => e.message).join(', ')}`);
  }

  return data;
}

// Fetch all products from the store
export async function fetchProducts(limit: number = 50): Promise<ShopifyProduct[]> {
  const response = await storefrontApiRequest<ProductsResponse>(PRODUCTS_QUERY, { first: limit });
  return response.data.products.edges;
}

// Calculate total inventory across all products
export function calculateTotalInventory(products: ShopifyProduct[]): number {
  return products.reduce((total, product) => {
    return total + (product.node.totalInventory || 0);
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
