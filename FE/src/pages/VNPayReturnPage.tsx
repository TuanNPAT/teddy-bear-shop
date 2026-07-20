import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentApi, type PaymentResultResponse } from '../api/paymentApi';
import { orderApi } from '../api/orderApi';
import { useCartStore } from '../stores/useCartStore';
import { Button } from '../components/ui/button';
import { CheckCircle2, XCircle, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function VNPayReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PaymentResultResponse | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const processReturn = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(location.search);
        const orderCodeParam = searchParams.get('orderCode');
        const paymentStatusParam = searchParams.get('paymentStatus');
        const messageParam = searchParams.get('message');
        const transactionNoParam = searchParams.get('transactionNo');

        let res: PaymentResultResponse;

        if (orderCodeParam && paymentStatusParam) {
          // Received direct 302 redirect result from Backend PaymentController
          res = {
            orderCode: orderCodeParam,
            paymentStatus: paymentStatusParam as 'SUCCESS' | 'FAILED',
            message: messageParam || (paymentStatusParam === 'SUCCESS' ? 'Giao dịch thành công' : 'Thanh toán thất bại'),
            transactionNo: transactionNoParam || undefined,
          };
        } else {
          // Pass raw query string from VNPay redirect to backend handleVNPayReturn API
          res = await paymentApi.handleVNPayReturn(location.search);
        }

        setResult(res);

        if (res.paymentStatus === 'SUCCESS') {
          clearCart();
          toast.success('Thanh toán VNPay thành công!');
        } else {
          toast.error(`Thanh toán không thành công: ${res.message}`);
        }

        // Attempt to find orderId by orderCode for retrying payment if failed
        if (res.orderCode) {
          try {
            const orders = await orderApi.getMyOrders();
            const found = orders.find((o) => o.orderCode === res.orderCode);
            if (found) {
              setOrderId(found.orderId);
            }
          } catch {
            // Non-critical if fails
          }
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Lỗi xử lý kết quả thanh toán VNPay');
        setResult({
          orderCode: '',
          paymentStatus: 'FAILED',
          message: err.response?.data?.message || 'Xác thực thanh toán thất bại hoặc chữ ký không hợp lệ',
        });
      } finally {
        setLoading(false);
      }
    };

    if (location.search) {
      processReturn();
    } else {
      setLoading(false);
    }
  }, [location.search, clearCart]);

  const handleRetryPayment = async () => {
    if (!orderId) {
      toast.error('Không tìm thấy thông tin đơn hàng để thử lại');
      return;
    }
    setRetrying(true);
    try {
      const paymentRes = await paymentApi.createPayment(orderId);
      if (paymentRes.paymentUrl) {
        window.location.href = paymentRes.paymentUrl;
      } else {
        toast.error('Không thể tạo liên kết thanh toán mới');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể khởi tạo lại thanh toán VNPay');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Đang xác thực giao dịch...</h2>
        <p className="text-sm font-medium text-muted-foreground">
          Vui lòng đợi trong giây lát, chúng tôi đang kiểm tra kết quả thanh toán từ VNPay.
        </p>
      </div>
    );
  }

  const isSuccess = result?.paymentStatus === 'SUCCESS';

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-in fade-in duration-500 pb-20">
      <div className="bg-card p-8 md:p-12 rounded-[2rem] border border-border shadow-md text-center space-y-6">
        <div className="flex justify-center">
          {isSuccess ? (
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
              <XCircle className="h-12 w-12" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {isSuccess ? 'Thanh toán Thành công!' : 'Thanh toán Không thành công'}
          </h1>
          <p className="text-muted-foreground font-medium text-base">
            {isSuccess
              ? 'Đơn hàng của bạn đã được thanh toán thành công qua cổng VNPay.'
              : result?.message || 'Giao dịch bị hủy hoặc không thể hoàn tất.'}
          </p>
        </div>

        {/* Transaction Info Box */}
        {result && (
          <div className="bg-muted/30 p-5 rounded-2xl border border-border/50 text-sm space-y-2.5 text-left font-medium">
            {result.orderCode && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã đơn hàng:</span>
                <span className="font-bold text-foreground font-mono">{result.orderCode}</span>
              </div>
            )}
            {result.transactionNo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã giao dịch VNPay:</span>
                <span className="font-bold text-foreground font-mono">{result.transactionNo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái:</span>
              <span className={`font-bold ${isSuccess ? 'text-emerald-600' : 'text-destructive'}`}>
                {isSuccess ? 'ĐÃ THANH TOÁN (PAID)' : 'THẤT BẠI / ĐÃ HỦY'}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
          {isSuccess ? (
            <>
              <Button
                onClick={() => navigate('/orders')}
                className="rounded-xl h-12 px-6 font-bold shadow-sm"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Xem đơn hàng của tôi
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="rounded-xl h-12 px-6 font-bold"
              >
                Tiếp tục mua sắm
              </Button>
            </>
          ) : (
            <>
              {orderId && (
                <Button
                  onClick={handleRetryPayment}
                  disabled={retrying}
                  className="rounded-xl h-12 px-6 font-bold shadow-sm bg-primary text-primary-foreground"
                >
                  {retrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang kết nối VNPay...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Thử thanh toán lại
                    </>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="rounded-xl h-12 px-6 font-bold"
              >
                Về trang chủ
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
