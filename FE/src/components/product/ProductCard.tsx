import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../../api/productApi';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useCartStore } from '../../stores/useCartStore';
import ProductImageFallback from './ProductImageFallback';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isOutOfStock = product.stock === 0;
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem({ ...product, quantity: 1 });
  };

  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
  const displayImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : '';

  return (
    <Link to={`/products/${product.productId}`} className="group relative block h-full">
      <Card className="h-full flex flex-col overflow-hidden rounded-[1.25rem] border border-border/40 bg-card shadow-sm hover:shadow-md transition-all duration-300">
        <div className="relative mx-3 mt-3 aspect-square overflow-hidden rounded-xl bg-muted/20 shrink-0">
          {!displayImage || imgError ? (
            <ProductImageFallback />
          ) : (
            <img
              src={displayImage}
              alt={product.name}
              onError={() => setImgError(true)}
              className={`object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
            />
          )}
          {isOutOfStock && (
            <Badge className="absolute top-2 left-2 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground border-none shadow-sm">
              Hết hàng
            </Badge>
          )}
        </div>
        
        <CardContent className="px-5 pb-0 pt-4 flex flex-col flex-1">
          <h3 className="text-lg tracking-tight text-foreground font-semibold line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center justify-between mt-auto">
            <p className="text-2xl font-bold text-primary">
              {formattedPrice}
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="px-5 pb-5 pt-4 shrink-0">
          <Button 
            className="w-full flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all focus:outline-none focus:ring-4 focus:ring-primary/20 h-11 shadow-sm"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
