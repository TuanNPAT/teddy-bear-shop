import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import type { OrderResponse } from '../../api/orderApi';
import { paymentApi, type PaymentResponse } from '../../api/paymentApi';
import ProductImageFallback from '../product/ProductImageFallback';
import { Loader2 } from 'lucide-react';

interface OrderDetailModalProps {
  order: OrderResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    if (isOpen && order && order.paymentMethod === 'VNPAY') {
      setLoadingPayment(true);
      paymentApi
        .getPaymentByOrderId(order.orderId)
        .then((res) => setPaymentInfo(res))
        .catch(() => setPaymentInfo(null))
        .finally(() => setLoadingPayment(false));
    } else {
      setPaymentInfo(null);
    }
  }, [isOpen, order]);

  if (!order) return null;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': 
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 rounded-full px-3 py-1 font-bold text-xs border-transparent">Chờ xác nhận</Badge>;
      case 'PAID': 
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 rounded-full px-3 py-1 font-bold text-xs border-transparent">Đã thanh toán VNPay</Badge>;
      case 'CONFIRMED': 
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-full px-3 py-1 font-bold text-xs border-transparent">Đã xác nhận</Badge>;
      case 'SHIPPED': 
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100 rounded-full px-3 py-1 font-bold text-xs border-transparent">Đang giao</Badge>;
      case 'DELIVERED': 
        return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 rounded-full px-3 py-1 font-bold text-xs border-transparent text-white">Đã giao</Badge>;
      case 'CANCELLED': 
        return <Badge variant="destructive" className="rounded-full px-3 py-1 font-bold text-xs border-transparent bg-red-100 text-red-800 hover:bg-red-100">Đã hủy</Badge>;
      default: 
        return <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-xs">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl rounded-[2rem] p-6 md:p-8 border-transparent shadow-2xl bg-card overflow-hidden animate-in fade-in duration-300">
        <DialogHeader className="border-b border-border/60 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 text-left">
              <DialogTitle className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                Chi tiết đơn hàng #{order.orderId}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                Đặt ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
              </DialogDescription>
            </div>
            <div className="flex justify-start sm:justify-end shrink-0">
              {getStatusBadge(order.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 my-2">
          {/* Information Section Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="bg-muted/30 p-5 rounded-[1.25rem] border border-border/40 space-y-3 text-left">
              <p className="font-bold text-base text-foreground mb-1 flex items-center gap-2">
                🧸 Thông tin giao hàng
              </p>
              <div className="space-y-1.5 font-medium text-foreground/80">
                <p><span className="text-muted-foreground font-normal">Người nhận:</span> {order.customerName}</p>
                <p><span className="text-muted-foreground font-normal">Số điện thoại:</span> {order.customerPhone}</p>
                <p className="line-clamp-2"><span className="text-muted-foreground font-normal">Giao đến:</span> {order.shippingAddress}</p>
              </div>
            </div>

            <div className="bg-muted/30 p-5 rounded-[1.25rem] border border-border/40 space-y-3 text-left">
              <p className="font-bold text-base text-foreground mb-1 flex items-center gap-2">
                💳 Thanh toán & Trạng thái
              </p>
              <div className="space-y-1.5 font-medium text-foreground/80">
                <p>
                  <span className="text-muted-foreground font-normal">Phương thức:</span>{' '}
                  {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán qua VNPay'}
                </p>
                {loadingPayment ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-1">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span>Đang tải thông tin thanh toán VNPay...</span>
                  </div>
                ) : paymentInfo ? (
                  <>
                    <p>
                      <span className="text-muted-foreground font-normal">Trạng thái VNPay:</span>{' '}
                      {paymentInfo.status === 'SUCCESS' ? (
                        <span className="text-emerald-600 font-bold">ĐÃ THANH TOÁN (SUCCESS)</span>
                      ) : paymentInfo.status === 'FAILED' ? (
                        <span className="text-red-600 font-bold">THẤT BẠI (FAILED)</span>
                      ) : (
                        <span className="text-amber-600 font-bold">CHỜ THANH TOÁN (PENDING)</span>
                      )}
                    </p>
                    {paymentInfo.txnRef && (
                      <p>
                        <span className="text-muted-foreground font-normal">Mã tham chiếu (TxnRef):</span>{' '}
                        <span className="font-mono text-xs font-bold">{paymentInfo.txnRef}</span>
                      </p>
                    )}
                    {paymentInfo.transactionNo && (
                      <p>
                        <span className="text-muted-foreground font-normal">Mã giao dịch VNPay:</span>{' '}
                        <span className="font-mono text-xs font-bold">{paymentInfo.transactionNo}</span>
                      </p>
                    )}
                    {paymentInfo.paidAt && (
                      <p>
                        <span className="text-muted-foreground font-normal">Thời gian thanh toán:</span>{' '}
                        <span className="font-bold">{new Date(paymentInfo.paidAt).toLocaleString('vi-VN')}</span>
                      </p>
                    )}
                  </>
                ) : (
                  <p>
                    <span className="text-muted-foreground font-normal">Trạng thái thanh toán:</span>{' '}
                    {order.status === 'PAID' || order.status === 'DELIVERED' ? (
                      <span className="text-emerald-600 font-bold">Đã thanh toán</span>
                    ) : order.status === 'CANCELLED' ? (
                      <span className="text-red-600 font-bold">Đã hủy đơn</span>
                    ) : (
                      <span className="text-amber-600 font-bold">Chờ thanh toán</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="border border-border/40 rounded-[1.25rem] overflow-hidden bg-muted/10 max-h-[30vh] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-bold text-foreground py-3">Sản phẩm</TableHead>
                  <TableHead className="text-right font-bold text-foreground py-3">Đơn giá</TableHead>
                  <TableHead className="text-center font-bold text-foreground py-3">Số lượng</TableHead>
                  <TableHead className="text-right font-bold text-foreground py-3">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderDetails?.map((item: any) => (
                  <TableRow key={item.orderDetailId as React.Key} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-semibold text-foreground py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border/50 shrink-0 shadow-inner">
                          {!item.productImageUrl || imageErrors[item.orderDetailId] ? (
                            <ProductImageFallback emojiClassName="text-xl" showText={false} />
                          ) : (
                            <img 
                              src={item.productImageUrl} 
                              alt={item.productName || 'Product'} 
                              onError={() => setImageErrors((prev) => ({ ...prev, [item.orderDetailId]: true }))}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="line-clamp-1">{item.productName || `Sản phẩm #${item.productId}`}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-muted-foreground py-3.5">
                      {formatPrice(Number(item.price))}
                    </TableCell>
                    <TableCell className="text-center font-bold text-foreground py-3.5">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary py-3.5">
                      {formatPrice(Number(item.price) * Number(item.quantity))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pricing Totals */}
          <div className="flex justify-end pt-4 border-t border-border/60">
            <div className="text-right space-y-1.5">
              <div className="flex justify-between items-center gap-8 text-sm">
                <span className="text-muted-foreground font-medium">Tạm tính</span>
                <span className="text-foreground font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center gap-8 text-sm">
                <span className="text-muted-foreground font-medium">Phí vận chuyển</span>
                <span className="text-foreground font-bold text-emerald-600">Miễn phí</span>
              </div>
              <div className="flex justify-between items-center gap-8 pt-2 border-t border-border/40">
                <span className="text-base font-bold text-foreground">Tổng thanh toán</span>
                <span className="text-3xl font-extrabold text-primary">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
