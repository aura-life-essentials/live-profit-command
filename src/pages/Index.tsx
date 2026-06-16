import { lazy, Suspense, useMemo } from "react";
import { useDashboardStore } from "@/stores/dashboardStore";
import { calculateTotalInventory, getProductsByVendor, SHOPIFY_CONFIG } from "@/lib/shopify";
import { Header } from "@/components/dashboard/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ProductGrid } from "@/components/dashboard/ProductGrid";
import { ProductFilters } from "@/components/dashboard/ProductFilters";
import { useProductFilters } from "@/hooks/useProductFilters";
import { useShopifyAutoSync } from "@/hooks/useShopifyAutoSync";
import { Helmet } from "react-helmet-async";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Truck,
} from "lucide-react";

const SalesChart = lazy(() =>
  import("@/components/dashboard/SalesChart").then((m) => ({ default: m.SalesChart })),
);

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
    clearFilters,
    hasActiveFilters,
  } = useProductFilters(products);

  useShopifyAutoSync();

  const totalInventory = useMemo(() => calculateTotalInventory(products), [products]);
  const vendorBreakdown = useMemo(() => getProductsByVendor(products), [products]);
  const vendorEntries = useMemo(() => Object.entries(vendorBreakdown), [vendorBreakdown]);
  const vendorCount = vendorEntries.length;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AuraLift for the Spirit — Time is now ageless</title>
        <meta
          name="description"
          content="Shop AuraLift for the Spirit: timeless wellness essentials. Time is now ageless."
        />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="AuraLift for the Spirit" />
        <meta property="og:url" content="/" />
      </Helmet>

      <Header
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onSync={fetchProducts}
        isLoading={isLoading}
        error={error}
      />

      <main className="container mx-auto px-6 py-8 space-y-10">
        {/* Real-time metrics */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <h2 className="text-base font-semibold text-foreground tracking-wide">
              Live overview
            </h2>
            <span className="text-xs text-muted-foreground">
              · synced from your Shopify store
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
            />
            <MetricCard
              title="Conversion Rate"
              value={`${realConversions.toFixed(2)}%`}
              subtitle="From real traffic"
              icon={<TrendingUp className="w-8 h-8" />}
            />
            <MetricCard
              title="Customers"
              value={0}
              subtitle="Unique buyers"
              icon={<Users className="w-8 h-8" />}
            />
          </div>
        </section>

        {/* Inventory */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground tracking-wide">
              Inventory
            </h2>
            <span className="text-xs text-muted-foreground">
              · {products.length} product{products.length === 1 ? "" : "s"} synced
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
              title="Available Variants"
              value={totalInventory.toLocaleString()}
              subtitle="In stock across catalog"
              icon={<Package className="w-8 h-8" />}
            />
            <MetricCard
              title="Fulfillment"
              value={vendorCount > 0 ? "Connected" : "Ready"}
              subtitle={`${vendorCount} vendor${vendorCount === 1 ? "" : "s"} active`}
              icon={<Truck className="w-8 h-8" />}
              variant="success"
            />

          </div>
        </section>

        {/* Analytics */}
        <section>
          <Suspense fallback={<Skeleton className="h-[340px] w-full rounded-lg" />}>
            <SalesChart products={products} revenue={realRevenue} orders={realOrders} />
          </Suspense>
        </section>

        {/* Catalog */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-foreground tracking-wide">
                Catalog
              </h2>
              <span className="text-xs text-muted-foreground">· straight from Shopify</span>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {vendorEntries.slice(0, 3).map(([vendor, count]) => (
                <span
                  key={vendor}
                  className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground"
                >
                  {vendor} · {count}
                </span>
              ))}
              {vendorEntries.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{vendorEntries.length - 3} more
                </span>
              )}
            </div>
          </div>


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

          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        </section>

        <footer className="border-t border-border pt-6 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Store: {SHOPIFY_CONFIG.STORE_DOMAIN}
              </span>
              <span>•</span>
              <span>API {SHOPIFY_CONFIG.API_VERSION}</span>
              <span>•</span>
              <span>Auto-sync every 15 min</span>
            </div>
            <div>© {new Date().getFullYear()} AuraLift for the Spirit</div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
