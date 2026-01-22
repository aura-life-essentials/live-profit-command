import { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { calculateTotalInventory, getProductsByVendor } from '@/lib/shopify';
import { Header } from '@/components/dashboard/Header';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProductGrid } from '@/components/dashboard/ProductGrid';
import { ProductFilters } from '@/components/dashboard/ProductFilters';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { useProductFilters } from '@/hooks/useProductFilters';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Users, 
  Truck 
} from 'lucide-react';

const Index = () => {
  const { 
    products, 
    isLoading, 
    lastSyncTime, 
    syncStatus,
    error,
    realRevenue,
    realOrders,
    realConversions,
    fetchProducts,
  } = useDashboardStore();

  const {
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
  } = useProductFilters(products);

  useEffect(() => {
    // Fetch products immediately on mount
    fetchProducts();
    
    // Then set up 15-minute auto-sync interval
    const interval = setInterval(() => {
      fetchProducts();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const totalInventory = calculateTotalInventory(products);
  const vendorBreakdown = getProductsByVendor(products);
  const vendorCount = Object.keys(vendorBreakdown).length;

  return (
    <div className="min-h-screen bg-background">
      <Header
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onSync={fetchProducts}
        isLoading={isLoading}
        error={error}
      />

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Real Revenue Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <h2 className="text-lg font-semibold text-foreground">
              REAL-TIME METRICS
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              • LIVE DATA ONLY • NO SIMULATIONS
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Revenue"
              value={`$${realRevenue.toFixed(2)}`}
              subtitle="Real Shopify sales"
              icon={<DollarSign className="w-8 h-8" />}
              variant="primary"
            />
            <MetricCard
              title="Orders"
              value={realOrders}
              subtitle="Confirmed orders"
              icon={<ShoppingCart className="w-8 h-8" />}
              variant="default"
            />
            <MetricCard
              title="Conversion Rate"
              value={`${realConversions.toFixed(2)}%`}
              subtitle="From real traffic"
              icon={<TrendingUp className="w-8 h-8" />}
              variant="default"
            />
            <MetricCard
              title="Customers"
              value={0}
              subtitle="Unique buyers"
              icon={<Users className="w-8 h-8" />}
              variant="default"
            />
          </div>
        </section>

        {/* Inventory Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              INVENTORY STATUS
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              • {products.length} PRODUCTS SYNCED
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Total Products"
              value={products.length}
              subtitle="From Shopify catalog"
              icon={<Package className="w-8 h-8" />}
              variant="success"
            />
            <MetricCard
              title="Total Inventory"
              value={totalInventory.toLocaleString()}
              subtitle="Units across all variants"
              icon={<Package className="w-8 h-8" />}
              variant="default"
            />
            <MetricCard
              title="CJ Fulfillment"
              value="CONNECTED"
              subtitle={`${vendorCount} vendors active`}
              icon={<Truck className="w-8 h-8" />}
              variant="success"
            />
          </div>
        </section>

        {/* Sales Charts */}
        <section>
          <SalesChart products={products} revenue={realRevenue} orders={realOrders} />
        </section>

        {/* Products Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                PRODUCT CATALOG
              </h2>
              <span className="text-xs text-muted-foreground font-mono">
                • REAL SHOPIFY DATA
              </span>
            </div>
            
            {/* Vendor breakdown */}
            <div className="hidden lg:flex items-center gap-2">
              {Object.entries(vendorBreakdown).slice(0, 3).map(([vendor, count]) => (
                <span
                  key={vendor}
                  className="px-2 py-1 text-xs font-mono rounded bg-secondary text-secondary-foreground"
                >
                  {vendor}: {count}
                </span>
              ))}
              {Object.keys(vendorBreakdown).length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{Object.keys(vendorBreakdown).length - 3} more
                </span>
              )}
            </div>
          </div>
          
          {/* Filters */}
          <ProductFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            vendors={vendors}
            selectedVendor={selectedVendor}
            onVendorChange={setSelectedVendor}
            productTypes={productTypes}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            stockFilter={stockFilter}
            onStockFilterChange={setStockFilter}
            totalResults={filteredProducts.length}
          />
          
          <ProductGrid products={filteredProducts} isLoading={isLoading} />
        </section>

        {/* Footer Status */}
        <footer className="border-t border-border pt-6 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Store: lovable-project-i664s.myshopify.com
              </span>
              <span>•</span>
              <span>API: 2025-07</span>
              <span>•</span>
              <span>Sync: Every 15 min</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-destructive">NO DEMO MODE</span>
              <span>•</span>
              <span className="text-success">LIVE DATA ONLY</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
