import { memo } from "react";
import { Link } from "react-router-dom";
import { ShopifyProduct } from "@/lib/shopify";
import { formatCurrency, shopifyImage } from "@/lib/format";
import { useCartStore } from "@/stores/cartStore";
import {
  Package,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Loader2,
  Filter as FilterIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  products: ShopifyProduct[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

function ProductSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-5 w-1/2" />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  isLoading,
  hasActiveFilters = false,
  onClearFilters,
}: ProductGridProps) {
  if (isLoading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-border">
        {hasActiveFilters ? (
          <>
            <FilterIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-medium text-foreground">
              No products match these filters
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try a different search or clear filters to see everything.
            </p>
            {onClearFilters && (
              <Button variant="outline" size="sm" className="mt-4" onClick={onClearFilters}>
                Clear filters
              </Button>
            )}
          </>
        ) : (
          <>
            <Package className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-medium text-foreground">No products yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add a product in Shopify and it will appear here automatically.
            </p>
          </>
        )}
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

const ProductCard = memo(function ProductCard({ product }: { product: ShopifyProduct }) {
  const { node } = product;
  const mainImage = node.images.edges[0]?.node;
  const price = node.priceRange.minVariantPrice;
  const isAvailable = node.variants.edges.some((v) => v.node.availableForSale);
  const variantCount = node.variants.edges.length;
  const firstVariant = node.variants.edges[0]?.node;

  const { addItem, isLoading } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firstVariant) return;
    await addItem({
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions,
    });
  };

  return (
    <Link
      to={`/product/${node.handle}`}
      className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-aura block"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {mainImage ? (
          <img
            src={shopifyImage(mainImage.url, 480)}
            alt={mainImage.altText || node.title}
            loading="lazy"
            decoding="async"
            width={480}
            height={480}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 text-xs font-medium rounded bg-background/80 backdrop-blur-sm text-foreground">
            {node.vendor || "Brand"}
          </span>
        </div>

        <div
          className={cn(
            "absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium rounded backdrop-blur-sm",
            isAvailable
              ? "bg-success/20 text-success"
              : "bg-destructive/20 text-destructive",
          )}
        >
          {isAvailable ? (
            <>
              <CheckCircle className="w-3 h-3" />
              In Stock
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3" />
              Sold Out
            </>
          )}
        </div>

        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!isAvailable || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-1.5">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
          {node.productType || "Product"}
        </p>
        <h3 className="font-medium text-foreground line-clamp-2 leading-snug">
          {node.title}
        </h3>

        <div className="flex items-center justify-between pt-1.5">
          <span className="text-lg font-bold text-primary font-mono">
            {formatCurrency(price.amount, price.currencyCode)}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {variantCount} variant{variantCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  );
});
