import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShopifyProduct } from '@/lib/shopify';
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

interface SalesChartProps {
  products: ShopifyProduct[];
  revenue: number;
  orders: number;
}

export function SalesChart({ products, revenue, orders }: SalesChartProps) {
  // Generate mock time-series data for visualization
  // In production, this would come from actual Shopify analytics
  const timeSeriesData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day) => ({
      name: day,
      revenue: 0, // Real data would populate this
      orders: 0,
      visitors: 0,
    }));
  }, []);

  // Product category distribution
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    products.forEach((product) => {
      const type = product.node.productType || 'Other';
      categories[type] = (categories[type] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
    }));
  }, [products]);

  // Vendor distribution
  const vendorData = useMemo(() => {
    const vendors: Record<string, number> = {};
    products.forEach((product) => {
      const vendor = product.node.vendor || 'Unknown';
      vendors[vendor] = (vendors[vendor] || 0) + 1;
    });
    return Object.entries(vendors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({
        name: name.length > 12 ? name.slice(0, 12) + '...' : name,
        products: value,
      }));
  }, [products]);

  // Price range distribution
  const priceRangeData = useMemo(() => {
    const ranges = [
      { range: '$0-25', min: 0, max: 25, count: 0 },
      { range: '$25-50', min: 25, max: 50, count: 0 },
      { range: '$50-100', min: 50, max: 100, count: 0 },
      { range: '$100-200', min: 100, max: 200, count: 0 },
      { range: '$200+', min: 200, max: Infinity, count: 0 },
    ];
    
    products.forEach((product) => {
      const price = parseFloat(product.node.priceRange.minVariantPrice.amount);
      const range = ranges.find((r) => price >= r.min && price < r.max);
      if (range) range.count++;
    });

    return ranges.map((r) => ({
      name: r.range,
      products: r.count,
    }));
  }, [products]);

  const COLORS = [
    'hsl(160, 100%, 45%)', // primary
    'hsl(190, 100%, 50%)', // accent
    'hsl(45, 100%, 55%)',  // warning
    'hsl(280, 70%, 50%)',  // purple
    'hsl(340, 80%, 55%)',  // pink
    'hsl(200, 80%, 55%)',  // blue
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Analytics & Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="revenue" className="text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs">
              <PieChartIcon className="w-3 h-3 mr-1" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="vendors" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Vendors
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Pricing
            </TabsTrigger>
          </TabsList>

          {/* Revenue Chart */}
          <TabsContent value="revenue" className="mt-4">
            <div className="h-[250px]">
              {revenue === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No sales data yet</p>
                  <p className="text-xs">Revenue chart will populate with real orders</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 100%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(160, 100%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                    <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(160, 100%, 45%)"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* Categories Pie Chart */}
          <TabsContent value="categories" className="mt-4">
            <div className="h-[250px]">
              {categoryData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <PieChartIcon className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No products loaded</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="60%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {categoryData.slice(0, 5).map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-muted-foreground truncate">{entry.name}</span>
                        <span className="ml-auto font-mono text-foreground">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Vendors Bar Chart */}
          <TabsContent value="vendors" className="mt-4">
            <div className="h-[250px]">
              {vendorData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No vendors found</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" horizontal={false} />
                    <XAxis type="number" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                    <YAxis type="category" dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={11} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="products" fill="hsl(160, 100%, 45%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          {/* Price Range Chart */}
          <TabsContent value="pricing" className="mt-4">
            <div className="h-[250px]">
              {priceRangeData.every((d) => d.products === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm font-medium">No pricing data</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceRangeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                    <XAxis dataKey="name" stroke="hsl(215, 15%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 15%, 55%)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="products" fill="hsl(190, 100%, 50%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
