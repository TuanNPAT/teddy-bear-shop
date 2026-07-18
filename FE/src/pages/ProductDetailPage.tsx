import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import type { Product } from '../api/productApi';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useCartStore } from '../stores/useCartStore';
import { toast } from 'sonner';
import ProductImageFallback from '../components/product/ProductImageFallback';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (id) {
          const data = await productApi.getProductById(Number(id));
          setProduct(data);
        }
      } catch (error) {
        toast.error('Không thể tải thông tin sản phẩm');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return <div className="container py-20"><Skeleton className="h-[600px] w-full rounded-2xl" /></div>;
  }

  if (!product) return null;

  const isOutOfStock = product.stock === 0;
  const existingItem = cartItems.find((item) => item.productId === product.productId);
  const currentCartQty = existingItem ? existingItem.quantity : 0;

  const handleDecrement = () => {
    if (quantity <= 1) return;
    setQuantity((prev) => prev - 1);
  };

  const handleIncrement = () => {
    if (quantity >= product.stock) {
      toast.warning(`Chỉ còn tối đa ${product.stock} sản phẩm`);
      return;
    }
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    const maxCanAdd = product.stock - currentCartQty;
    if (quantity > maxCanAdd) {
      if (maxCanAdd <= 0) {
        toast.error(`Sản phẩm này đã đạt số lượng tối đa trong giỏ hàng (${product.stock} sản phẩm)`);
      } else {
        toast.error(`Chỉ còn thêm được ${maxCanAdd} sản phẩm nữa vào giỏ hàng`);
      }
      return;
    }

    addItem({ ...product, quantity });
    setQuantity(1);
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
  const displayImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>
      
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-muted/20 border border-border shadow-sm">
          {!displayImage || imgError ? (
            <ProductImageFallback />
          ) : (
            <img 
              src={displayImage} 
              alt={product.name} 
              onError={() => setImgError(true)}
              className={`object-cover w-full h-full ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} 
            />
          )}
          {isOutOfStock && (
            <Badge className="absolute top-4 left-4 rounded-full bg-destructive px-4 py-1.5 text-sm font-semibold text-destructive-foreground border-none shadow-sm z-20">
              Hết hàng
            </Badge>
          )}
        </div>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="font-semibold text-sm px-3 py-1">{product.category}</Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.1] text-foreground">{product.name}</h1>
          </div>
          
          <p className="text-3xl font-bold text-muted-foreground">{formattedPrice}</p>
          
          <div className="prose prose-stone dark:prose-invert">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-[65ch]">{product.description}</p>
          </div>
          
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-6">
              Tình trạng: <span className={isOutOfStock ? "text-destructive font-bold" : "text-foreground font-bold"}>
                {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
              </span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 border border-border/60 rounded-xl p-1 bg-muted/10 h-14 w-full sm:w-auto justify-between sm:justify-start">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleDecrement}
                  disabled={isOutOfStock || quantity <= 1}
                  className="h-12 w-12 rounded-lg hover:bg-background"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-bold text-lg select-none">{isOutOfStock ? 0 : quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleIncrement}
                  disabled={isOutOfStock}
                  className={`h-12 w-12 rounded-lg hover:bg-background ${quantity >= product.stock ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-10 text-lg rounded-xl font-bold shadow-sm hover:shadow-md transition-all gap-3 flex-1 sm:flex-initial"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
