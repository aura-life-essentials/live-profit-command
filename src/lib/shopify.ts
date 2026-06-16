// Shopify Storefront API client + types.
// Storefront tokens are publishable; env vars allow overriding per deploy.

import { shopifyImage } from "./format";

const DEV = import.meta.env.DEV;

export const SHOPIFY_CONFIG = {
  STORE_DOMAIN:
    import.meta.env.VITE_SHOPIFY_STORE_DOMAIN ||
    "lovable-project-i664s.myshopify.com",
  API_VERSION: import.meta.env.VITE_SHOPIFY_API_VERSION || "2025-07",
  STOREFRONT_TOKEN:
    import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN ||
    "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",
  get STOREFRONT_URL() {
    return `https://${this.STORE_DOMAIN}/api/${this.API_VERSION}/graphql.json`;
  },
} as const;

// ---------- Types ----------

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    vendor: string;
    productType: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: ShopifyImage }> };
    variants: { edges: Array<{ node: ShopifyVariant }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

export interface ProductsResponse {
  data: { products: { edges: ShopifyProduct[] } };
}

// ---------- Queries ----------

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id title description handle vendor productType
          priceRange { minVariantPrice { amount currencyCode } }
          images(first: 3) { edges { node { url altText } } }
          variants(first: 10) {
            edges {
              node {
                id title
                price { amount currencyCode }
                availableForSale
                selectedOptions { name value }
              }
            }
          }
          options { name values }
        }
      }
    }
  }
`;

// ---------- Client ----------

export async function storefrontApiRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(SHOPIFY_CONFIG.STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_CONFIG.STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (DEV) console.error("[Shopify] HTTP", response.status, errorText);
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    if (DEV) console.error("[Shopify] GraphQL errors", data.errors);
    throw new Error(
      `Shopify GraphQL error: ${data.errors
        .map((e: { message: string }) => e.message)
        .join(", ")}`,
    );
  }
  return data as T;
}

export async function fetchProducts(limit = 50): Promise<ShopifyProduct[]> {
  const response = await storefrontApiRequest<ProductsResponse>(
    PRODUCTS_QUERY,
    { first: limit },
  );
  return response.data.products.edges;
}

// ---------- Helpers ----------

export function calculateTotalInventory(products: ShopifyProduct[]): number {
  return products.reduce((total, p) => {
    const available = p.node.variants.edges.filter(
      (v) => v.node.availableForSale,
    ).length;
    return total + available;
  }, 0);
}

export function getProductsByVendor(
  products: ShopifyProduct[],
): Record<string, number> {
  return products.reduce<Record<string, number>>((acc, p) => {
    const vendor = p.node.vendor || "Unknown";
    acc[vendor] = (acc[vendor] || 0) + 1;
    return acc;
  }, {});
}

// Re-export shared formatter so existing imports keep working.
export { formatCurrency } from "./format";
export { shopifyImage };
