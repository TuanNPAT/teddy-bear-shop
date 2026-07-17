import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../api/productApi';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCartStore } from '../../stores/useCartStore';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({ ...product, quantity: 1 });
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
  // Use a real placeholder image instead of text-based placeholder
  const displayImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop';

  return (
    <Link to={`/products/${product.productId}`} className="group relative block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border shadow-sm rounded-[1.5rem]">
        <div className="relative aspect-square overflow-hidden bg-muted/20">
          <img
            src={displayImage}
            alt={product.name}
            className={`object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm">
              <Badge variant="secondary" className="text-sm px-4 py-1.5 font-bold shadow-sm">Hết hàng</Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-5 flex flex-col gap-2">
          <h3 className="font-bold text-lg line-clamp-2 leading-tight text-foreground transition-colors">
            {product.name}
          </h3>
          <p className="font-semibold text-muted-foreground text-xl mt-auto">
            {formattedPrice}
          </p>
        </CardContent>
        
        <CardFooter className="p-5 pt-0">
          <Button 
            className="w-full gap-2 rounded-xl font-bold h-12 shadow-sm hover:shadow-md transition-all" 
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
            Thêm vào giỏ
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
