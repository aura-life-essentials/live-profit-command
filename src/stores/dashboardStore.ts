import { create } from 'zustand';
import { ShopifyProduct, fetchProducts } from '@/lib/shopify';

interface DashboardStore {
  products: ShopifyProduct[];
  isLoading: boolean;
  lastSyncTime: Date | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  error: string | null;
  
  // REAL METRICS ONLY - $0 until actual sales
  realRevenue: number;
  realOrders: number;
  realConversions: number;
  
  // Actions
  fetchProducts: () => Promise<void>;
  startAutoSync: () => void;
  stopAutoSync: () => void;
}

let syncInterval: NodeJS.Timeout | null = null;

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  products: [],
  isLoading: false,
  lastSyncTime: null,
  syncStatus: 'idle',
  error: null,
  
  // REAL DATA ONLY - These are $0 until actual Shopify orders come in
  // NO DEMO/TEST/SIMULATION DATA EVER
  realRevenue: 0,
  realOrders: 0,
  realConversions: 0,
  
  fetchProducts: async () => {
    set({ isLoading: true, syncStatus: 'syncing', error: null });
    
    try {
      console.log('[Dashboard] Starting product fetch...');
      const products = await fetchProducts(50);
      console.log('[Dashboard] Fetched products:', products.length);
      set({ 
        products, 
        isLoading: false, 
        lastSyncTime: new Date(),
        syncStatus: 'success'
      });
    } catch (error) {
      console.error('[Dashboard] Fetch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      set({ 
        isLoading: false, 
        syncStatus: 'error',
        error: errorMessage
      });
    }
  },
  
  startAutoSync: () => {
    // Sync every 15 minutes as requested
    const SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes
    
    // Initial sync
    get().fetchProducts();
    
    // Set up interval
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(() => {
      get().fetchProducts();
    }, SYNC_INTERVAL);
  },
  
  stopAutoSync: () => {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  }
}));
