import { useEffect, useState } from 'react';
import { orderApi } from '../../api/orderApi';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Search, Eye, ArrowRight, Info } from 'lucide-react';

interface OrderItem {
  orderDetailId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  price: number;
  quantity: number;
}

interface Order {
  orderId: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status:
    | 'PENDING'
    | 'PAID'
    | 'CONFIRMED'
    | 'SHIPPING'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'DELIVERY_FAILED';
  paymentMethod: 'COD' | 'VNPAY';
  createdAt: string;
  orderDetails: OrderItem[];
  cancelReason?: string | null;
}

export default function AdminOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  // Search & Filter
  const [orderCodeFilter, setOrderCodeFilter] = useState('');
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [customerPhoneFilter, setCustomerPhoneFilter] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');
  
  // Default to PENDING if user is STAFF, otherwise ALL
  const [statusFilter, setStatusFilter] = useState<string>(
    user?.role === 'STAFF' ? 'PENDING' : ''
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Cancel input
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        size: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      };

      if (orderCodeFilter.trim()) params.orderCode = orderCodeFilter.trim();
      if (statusFilter) params.status = statusFilter;
      if (customerNameFilter.trim()) params.customerName = customerNameFilter.trim();
      if (customerPhoneFilter.trim()) params.customerPhone = customerPhoneFilter.trim();
      if (fromDateFilter) params.fromDate = fromDateFilter + 'T00:00:00';
      if (toDateFilter) params.toDate = toDateFilter + 'T23:59:59';

      const data = await orderApi.getOrders(params);
      setOrders((data.content as any) || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, fromDateFilter, toDateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchOrders();
  };

  const handleResetFilters = () => {
    setOrderCodeFilter('');
    setCustomerNameFilter('');
    setCustomerPhoneFilter('');
    setFromDateFilter('');
    setToDateFilter('');
    setStatusFilter(user?.role === 'STAFF' ? 'PENDING' : '');
    setCurrentPage(0);
  };

  // Status transitions
  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    try {
      const updatedOrder = await orderApi.updateOrderStatus(orderId, nextStatus);
      toast.success(`Đã cập nhật trạng thái đơn hàng sang: ${translateStatus(nextStatus)}`);
      
      // Update local modals & tables
      setSelectedOrder(updatedOrder as any);
      setOrders(prev => prev.map(o => o.orderId === orderId ? (updatedOrder as any) : o));
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại');
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }
    try {
      await orderApi.cancelOrder(orderId, cancelReason);
      toast.success('Đã hủy đơn hàng thành công');
      
      // Close cancel input and reload details
      setShowCancelInput(false);
      setCancelReason('');
      
      // Reload order details
      const updatedOrder = await orderApi.getOrderById(orderId);
      setSelectedOrder(updatedOrder as any);
      setOrders(prev => prev.map(o => o.orderId === orderId ? (updatedOrder as any) : o));
      fetchOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hủy đơn hàng thất bại');
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'PAID': return 'Đã thanh toán (VNPay)';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'SHIPPING': return 'Đang giao hàng';
      case 'DELIVERED': return 'Đã giao hàng';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      case 'DELIVERY_FAILED': return 'Giao hàng thất bại';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-500/15 text-amber-600 border-amber-500/10';
      case 'PAID':
        return 'bg-cyan-500/15 text-cyan-600 border-cyan-500/10';
      case 'CONFIRMED':
        return 'bg-blue-500/15 text-blue-600 border-blue-500/10';
      case 'SHIPPING':
        return 'bg-purple-500/15 text-purple-600 border-purple-500/10';
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-emerald-500/15 text-emerald-600 border-emerald-500/10';
      case 'CANCELLED':
        return 'bg-destructive/15 text-destructive border-destructive/10';
      case 'DELIVERY_FAILED':
        return 'bg-orange-500/15 text-orange-600 border-orange-500/10';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  /**
   * Trả về danh sách các trạng thái TIẾN hợp lệ tiếp theo.
   * - COD: PENDING → CONFIRMED → SHIPPING → DELIVERED → COMPLETED
   *   (không có PAID — đơn COD không qua cổng thanh toán)
   * - VNPAY: PENDING → PAID → CONFIRMED → SHIPPING → DELIVERED → COMPLETED
   *   (PAID được set tự động bởi VNPay callback ở backend)
   * - CANCELLED: được phép từ bất kỳ bước nào TRƯỚC DELIVERED/COMPLETED/CANCELLED
   * - DELIVERY_FAILED: không có next status (terminal state cần xử lý thủ công)
   */
  const getNextStatuses = (currentStatus: string, paymentMethod: string): string[] => {
    const isCOD = paymentMethod === 'COD';

    const COD_FLOW: Record<string, string[]> = {
      PENDING: ['CONFIRMED'],
      CONFIRMED: ['SHIPPING'],
      SHIPPING: ['DELIVERED', 'DELIVERY_FAILED'],
      DELIVERED: ['COMPLETED'],
      // Terminal states — no forward transition
      COMPLETED: [],
      CANCELLED: [],
      DELIVERY_FAILED: [],
    };

    const VNPAY_FLOW: Record<string, string[]> = {
      PENDING: ['PAID'],       // Normally PAID is set by VNPay callback automatically
      PAID: ['CONFIRMED'],
      CONFIRMED: ['SHIPPING'],
      SHIPPING: ['DELIVERED', 'DELIVERY_FAILED'],
      DELIVERED: ['COMPLETED'],
      // Terminal states
      COMPLETED: [],
      CANCELLED: [],
      DELIVERY_FAILED: [],
    };

    const flow = isCOD ? COD_FLOW : VNPAY_FLOW;
    return flow[currentStatus] ?? [];
  };

  /** Có thể hủy đơn khi chưa đến trạng thái terminal */
  const canCancel = (status: string): boolean => {
    return !['DELIVERED', 'COMPLETED', 'CANCELLED', 'DELIVERY_FAILED'].includes(status);
  };

  const getNextStatusLabel = (status: string): string => {
    switch (status) {
      case 'CONFIRMED': return 'Xác nhận đơn hàng';
      case 'PAID': return 'Đánh dấu đã thanh toán VNPay';
      case 'SHIPPING': return 'Bàn giao vận chuyển';
      case 'DELIVERED': return 'Hoàn thành giao hàng';
      case 'COMPLETED': return 'Đánh dấu hoàn thành';
      case 'DELIVERY_FAILED': return 'Báo giao hàng thất bại';
      default: return translateStatus(status);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const viewOrderDetails = async (order: Order) => {
    setDetailLoading(true);
    try {
      const freshDetail = await orderApi.getOrderById(order.orderId);
      setSelectedOrder(freshDetail as any);
      setShowCancelInput(false);
      setCancelReason('');
      setIsModalOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Quản lý Đơn hàng</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Duyệt và xử lý đơn hàng, theo dõi luồng trạng thái từ người bán đến người mua.
        </p>
      </div>

      {/* Staff Banner Indicator */}
      {user?.role === 'STAFF' && (
        <div className="flex gap-2.5 bg-primary/10 border border-primary/20 p-4 rounded-xl text-primary text-xs font-bold">
          <Info className="h-4 w-4 shrink-0" />
          <span>Bạn đang đăng nhập với vai trò NHÂN VIÊN. Danh sách đơn hàng mặc định chỉ hiển thị trạng thái chờ duyệt (Pending).</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-card p-6 rounded-[1.5rem] border border-border shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Mã đơn hàng</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ví dụ: ORD..."
                value={orderCodeFilter}
                onChange={(e) => setOrderCodeFilter(e.target.value)}
                className="rounded-xl bg-muted/20 border-border h-11 pl-9 shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Tên khách hàng</Label>
            <Input
              placeholder="Nhập tên khách..."
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
              className="rounded-xl bg-muted/20 border-border h-11 shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Số điện thoại</Label>
            <Input
              placeholder="Nhập số điện thoại..."
              value={customerPhoneFilter}
              onChange={(e) => setCustomerPhoneFilter(e.target.value)}
              className="rounded-xl bg-muted/20 border-border h-11 shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Trạng thái</Label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full rounded-xl bg-muted/20 border border-border p-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary h-11"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="PAID">Đã thanh toán VNPay</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="SHIPPING">Đang giao hàng</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="DELIVERY_FAILED">Giao hàng thất bại</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Từ ngày</Label>
            <Input
              type="date"
              value={fromDateFilter}
              onChange={(e) => {
                setFromDateFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="rounded-xl bg-muted/20 border-border h-11 px-4 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Đến ngày</Label>
            <Input
              type="date"
              value={toDateFilter}
              onChange={(e) => {
                setToDateFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="rounded-xl bg-muted/20 border-border h-11 px-4 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              className="rounded-xl h-11 px-5 font-bold animate-all"
            >
              Đặt lại bộ lọc
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-11 px-6 font-bold"
            >
              Lọc kết quả
            </Button>
          </div>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-[1.5rem] border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground animate-pulse">
            Đang tải dữ liệu đơn hàng...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-sm font-semibold text-muted-foreground">
            Không tìm thấy đơn hàng nào tương ứng
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="p-5 text-sm font-bold text-muted-foreground w-36">Mã đơn hàng</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground">Khách hàng</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-28">Số điện thoại</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-32">Thanh toán</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-32">Tổng tiền</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground w-36 text-center">Trạng thái</th>
                  <th className="p-5 text-sm font-bold text-muted-foreground text-right w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map(order => (
                  <tr key={order.orderId} className="hover:bg-muted/10 transition-colors duration-200">
                    <td className="p-5 font-mono font-bold text-foreground">
                      {order.orderCode}
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-foreground">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : ''}
                      </div>
                    </td>
                    <td className="p-5 text-sm font-semibold text-muted-foreground">
                      {order.customerPhone || 'N/A'}
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-bold text-foreground">
                        {order.paymentMethod === 'COD' ? 'Khi nhận hàng' : 'VNPay Online'}
                      </span>
                    </td>
                    <td className="p-5 text-sm font-extrabold text-foreground">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={detailLoading}
                        onClick={() => viewOrderDetails(order)}
                        className="rounded-lg hover:bg-muted font-bold text-primary disabled:opacity-50"
                      >
                        {detailLoading ? '...' : <Eye className="h-4 w-4" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="rounded-xl"
          >
            Trước
          </Button>
          <span className="text-sm font-bold text-muted-foreground px-4">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="rounded-xl"
          >
            Sau
          </Button>
        </div>
      )}

      {/* Fulfillments Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-card p-8 rounded-[1.5rem] border border-border shadow-lg space-y-6 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-border/50 pb-4">
              <div>
                <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Chi tiết đơn hàng</h3>
                <p className="text-xs font-mono text-muted-foreground mt-1">Mã đơn: {selectedOrder.orderCode}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusBadgeClass(selectedOrder.status)}`}>
                {translateStatus(selectedOrder.status)}
              </span>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-5 rounded-2xl border border-border/50 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Người nhận hàng</span>
                <p className="font-bold text-foreground">{selectedOrder.customerName}</p>
                <p className="font-semibold text-muted-foreground">{selectedOrder.customerPhone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Địa chỉ nhận hàng</span>
                <p className="font-semibold text-foreground leading-relaxed">{selectedOrder.shippingAddress}</p>
              </div>
            </div>

            {/* Ordered Items list */}
            <div className="space-y-3">
              <span className="text-sm font-bold text-foreground">Danh sách thú bông đặt hàng ({selectedOrder.orderDetails?.length || 0})</span>
              <div className="divide-y divide-border/50 border border-border/60 rounded-2xl overflow-hidden bg-card">
                {selectedOrder.orderDetails?.map(item => (
                  <div key={item.orderDetailId} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl overflow-hidden border border-border bg-muted/20 flex-shrink-0">
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Bear';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Số lượng: <span className="font-bold text-foreground">{item.quantity}</span> x {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {(() => {
                        const p = Number(item.price);
                        const q = Number(item.quantity);
                        return !isNaN(p * q) ? formatPrice(p * q) : '—';
                      })()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Summary */}
            <div className="flex justify-between items-center bg-muted/10 p-5 rounded-2xl border border-border/40">
              <span className="text-sm font-bold text-muted-foreground">Tổng số tiền thanh toán</span>
              <span className="text-2xl font-extrabold text-foreground">{formatPrice(selectedOrder.totalAmount)}</span>
            </div>

            {/* Cancellation reason if cancelled */}
            {selectedOrder.status === 'CANCELLED' && selectedOrder.cancelReason && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive text-sm leading-relaxed">
                <span className="font-bold">Lý do hủy đơn:</span> {selectedOrder.cancelReason}
              </div>
            )}

            {/* Linear Workflow status actions */}
            <div className="pt-4 border-t border-border/50 flex flex-col gap-3">
              {/* Payment method indicator */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold">Phương thức thanh toán:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold border text-xs ${
                  selectedOrder.paymentMethod === 'COD'
                    ? 'bg-amber-500/10 text-amber-700 border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20'
                }`}>
                  {selectedOrder.paymentMethod === 'COD' ? '💵 COD (Tiền mặt khi nhận)' : '🏦 VNPay (Online)'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">Trình tự xử lý đơn hàng</span>

                <div className="flex gap-2 flex-wrap justify-end">
                  {/* Cancel: allowed if not yet in terminal state */}
                  {canCancel(selectedOrder.status) && !showCancelInput && (
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelInput(true)}
                      className="rounded-xl border-destructive/25 text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                    >
                      Hủy đơn hàng
                    </Button>
                  )}

                  {/* Dynamic next-status buttons based on payment method */}
                  {getNextStatuses(selectedOrder.status, selectedOrder.paymentMethod).map(nextStatus => (
                    <Button
                      key={nextStatus}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId, nextStatus)}
                      className={`rounded-xl font-bold ${
                        nextStatus === 'DELIVERED' || nextStatus === 'COMPLETED'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      {getNextStatusLabel(nextStatus)}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ))}

                  {/* Terminal state message */}
                  {getNextStatuses(selectedOrder.status, selectedOrder.paymentMethod).length === 0
                    && !canCancel(selectedOrder.status) && (
                    <span className="text-xs font-semibold text-muted-foreground italic">
                      Đơn hàng đã kết thúc
                    </span>
                  )}
                </div>
              </div>

              {/* Cancel Input form block */}
              {showCancelInput && (
                <div className="bg-muted/30 p-5 rounded-2xl border border-border/60 space-y-3.5 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="space-y-1.5">
                    <Label htmlFor="cancelReasonInput" className="font-semibold text-foreground">Lý do hủy đơn *</Label>
                    <Input
                      id="cancelReasonInput"
                      placeholder="Nhập lý do hủy đơn hàng (Ví dụ: Khách báo đặt nhầm, shipper không liên lạc được...)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="rounded-xl bg-card border-border h-12 px-4 shadow-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2.5">
                    <Button variant="ghost" className="rounded-xl h-10 px-4" onClick={() => setShowCancelInput(false)}>
                      Hủy bỏ
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelOrder(selectedOrder.orderId)}
                      className="rounded-xl h-10 px-4 font-bold"
                    >
                      Xác nhận Hủy Đơn
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Cancel/Close detail modal */}
            {!showCancelInput && (
              <div className="flex justify-end pt-2">
                <Button variant="ghost" className="rounded-xl h-12 px-6" onClick={() => setIsModalOpen(false)}>
                  Đóng lại
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
