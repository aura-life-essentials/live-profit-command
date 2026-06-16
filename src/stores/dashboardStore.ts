import { create } from "zustand";
import { ShopifyProduct, fetchProducts } from "@/lib/shopify";

interface DashboardStore {
  products: ShopifyProduct[];
  isLoading: boolean;
  lastSyncTime: Date | null;
  syncStatus: "idle" | "syncing" | "success" | "error";
  error: string | null;

  // REAL METRICS ONLY — $0 until actual sales arrive.
  realRevenue: number;
  realOrders: number;
  realConversions: number;

  fetchProducts: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  products: [],
  isLoading: false,
  lastSyncTime: null,
  syncStatus: "idle",
  error: null,
  realRevenue: 0,
  realOrders: 0,
  realConversions: 0,

  fetchProducts: async () => {
    set({ isLoading: true, syncStatus: "syncing", error: null });
    try {
      const products = await fetchProducts(50);
      set({
        products,
        isLoading: false,
        lastSyncTime: new Date(),
        syncStatus: "success",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch products";
      set({ isLoading: false, syncStatus: "error", error: errorMessage });
    }
  },
}));
