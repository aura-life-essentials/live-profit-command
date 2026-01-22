import { useMemo, useState } from 'react';
import { ShopifyProduct } from '@/lib/shopify';

export function useProductFilters(products: ShopifyProduct[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  // Extract unique vendors and product types
  const vendors = useMemo(() => {
    const vendorSet = new Set<string>();
    products.forEach((p) => {
      if (p.node.vendor) vendorSet.add(p.node.vendor);
    });
    return Array.from(vendorSet).sort();
  }, [products]);

  const productTypes = useMemo(() => {
    const typeSet = new Set<string>();
    products.forEach((p) => {
      if (p.node.productType) typeSet.add(p.node.productType);
    });
    return Array.from(typeSet).sort();
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const { node } = product;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = node.title.toLowerCase().includes(query);
        const matchesDescription = node.description?.toLowerCase().includes(query);
        const matchesVendor = node.vendor?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription && !matchesVendor) {
          return false;
        }
      }

      // Vendor filter
      if (selectedVendor !== 'all' && node.vendor !== selectedVendor) {
        return false;
      }

      // Product type filter
      if (selectedType !== 'all' && node.productType !== selectedType) {
        return false;
      }

      // Stock filter
      const isAvailable = node.variants.edges.some((v) => v.node.availableForSale);
      if (stockFilter === 'in-stock' && !isAvailable) {
        return false;
      }
      if (stockFilter === 'out-of-stock' && isAvailable) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedVendor, selectedType, stockFilter]);

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
  };
}
