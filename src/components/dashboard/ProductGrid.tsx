import { ShopifyProduct, formatCurrency } from '@/lib/shopify';
import { Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: ShopifyProduct[];
  isLoading: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-64 rounded-lg bg-card border border-border animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">No products found</h3>
        <p className="text-sm text-muted-foreground/70">Sync with Shopify to load products</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.node.id} product={product} />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: ShopifyProduct }) {
  const { node } = product;
  const mainImage = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const isAvailable = node.variants.edges.some(v => v.node.availableForSale);
  const variantCount = node.variants.edges.length;
  
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {mainImage ? (
          <img
            src={mainImage.url}
            alt={mainImage.altText || node.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Vendor badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium rounded bg-background/80 backdrop-blur-sm text-foreground">
            {node.vendor}
          </span>
        </div>
        
        {/* Stock indicator */}
        <div className={cn(
          'absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded backdrop-blur-sm',
          isAvailable 
            ? 'bg-success/20 text-success' 
            : 'bg-destructive/20 text-destructive'
        )}>
          {isAvailable ? (
            <>
              <CheckCircle className="w-3 h-3" />
              In Stock
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3" />
              Out of Stock
            </>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">
          {node.productType || 'Product'}
        </p>
        <h3 className="font-medium text-foreground line-clamp-2 leading-tight">
          {node.title}
        </h3>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary font-mono">
            {formatCurrency(price.amount, price.currencyCode)}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {variantCount} variant{variantCount !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* CJ Fulfillment indicator */}
        <div className="flex items-center gap-1 text-xs text-accent">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          CJ Fulfillment Ready
        </div>
      </div>
    </div>
  );
}
