import { useEffect, useState, useCallback } from 'react';
import { orderApi } from '../api/orderApi';
import type { OrderResponse } from '../api/orderApi';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import OrderDetailModal from '../components/order/OrderDetailModal';
import { Skeleton } from '../components/ui/skeleton';

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await orderApi.getMyOrders();
      setOrders(data);
    } catch {
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, [isAuthenticated, navigate, fetchOrders]);

  const handleCancelOrder = async (e: React.MouseEvent, orderId: number) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    
    try {
      await orderApi.cancelOrder(orderId, 'Khách hàng tự hủy');
      toast.success('Đã hủy đơn hàng thành công');
      fetchOrders(); // Refresh list
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Chờ xác nhận</Badge>;
      case 'CONFIRMED': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Đã xác nhận</Badge>;
      case 'SHIPPED': return <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Đang giao</Badge>;
      case 'DELIVERED': return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Đã giao</Badge>;
      case 'CANCELLED': return <Badge variant="destructive">Đã hủy</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Lịch sử đơn hàng</h1>
        <div className="space-y-5">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-[1.5rem]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Lịch sử đơn hàng</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-[1.5rem] border border-border shadow-sm">
          <p className="text-xl text-muted-foreground mb-6 font-medium">Bạn chưa có đơn hàng nào.</p>
          <Button onClick={() => navigate('/')} className="rounded-xl h-12 px-8 font-bold shadow-sm">Bắt đầu mua sắm</Button>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map(order => (
            <div 
              key={order.orderId} 
              className="bg-card p-6 md:p-8 rounded-[1.5rem] border border-border shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-4 mb-2">
                  <span className="font-extrabold text-xl text-foreground">Đơn hàng #{order.orderId}</span>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-sm font-medium text-muted-foreground">
                  {order.orderDetails?.length || 0} sản phẩm
                </p>
              </div>
              
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}
                </p>
                
                {order.status === 'PENDING' && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-xl font-bold px-6 shadow-sm"
                    onClick={(e) => handleCancelOrder(e, order.orderId)}
                  >
                    Hủy đơn
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderDetailModal 
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
