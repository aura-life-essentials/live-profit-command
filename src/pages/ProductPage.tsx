import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ShopifyProduct,
  ShopifyVariant,
  storefrontApiRequest,
} from "@/lib/shopify";
import { formatCurrency, shopifyImage } from "@/lib/format";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import {
  ArrowLeft,
  Package,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Minus,
  Plus,
} from "lucide-react";

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id title description handle vendor productType
      priceRange { minVariantPrice { amount currencyCode } }
      images(first: 5) { edges { node { url altText } } }
      variants(first: 20) {
        edges {
          node {
            id title
            price { amount currencyCode }
            availableForSale
            selectedOptions { name value }
          }
        }
      }
      options { name values }
    }
  }
`;

interface ProductResponse {
  data: { product: ShopifyProduct["node"] | null };
}

const ProductPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct["node"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyVariant | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addItem, isLoading: cartLoading } = useCartStore();

  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      if (!handle) return;
      setIsLoading(true);
      try {
        const response = await storefrontApiRequest<ProductResponse>(
          PRODUCT_BY_HANDLE_QUERY,
          { handle },
        );
        if (cancelled) return;
        const data = response.data.product;
        setProduct(data);
        if (data?.variants.edges.length) {
          const first = data.variants.edges[0].node;
          setSelectedVariant(first);
          const initial: Record<string, string> = {};
          first.selectedOptions.forEach((o) => (initial[o.name] = o.value));
          setSelectedOptions(initial);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [handle]);

  useEffect(() => {
    if (!product) return;
    const match = product.variants.edges.find((v) =>
      v.node.selectedOptions.every((o) => selectedOptions[o.name] === o.value),
    );
    if (match) setSelectedVariant(match.node);
  }, [selectedOptions, product]);

  const handleOptionChange = (name: string, value: string) =>
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) return;
    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    });
  };

  const images = product?.images.edges ?? [];
  const isAvailable = selectedVariant?.availableForSale ?? false;

  const productJsonLd = useMemo(() => {
    if (!product || !selectedVariant) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.description,
      brand: product.vendor ? { "@type": "Brand", name: product.vendor } : undefined,
      image: images.map((i) => i.node.url),
      offers: {
        "@type": "Offer",
        price: selectedVariant.price.amount,
        priceCurrency: selectedVariant.price.currencyCode,
        availability: isAvailable
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        url: `/product/${product.handle}`,
      },
    };
  }, [product, selectedVariant, images, isAvailable]);

  return (
    <div className="min-h-screen bg-background">
      {product && (
        <Helmet>
          <title>{`${product.title} — AuraLift for the Spirit`}</title>
          <meta
            name="description"
            content={product.description?.slice(0, 155) || `Shop ${product.title} at AuraLift for the Spirit.`}
          />
          <link rel="canonical" href={`/product/${product.handle}`} />
          <meta property="og:title" content={product.title} />
          <meta property="og:type" content="product" />
          <meta property="og:url" content={`/product/${product.handle}`} />
          {images[0] && <meta property="og:image" content={images[0].node.url} />}
          {productJsonLd && (
            <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
          )}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "/" },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: product.title,
                  item: `/product/${product.handle}`,
                },
              ],
            })}
          </script>
        </Helmet>
      )}

      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to catalog</span>
          </Link>
          <CartDrawer />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : !product ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Package className="w-16 h-16 text-muted-foreground/40" />
            <h1 className="text-xl font-semibold text-foreground">Product not found</h1>
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to catalog
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                {images[selectedImageIndex]?.node ? (
                  <img
                    src={shopifyImage(images[selectedImageIndex].node.url, 1200)}
                    alt={images[selectedImageIndex].node.altText || product.title}
                    width={1200}
                    height={1200}
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-20 h-20 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      aria-label={`View image ${idx + 1}`}
                      className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                        idx === selectedImageIndex
                          ? "border-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <img
                        src={shopifyImage(img.node.url, 160)}
                        alt={img.node.altText || `${product.title} ${idx + 1}`}
                        width={160}
                        height={160}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.vendor && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {product.vendor}
                    </Badge>
                  )}
                  {product.productType && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {product.productType}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-4">{product.title}</h1>

                <div
                  className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${
                    isAvailable
                      ? "bg-success/20 text-success"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      In Stock
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      Sold Out
                    </>
                  )}
                </div>
              </div>

              <div className="text-3xl font-bold text-primary font-mono">
                {selectedVariant &&
                  formatCurrency(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
              </div>

              {product.description && (
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              )}

              {product.options
                .filter((o) => !(o.values.length === 1 && o.values[0].toLowerCase() === "default title"))
                .map((option) => (
                  <div key={option.name} className="space-y-2">
                    <label className="text-sm font-medium text-foreground">{option.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                            selectedOptions[option.name] === value
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-foreground hover:border-primary/50"
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quantity</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-mono text-lg">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!isAvailable || cartLoading}
              >
                {cartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Cart"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;
