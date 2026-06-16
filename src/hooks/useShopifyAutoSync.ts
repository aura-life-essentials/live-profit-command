import { useEffect } from "react";
import { useDashboardStore } from "@/stores/dashboardStore";

/** Initial fetch + interval-based re-sync of Shopify products. */
export function useShopifyAutoSync(intervalMs = 15 * 60 * 1000) {
  const fetchProducts = useDashboardStore((s) => s.fetchProducts);

  useEffect(() => {
    fetchProducts();
    const id = setInterval(fetchProducts, intervalMs);
    return () => clearInterval(id);
  }, [fetchProducts, intervalMs]);
}
