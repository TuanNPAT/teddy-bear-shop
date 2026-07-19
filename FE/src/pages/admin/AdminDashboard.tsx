import { useEffect, useState } from 'react';
import { cmsMockApi } from '../../api/cmsMockApi';
import { toast } from 'sonner';
import { DollarSign, ShoppingBag, Clock, TrendingUp } from 'lucide-react';
import { Skeleton } from '../../components/ui/skeleton';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  trendCharts: { date: string; revenue: number }[];
  topProducts: {
    id: number;
    name: string;
    quantity: number;
    image: string;
    price: number;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await cmsMockApi.getDashboardData();
        setStats(data);
      } catch {
        toast.error('Không thể tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-60 rounded-xl" />
          <Skeleton className="h-6 w-96 rounded-xl" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-[1.5rem]" />
          <Skeleton className="h-32 rounded-[1.5rem]" />
          <Skeleton className="h-32 rounded-[1.5rem]" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2 rounded-[1.5rem]" />
          <Skeleton className="h-96 rounded-[1.5rem]" />
        </div>
      </div>
    );
  }

  // Aggregate trend charts data based on selected filter
  const getFilteredChartData = () => {
    if (!stats || !stats.trendCharts) return [];
    
    // Default: last 7 days of daily records or aggregate by range
    const data = [...stats.trendCharts];
    if (timeRange === 'day') {
      return data.slice(-7);
    } else if (timeRange === 'week') {
      // Group by weeks or simply mock 4 weeks
      return data.slice(-14); // Last 14 days
    } else {
      // Last 30 days
      return data.slice(-30);
    }
  };

  const chartData = getFilteredChartData();

  // Helper for drawing SVG Chart coordinates
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1000000);
  const chartHeight = 180;
  const chartWidth = 500;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const points = chartData.map((d, index) => {
    const x = paddingLeft + (index / Math.max(chartData.length - 1, 1)) * (chartWidth - paddingLeft - paddingRight);
    const y = chartHeight - paddingBottom - (d.revenue / maxRevenue) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, date: d.date, revenue: d.revenue };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Theo dõi hiệu quả kinh doanh, doanh thu và đơn hàng của Teddy Shop.
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          {(['day', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                timeRange === range
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range === 'day' ? 'Hàng ngày' : range === 'week' ? 'Hàng tuần' : 'Hàng tháng'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Revenue */}
        <div className="relative overflow-hidden bg-card p-6 rounded-[1.5rem] border border-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tổng doanh thu</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {formatPrice(stats?.totalRevenue || 0)}
            </h3>
            <p className="text-xs text-primary font-bold flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Chỉ tính các đơn đã hoàn thành
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden bg-card p-6 rounded-[1.5rem] border border-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Tổng đơn hàng</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {stats?.totalOrders || 0}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">Tất cả các đơn trên hệ thống</p>
          </div>
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="relative overflow-hidden bg-card p-6 rounded-[1.5rem] border border-border shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Đơn chờ duyệt</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {stats?.pendingOrders || 0}
            </h3>
            <p className="text-xs text-amber-600 font-bold">Cần gọi điện xác nhận ngay</p>
          </div>
          <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform duration-300">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid Charts & Table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* SVG Chart */}
        <div className="bg-card p-6 rounded-[1.5rem] border border-border shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <h3 className="text-lg font-bold text-foreground">Xu hướng doanh thu</h3>
            <span className="text-xs font-semibold text-muted-foreground">
              Đơn vị: VND
            </span>
          </div>

          <div className="relative h-[220px] w-full">
            {chartData.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-muted-foreground bg-muted/20 rounded-xl">
                Chưa có đơn hàng hoàn thành để vẽ biểu đồ
              </div>
            ) : (
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary, #ea580c)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--color-primary, #ea580c)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = paddingTop + ratio * (chartHeight - paddingTop - paddingBottom);
                  const value = maxRevenue * (1 - ratio);
                  return (
                    <g key={i} className="opacity-40">
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke="currentColor"
                        className="text-border"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 4}
                        textAnchor="end"
                        fontSize="9"
                        className="fill-muted-foreground font-semibold"
                      >
                        {formatPrice(value).replace(' ₫', '')}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {points.map((p, i) => {
                  if (points.length > 10 && i % 3 !== 0) return null;
                  return (
                    <text
                      key={i}
                      x={p.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="9"
                      className="fill-muted-foreground font-semibold"
                    >
                      {p.date.substring(5)}
                    </text>
                  );
                })}

                {/* Shaded Area */}
                {areaPath && <path d={areaPath} fill="url(#chartGrad)" />}

                {/* Plot line */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="var(--color-primary, #ea580c)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {/* Interactive circles */}
                {points.map((p, i) => (
                  <g key={i} className="group/dot cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      className="fill-primary stroke-card stroke-2"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="9"
                      className="fill-primary/20 opacity-0 group-hover/dot:opacity-100 transition-opacity"
                    />
                    <title>{`${p.date}: ${formatPrice(p.revenue)}`}</title>
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>

        {/* Top 5 Products Table */}
        <div className="bg-card p-6 rounded-[1.5rem] border border-border shadow-sm space-y-4">
          <div className="border-b border-border/50 pb-4">
            <h3 className="text-lg font-bold text-foreground">Top 5 bán chạy</h3>
          </div>

          <div className="space-y-4">
            {(!stats || stats.topProducts.length === 0) ? (
              <div className="text-center py-10 text-sm font-semibold text-muted-foreground">
                Chưa có dữ liệu bán hàng
              </div>
            ) : (
              stats.topProducts.map((prod, idx) => (
                <div key={prod.id} className="flex items-center gap-3 group">
                  <span className="text-sm font-extrabold text-muted-foreground/60 w-5">
                    #{idx + 1}
                  </span>
                  <div className="h-12 w-12 rounded-xl bg-muted/30 overflow-hidden flex-shrink-0 border border-border">
                    {prod.image ? (
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/100x100?text=Bear';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-foreground truncate" title={prod.name}>
                      {prod.name}
                    </h4>
                    <p className="text-xs font-semibold text-muted-foreground">
                      Đã bán: <span className="text-foreground font-bold">{prod.quantity}</span> sản phẩm
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(prod.price)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
