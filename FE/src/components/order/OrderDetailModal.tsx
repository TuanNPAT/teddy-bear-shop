import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import type { OrderResponse } from '../../api/orderApi';

interface OrderDetailModalProps {
  order: OrderResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Chi tiết đơn hàng #{order.orderId}</DialogTitle>
          <DialogDescription>
            Đặt ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-2xl border border-border/50">
            <div>
              <p className="text-muted-foreground mb-1">Người nhận</p>
              <p className="font-semibold">{order.customerName}</p>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Giao đến</p>
              <p className="font-medium">{order.shippingAddress}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Thanh toán</p>
              <p className="font-medium">{order.paymentMethod === 'COD' ? 'Khi nhận hàng (COD)' : 'VNPay'}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Trạng thái</p>
              <Badge variant={order.status === 'PENDING' ? 'secondary' : order.status === 'DELIVERED' ? 'default' : order.status === 'CANCELLED' ? 'destructive' : 'outline'}>
                {order.status}
              </Badge>
            </div>
          </div>

          <div className="border rounded-2xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.orderDetails?.map((item: any) => (
                  <TableRow key={item.orderDetailId as React.Key}>
                    <TableCell className="font-medium">{item.productName || `Sản phẩm #${item.productId}`}</TableCell>
                    <TableCell className="text-right">{formatPrice(Number(item.price))}</TableCell>
                    <TableCell className="text-center">{Number(item.quantity)}</TableCell>
                    <TableCell className="text-right">{formatPrice(Number(item.price) * Number(item.quantity))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <div className="text-right space-y-2">
              <p className="text-muted-foreground text-sm">Tổng cộng</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(order.totalAmount)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
