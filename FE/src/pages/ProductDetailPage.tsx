import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import type { Product } from '../api/productApi';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { useCartStore } from '../stores/useCartStore';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const addItem = useCartStore((state) => state.addItem);

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

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({ ...product, quantity: 1 });
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
  const displayImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">
      <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
      </Button>
      
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-muted/20 border border-border shadow-sm">
          <img 
            src={displayImage} 
            alt={product.name} 
            className={`object-cover w-full h-full ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} 
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm">
              <Badge variant="secondary" className="text-lg px-6 py-2 font-bold shadow-sm">Hết hàng</Badge>
            </div>
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
            
            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 px-10 text-lg rounded-xl font-bold shadow-sm hover:shadow-md transition-all gap-3"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-5 w-5" />
              Thêm vào giỏ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
