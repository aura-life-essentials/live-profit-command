import { useMemo, useState } from "react";
import { ShopifyProduct } from "@/lib/shopify";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function useProductFilters(products: ShopifyProduct[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "out-of-stock">("all");

  const debouncedQuery = useDebouncedValue(searchQuery, 200);

  const vendors = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.node.vendor) set.add(p.node.vendor);
    return Array.from(set).sort();
  }, [products]);

  const productTypes = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.node.productType) set.add(p.node.productType);
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return products.filter(({ node }) => {
      if (q) {
        const haystack = `${node.title} ${node.description ?? ""} ${node.vendor ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedVendor !== "all" && node.vendor !== selectedVendor) return false;
      if (selectedType !== "all" && node.productType !== selectedType) return false;

      const isAvailable = node.variants.edges.some((v) => v.node.availableForSale);
      if (stockFilter === "in-stock" && !isAvailable) return false;
      if (stockFilter === "out-of-stock" && isAvailable) return false;

      return true;
    });
  }, [products, debouncedQuery, selectedVendor, selectedType, stockFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedVendor("all");
    setSelectedType("all");
    setStockFilter("all");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedVendor !== "all" ||
    selectedType !== "all" ||
    stockFilter !== "all";

  return {
    searchQuery,
    setSearchQuery,
    selectedVendor,
    setSelectedVendor,
    selectedType,
    setSelectedType,
    stockFilter,
    setStockFilter,
    vendors,
    productTypes,
    filteredProducts,
    clearFilters,
    hasActiveFilters,
  };
}
