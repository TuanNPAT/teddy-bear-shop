import { useEffect, useState, useCallback, useMemo } from 'react';
import { orderApi } from '../api/orderApi';
import type { OrderResponse } from '../api/orderApi';
import { useAuthStore } from '../stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import OrderDetailModal from '../components/order/OrderDetailModal';
import { Skeleton } from '../components/ui/skeleton';
import ProductImageFallback from '../components/product/ProductImageFallback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ChevronRight,
  Calendar,
  Filter,
} from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type StatusFilter = 'all' | 'processing' | 'completed' | 'cancelled';

export default function OrderHistoryPage() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [orderIdToCancel, setOrderIdToCancel] = useState<number | null>(null);
  
  // Sort and Filter States
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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
    fetchOrders();
  }, [isAuthenticated, navigate, fetchOrders]);

  const confirmCancelOrder = async () => {
    if (!orderIdToCancel) return;
    try {
      await orderApi.cancelOrder(orderIdToCancel, 'Khách hàng tự hủy');
      toast.success('Đã hủy đơn hàng thành công');
      setOrderIdToCancel(null);
      
      // Update selected order details inside modal if it's currently open
      if (selectedOrder && selectedOrder.orderId === orderIdToCancel) {
        const updated = await orderApi.getOrderById(orderIdToCancel);
        setSelectedOrder(updated);
      }
      
      fetchOrders(); // Refresh list
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/25 rounded-full px-3 py-1 font-bold text-xs">Chờ xác nhận</Badge>;
      case 'PAID':
        return <Badge className="bg-cyan-500/10 text-cyan-600 border border-cyan-500/25 rounded-full px-3 py-1 font-bold text-xs">Đã thanh toán</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/25 rounded-full px-3 py-1 font-bold text-xs">Đã xác nhận</Badge>;
      case 'SHIPPING':
        return <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/25 rounded-full px-3 py-1 font-bold text-xs">Đang giao</Badge>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 rounded-full px-3 py-1 font-bold text-xs">Đã nhận hàng</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-destructive/10 text-destructive border border-destructive/25 rounded-full px-3 py-1 font-bold text-xs">Đã hủy</Badge>;
      case 'DELIVERY_FAILED':
        return <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/25 rounded-full px-3 py-1 font-bold text-xs">Giao thất bại</Badge>;
      default:
        return <Badge variant="outline" className="rounded-full px-3 py-1 font-bold text-xs">{status}</Badge>;
    }
  };

  // Dashboard Stats Calculations
  const stats = useMemo(() => {
    const totalOrdersCount = orders.length;
    
    // Total spent (excluding CANCELLED and DELIVERY_FAILED)
    const totalSpent = orders
      .filter(o => o.status !== 'CANCELLED' && o.status !== 'DELIVERY_FAILED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const completedCount = orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
    const processingCount = orders.filter(o => 
      ['PENDING', 'PAID', 'CONFIRMED', 'SHIPPING'].includes(o.status)
    ).length;

    return { totalSpent, totalOrdersCount, completedCount, processingCount };
  }, [orders]);

  // Filter & Sort Logic
  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Status Filter
    if (statusFilter === 'processing') {
      result = result.filter(o => ['PENDING', 'PAID', 'CONFIRMED', 'SHIPPING'].includes(o.status));
    } else if (statusFilter === 'completed') {
      result = result.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED');
    } else if (statusFilter === 'cancelled') {
      result = result.filter(o => o.status === 'CANCELLED' || o.status === 'DELIVERY_FAILED');
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'highest') {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === 'lowest') {
        return a.totalAmount - b.totalAmount;
      }
      return 0;
    });

    return result;
  }, [orders, statusFilter, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-16 px-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-60 rounded-xl" />
          <Skeleton className="h-6 w-96 rounded-xl" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
        </div>
        <div className="space-y-5">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 pb-16 px-4 text-left">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:p-10 rounded-[2.5rem] border border-primary/15 shadow-sm text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20"></div>
        <h1 className="text-4xl font-black tracking-tight text-foreground bg-clip-text">Lịch sử đơn hàng</h1>
        <p className="text-muted-foreground mt-3 font-medium text-sm md:text-base max-w-xl leading-relaxed">
          Theo dõi hành trình đơn hàng, xem chi tiết thanh toán và quản lý các giao dịch của bạn tại Teddy Shop.
        </p>
      </div>

      {/* Summary Statistics Grid (Taste Skill) */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {/* Total Spent */}
        <div className="bg-card hover:bg-card/85 p-5 rounded-[1.75rem] border border-border shadow-sm flex flex-col justify-between group transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tổng tích lũy</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600 group-hover:scale-105 transition-transform">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <h3 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight line-clamp-1">
              {formatPrice(stats.totalSpent)}
            </h3>
            <p className="text-[10px] text-muted-foreground/80 font-medium">Trừ đơn đã hủy & thất bại</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-card hover:bg-card/85 p-5 rounded-[1.75rem] border border-border shadow-sm flex flex-col justify-between group transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tổng đơn đặt</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600 group-hover:scale-105 transition-transform">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <h3 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">
              {stats.totalOrdersCount} đơn hàng
            </h3>
            <p className="text-[10px] text-muted-foreground/80 font-medium">Tất cả lịch sử mua sắm</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-card hover:bg-card/85 p-5 rounded-[1.75rem] border border-border shadow-sm flex flex-col justify-between group transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đơn hoàn thành</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <h3 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">
              {stats.completedCount} đơn hàng
            </h3>
            <p className="text-[10px] text-muted-foreground/80 font-medium">Đã giao tận tay bạn</p>
          </div>
        </div>

        {/* Processing */}
        <div className="bg-card hover:bg-card/85 p-5 rounded-[1.75rem] border border-border shadow-sm flex flex-col justify-between group transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Đang xử lý</span>
            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-600 group-hover:scale-105 transition-transform">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="space-y-1 text-left">
            <h3 className="text-lg md:text-xl font-extrabold text-foreground tracking-tight">
              {stats.processingCount} đơn hàng
            </h3>
            <p className="text-[10px] text-muted-foreground/80 font-medium">Đang chờ xác nhận / giao</p>
          </div>
        </div>
      </div>

      {/* Filter & Sort Controls Bar (Glassmorphism design) */}
      <div className="bg-card/65 backdrop-blur-md p-4 rounded-3xl border border-border shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/40 self-start md:self-auto">
          {(
            [
              { id: 'all', label: 'Tất cả' },
              { id: 'processing', label: 'Đang xử lý' },
              { id: 'completed', label: 'Đã nhận' },
              { id: 'cancelled', label: 'Hủy/Thất bại' },
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                statusFilter === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2.5 min-w-[200px] justify-end">
          <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5" /> Sắp xếp:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl bg-muted/40 border border-border/80 p-2 px-3 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary h-9 cursor-pointer w-full md:w-auto"
          >
            <option value="newest">Đặt gần nhất (Mới nhất)</option>
            <option value="oldest">Đặt đầu tiên (Cũ nhất)</option>
            <option value="highest">Giá trị đơn hàng: Cao nhất</option>
            <option value="lowest">Giá trị đơn hàng: Thấp nhất</option>
          </select>
        </div>
      </div>

      {/* Orders List Cards */}
      {filteredAndSortedOrders.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-[2rem] border border-border/50 shadow-inner">
          <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
            <Filter className="h-8 w-8" />
          </div>
          <p className="text-lg text-muted-foreground mb-4 font-semibold">Không tìm thấy đơn hàng phù hợp.</p>
          <Button onClick={() => navigate('/')} className="rounded-xl h-11 px-6 font-bold shadow-sm">Bắt đầu mua sắm</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedOrders.map(order => (
            <div
              key={order.orderId}
              onClick={() => setSelectedOrder(order)}
              className="group bg-card hover:bg-card/90 p-6 rounded-[2rem] border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col md:flex-row gap-6 justify-between items-stretch md:items-center text-left"
            >
              {/* Left detail column */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
                    Đơn hàng #{order.orderId}
                  </span>
                  {getStatusBadge(order.status)}
                </div>

                {/* Inline product thumbnail carousel */}
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
                  {order.orderDetails?.map((item: any, idx: number) => (
                    <div
                      key={item.orderDetailId || idx}
                      className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border/60 shrink-0 shadow-inner group-hover:scale-105 transition-transform"
                    >
                      {!item.productImageUrl ? (
                        <ProductImageFallback emojiClassName="text-xl" showText={false} />
                      ) : (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName || 'Bear'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Bear';
                          }}
                        />
                      )}
                      <span className="absolute bottom-0 right-0 bg-primary/95 text-primary-foreground font-black text-[9px] px-1 rounded-tl-lg shadow-sm border-t border-l border-primary/20">
                        x{item.quantity}
                      </span>
                    </div>
                  ))}
                  {order.orderDetails && order.orderDetails.length > 4 && (
                    <div className="w-12 h-12 rounded-xl bg-muted/60 border border-dashed border-border flex items-center justify-center text-[10px] font-black text-muted-foreground shrink-0">
                      +{order.orderDetails.length - 4}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground/90 text-left">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                    Đặt ngày {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span>•</span>
                  <span>{order.orderDetails?.length || 0} mẫu sản phẩm</span>
                </div>
              </div>

              {/* Right price / details column */}
              <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-border/50 gap-4 shrink-0">
                <div className="space-y-0.5 text-left md:text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Tổng thanh toán</span>
                  <p className="text-2xl font-black text-foreground text-primary">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/5 group-hover:bg-primary/10 px-3.5 py-2 rounded-xl transition-colors">
                  Chi tiết <ChevronRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onCancelOrder={(orderId) => setOrderIdToCancel(orderId)}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={orderIdToCancel !== null} onOpenChange={(open) => !open && setOrderIdToCancel(null)}>
        <AlertDialogContent className="rounded-3xl p-6 border-transparent shadow-xl max-w-md bg-card">
          <AlertDialogHeader className="sm:place-items-center">
            <AlertDialogTitle className="text-xl font-extrabold text-foreground w-full text-center sm:text-center">
              Xác nhận hủy đơn hàng
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed w-full text-center sm:text-center">
              Bạn có chắc muốn hủy đơn hàng #{orderIdToCancel}? Hành động này sẽ được ghi nhận và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 justify-center sm:justify-center">
            <AlertDialogCancel className="rounded-xl border border-border bg-background hover:bg-muted text-foreground h-11 font-semibold px-5 mt-0 w-full sm:w-auto">
              Không, giữ lại đơn
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrder}
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground h-11 font-semibold px-5 shadow-sm w-full sm:w-auto"
            >
              Hủy đơn hàng
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
