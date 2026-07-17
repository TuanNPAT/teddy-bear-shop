import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { useAuthStore } from '../stores/useAuthStore';
import { userApi } from '../api/userApi';
import { orderApi } from '../api/orderApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const checkoutSchema = z.object({
  customerName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  customerPhone: z.string().min(10, { message: 'Số điện thoại không hợp lệ' }),
  shippingAddress: z.string().min(5, { message: 'Địa chỉ nhận hàng quá ngắn' }),
  paymentMethod: z.enum(['COD', 'VNPAY']),
  note: z.string().optional(),
});

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'COD'
    }
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Vui lòng đăng nhập để thanh toán');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await userApi.getProfile();
        reset({
          customerName: profile.fullName,
          customerPhone: profile.phoneNumber,
          shippingAddress: profile.shippingAddress,
          paymentMethod: 'COD',
        });
      } catch {
        // Just use empty fields if profile fails
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate, reset, items.length]);

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    setIsSubmitting(true);
    try {
      const orderData = {
        ...data,
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity }))
      };
      
      const order = await orderApi.createOrder(orderData);
      clearCart();
      toast.success(`Đặt hàng thành công! Mã đơn: #${order.orderId}`);
      navigate('/thank-you', { state: { orderId: order.orderId } });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProfile) {
    return <div className="py-20 text-center">Đang tải thông tin...</div>;
  }

  const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getTotalPrice());

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Thanh toán</h1>
      
      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 bg-card p-8 md:p-10 rounded-[1.5rem] border border-border shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8">Thông tin giao hàng</h2>
          
          <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customerName" className="font-semibold text-foreground">Họ và tên người nhận</Label>
                <Input id="customerName" {...register('customerName')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
                {errors.customerName && <p className="text-sm font-medium text-destructive">{errors.customerName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone" className="font-semibold text-foreground">Số điện thoại</Label>
                <Input id="customerPhone" {...register('customerPhone')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
                {errors.customerPhone && <p className="text-sm font-medium text-destructive">{errors.customerPhone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress" className="font-semibold text-foreground">Địa chỉ nhận hàng</Label>
              <Input id="shippingAddress" {...register('shippingAddress')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" />
              {errors.shippingAddress && <p className="text-sm font-medium text-destructive">{errors.shippingAddress.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note" className="font-semibold text-foreground">Ghi chú đơn hàng (Tùy chọn)</Label>
              <Input id="note" {...register('note')} className="rounded-xl bg-muted/20 border-border h-12 px-4 shadow-sm focus-visible:ring-primary" placeholder="Ví dụ: Giao hàng giờ hành chính" />
            </div>

            <div className="pt-8 border-t border-border mt-8">
              <h3 className="text-xl font-bold tracking-tight text-foreground mb-6">Phương thức thanh toán</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-5 border border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors shadow-sm">
                  <input type="radio" value="COD" {...register('paymentMethod')} className="w-5 h-5 text-primary accent-primary" />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-muted-foreground mt-1">Thanh toán bằng tiền mặt khi gấu bông được giao đến tay bạn.</p>
                  </div>
                </label>
                <label className="flex items-center gap-4 p-5 border border-border rounded-xl cursor-pointer hover:bg-muted/30 transition-colors shadow-sm">
                  <input type="radio" value="VNPAY" {...register('paymentMethod')} className="w-5 h-5 text-primary accent-primary" />
                  <div className="flex-1">
                    <p className="font-bold text-foreground">Thanh toán Online (VNPay)</p>
                    <p className="text-sm text-muted-foreground mt-1">Thanh toán an toàn qua cổng VNPay.</p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-muted/20 p-8 rounded-[1.5rem] border border-border shadow-sm sticky top-24">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">Tóm tắt đơn hàng ({items.length})</h2>
            
            <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border/50 shrink-0">
                    <img src={item.imageUrls?.[0] || 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=100&auto=format&fit=crop'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm line-clamp-1 text-foreground">{item.name}</p>
                    <p className="text-muted-foreground text-sm mt-1">SL: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-sm text-foreground">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-border space-y-4 mb-8">
              <div className="flex justify-between font-medium text-sm">
                <span className="text-muted-foreground">Tạm tính</span>
                <span className="text-foreground">{formattedTotal}</span>
              </div>
              <div className="flex justify-between font-medium text-sm">
                <span className="text-muted-foreground">Phí vận chuyển</span>
                <span className="text-foreground">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-border/50">
                <span className="font-bold text-lg text-foreground">Tổng cộng</span>
                <span className="text-2xl font-extrabold text-foreground">{formattedTotal}</span>
              </div>
            </div>
            
            <Button 
              type="submit" 
              form="checkout-form" 
              className="w-full rounded-xl h-14 text-lg font-bold shadow-sm hover:shadow-md transition-all" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
