import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { Button } from '../components/ui/button';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const navigate = useNavigate();

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const formattedTotal = formatPrice(getTotalPrice());

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Có vẻ như bạn chưa thêm bé gấu nào vào giỏ hàng. Hãy dạo quanh cửa hàng để tìm một người bạn nhé!
        </p>
        <Button size="lg" className="rounded-full px-8" onClick={() => navigate('/')}>
          Tiếp tục mua sắm
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto pb-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Giỏ hàng của bạn</h1>
      
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <div key={item.productId} className="flex flex-col sm:flex-row gap-5 p-5 bg-card rounded-[1.5rem] border border-border shadow-sm">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-muted/20 border border-border/50 shrink-0">
                <img 
                  src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=200&auto=format&fit=crop'} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1"><Link to={`/products/${item.productId}`} className="hover:underline underline-offset-4 text-foreground transition-colors">{item.name}</Link></h3>
                    <p className="text-muted-foreground font-medium text-sm mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg" onClick={() => removeItem(item.productId)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/10 shadow-sm">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted/50" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted/50" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-bold text-lg text-foreground">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-muted/20 p-8 rounded-[1.5rem] border border-border shadow-sm h-fit space-y-6 sticky top-24">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Tóm tắt đơn hàng</h2>
          
          <div className="space-y-4 text-sm font-medium">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính ({items.length} sản phẩm)</span>
              <span className="text-foreground">{formattedTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span className="text-foreground">Chưa tính</span>
            </div>
          </div>
          
          <div className="pt-6 border-t border-border flex justify-between items-center">
            <span className="font-bold text-lg">Tổng cộng</span>
            <span className="text-2xl font-extrabold text-foreground">{formattedTotal}</span>
          </div>
          
          <Button size="lg" className="w-full rounded-xl h-14 text-lg font-bold shadow-sm hover:shadow-md transition-all mt-4" onClick={() => navigate('/checkout')}>
            Thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
}
