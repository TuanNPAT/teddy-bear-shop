import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/useCartStore';
import { useAuthStore } from '../stores/useAuthStore';
import { userApi } from '../api/userApi';
import { orderApi } from '../api/orderApi';
import { paymentApi } from '../api/paymentApi';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Loader2, ExternalLink, RefreshCw, XCircle } from 'lucide-react';
import ProductImageFallback from '../components/product/ProductImageFallback';
import { phoneSchema } from '../lib/validators';

const checkoutSchema = z.object({
  customerName: z.string().min(2, { message: 'Họ tên phải có ít nhất 2 ký tự' }),
  customerPhone: phoneSchema,
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
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // VNPay polling state
  const [vnpayPendingOrder, setVnpayPendingOrder] = useState<{
    orderId: number;
    orderCode: string;
    paymentUrl: string;
    popupRef?: Window | null;
  } | null>(null);
  const [pollingStatus, setPollingStatus] = useState<'POLLING' | 'SUCCESS' | 'FAILED'>('POLLING');

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

    if (items.length === 0 && !vnpayPendingOrder) {
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
  }, [isAuthenticated, navigate, reset, items.length, vnpayPendingOrder]);

  /*
  // Polling mechanism disabled in favor of direct Backend 302 redirect to FE
  useEffect(() => {
    if (!vnpayPendingOrder || pollingStatus !== 'POLLING') return;

    let attempts = 0;

    const pollPaymentStatus = async () => {
      attempts++;
      try {
        const [paymentRes, orderRes] = await Promise.all([
          paymentApi.getPaymentByOrderId(vnpayPendingOrder.orderId).catch(() => null),
          orderApi.getOrderById(vnpayPendingOrder.orderId).catch(() => null),
        ]);

        const isPaymentSuccess = paymentRes?.status === 'SUCCESS' || orderRes?.status === 'PAID';
        const isPaymentFailed = paymentRes?.status === 'FAILED' || orderRes?.status === 'CANCELLED';

        if (isPaymentSuccess) {
          vnpayPendingOrder.popupRef?.close();
          setPollingStatus('SUCCESS');
          clearCart();
          toast.success('Thanh toán VNPay thành công!');
          navigate('/thank-you', { state: { orderId: vnpayPendingOrder.orderId } });
        } else if (isPaymentFailed) {
          vnpayPendingOrder.popupRef?.close();
          setPollingStatus('FAILED');
          toast.error('Thanh toán VNPay không thành công hoặc bị hủy');
        }
      } catch {
        // Continue polling if payment record not created yet or network glitch
      }
    };

    const pollIntervalMs = attempts < 150 ? 400 : 2000;
    const interval = setInterval(pollPaymentStatus, pollIntervalMs);
    return () => clearInterval(interval);
  }, [vnpayPendingOrder, pollingStatus, clearCart, navigate]);
  */

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const onSubmit = async (data: z.infer<typeof checkoutSchema>) => {
    setIsSubmitting(true);

    try {
      const orderData = {
        ...data,
        items: items.map(item => ({ productId: item.productId, quantity: item.quantity }))
      };
      
      const order = await orderApi.createOrder(orderData);

      if (data.paymentMethod === 'VNPAY') {
        const paymentRes = await paymentApi.createPayment(order.orderId);
        if (paymentRes.paymentUrl) {
          toast.info('Đang chuyển hướng sang cổng thanh toán VNPay...');
          window.location.href = paymentRes.paymentUrl;
        } else {
          toast.error('Không thể lấy liên kết thanh toán VNPay');
        }
      } else {
        // COD flow
        clearCart();
        toast.success(`Đặt hàng thành công! Mã đơn: #${order.orderId}`);
        navigate('/thank-you', { state: { orderId: order.orderId } });
      }
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
                    {!item.imageUrls?.[0] || imageErrors[item.productId] ? (
                      <ProductImageFallback emojiClassName="text-2xl" showText={false} />
                    ) : (
                      <img 
                        src={item.imageUrls[0]} 
                        alt={item.name} 
                        onError={() => setImageErrors((prev) => ({ ...prev, [item.productId]: true }))}
                        className="w-full h-full object-cover" 
                      />
                    )}
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
              disabled={isSubmitting || !!vnpayPendingOrder}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Hoàn tất đặt hàng'}
            </Button>
          </div>
        </div>
      </div>

      {/* VNPay Pending Payment Modal */}
      {vnpayPendingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-card p-8 rounded-[2rem] border border-border shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            {pollingStatus === 'POLLING' && (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Loader2 className="h-9 w-9 animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Đang chờ thanh toán VNPay...</h3>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    Trang thanh toán VNPay đã được mở ở cửa sổ mới. Vui lòng hoàn tất thanh toán trên VNPay.
                  </p>
                  <p className="text-xs font-mono text-primary font-bold pt-1">
                    Mã đơn hàng: #{vnpayPendingOrder.orderCode}
                  </p>
                </div>
                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    onClick={() => window.open(vnpayPendingOrder.paymentUrl, '_blank')}
                    variant="outline"
                    className="rounded-xl h-12 font-bold border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Mở lại trang thanh toán VNPay
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setVnpayPendingOrder(null);
                      setPollingStatus('POLLING');
                    }}
                    className="rounded-xl h-11 text-muted-foreground hover:text-foreground"
                  >
                    Đóng lại & Chọn lại
                  </Button>
                </div>
              </>
            )}

            {pollingStatus === 'FAILED' && (
              <>
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <XCircle className="h-9 w-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Thanh toán Không thành công</h3>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    Giao dịch VNPay cho đơn hàng #{vnpayPendingOrder.orderCode} đã bị hủy hoặc không thể hoàn tất.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <Button
                    onClick={() => {
                      window.open(vnpayPendingOrder.paymentUrl, '_blank');
                      setPollingStatus('POLLING');
                    }}
                    className="rounded-xl h-12 px-6 font-bold"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Thử thanh toán lại
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVnpayPendingOrder(null);
                      setPollingStatus('POLLING');
                    }}
                    className="rounded-xl h-12 px-6 font-bold"
                  >
                    Đóng
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
