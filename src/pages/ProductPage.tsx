import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShopifyProduct, storefrontApiRequest, formatCurrency } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ArrowLeft, Package, CheckCircle, AlertTriangle, Loader2, Minus, Plus } from 'lucide-react';

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      description
      handle
      vendor
      productType
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 5) {
        edges {
          node {
            url
            altText
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            selectedOptions {
              name
              value
            }
          }
        }
      }
      options {
        name
        values
      }
    }
  }
`;

interface ProductResponse {
  data: {
    product: ShopifyProduct['node'] | null;
  };
}

const ProductPage = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ShopifyProduct['node']['variants']['edges'][0]['node'] | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { addItem, isLoading: cartLoading } = useCartStore();

  useEffect(() => {
    async function fetchProduct() {
      if (!handle) return;
      
      setIsLoading(true);
      try {
        const response = await storefrontApiRequest<ProductResponse>(PRODUCT_BY_HANDLE_QUERY, { handle });
        const productData = response.data.product;
        setProduct(productData);
        
        if (productData?.variants.edges.length) {
          const firstVariant = productData.variants.edges[0].node;
          setSelectedVariant(firstVariant);
          
          const initialOptions: Record<string, string> = {};
          firstVariant.selectedOptions.forEach(opt => {
            initialOptions[opt.name] = opt.value;
          });
          setSelectedOptions(initialOptions);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProduct();
  }, [handle]);

  useEffect(() => {
    if (!product) return;
    
    const matchingVariant = product.variants.edges.find(v => {
      return v.node.selectedOptions.every(opt => selectedOptions[opt.name] === opt.value);
    });
    
    if (matchingVariant) {
      setSelectedVariant(matchingVariant.node);
    }
  }, [selectedOptions, product]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Package className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-foreground">Product not found</h1>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to catalog
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.images.edges;
  const isAvailable = selectedVariant?.availableForSale ?? false;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to catalog</span>
          </Link>
          <CartDrawer />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
              {images[selectedImageIndex]?.node ? (
                <img
                  src={images[selectedImageIndex].node.url}
                  alt={images[selectedImageIndex].node.altText || product.title}
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
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      idx === selectedImageIndex ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={img.node.url}
                      alt={img.node.altText || `${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {product.vendor}
                </Badge>
                {product.productType && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.productType}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-foreground mb-4">{product.title}</h1>
              
              <div className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full ${
                isAvailable 
                  ? 'bg-success/20 text-success' 
                  : 'bg-destructive/20 text-destructive'
              }`}>
                {isAvailable ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    In Stock
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    Out of Stock
                  </>
                )}
              </div>
            </div>

            <div className="text-3xl font-bold text-primary font-mono">
              {selectedVariant && formatCurrency(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Options */}
            {product.options.map(option => (
              <div key={option.name} className="space-y-2">
                <label className="text-sm font-medium text-foreground">{option.name}</label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map(value => (
                    <button
                      key={value}
                      onClick={() => handleOptionChange(option.name, value)}
                      className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                        selectedOptions[option.name] === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:border-primary/50'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quantity</label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-mono text-lg">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!isAvailable || cartLoading}
            >
              {cartLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Add to Cart'
              )}
            </Button>

            {/* CJ Fulfillment */}
            <div className="flex items-center gap-2 text-sm text-accent">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              CJ Fulfillment Ready • Fast Global Shipping
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
