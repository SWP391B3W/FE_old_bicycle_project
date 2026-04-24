// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import {
  Clock3,
  DollarSign,
  FileText,
  Flag,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Users,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
// @ts-ignore
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { StatCard } from '@/components/dashboard/StatCard';
import { dashboardApi } from '@/api/dashboard.api';
import type { DashboardStats } from '@/types/dashboard';

function getCurrentMonthKey() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M đ`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K đ`;
  return `${value} đ`;
}

function formatFullCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(setStats)
      .catch(() => setError('Không thể tải dữ liệu thống kê.'))
      .finally(() => setLoading(false));
  }, []);

  const currentMonthKey = getCurrentMonthKey();

  // Memoized data for charts
  const chartData = useMemo(() => {
    if (!stats) return [];
    
    const monthlyGmv = stats.monthlyGmv ?? stats.monthlyRevenue ?? {};
    const monthlyRevenue = stats.monthlyRecognizedPlatformRevenue ?? {};
    const monthlyOrders = stats.monthlyOrders ?? {};
    
    // Generate last 6 months keys
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = `${d.getMonth() + 1}`.padStart(2, '0');
      last6Months.push(`${d.getFullYear()}-${m}`);
    }
    
    // Get all unique month keys (merging last 6 months with any other existing data)
    const allMonths = Array.from(new Set([
      ...last6Months,
      ...Object.keys(monthlyGmv),
      ...Object.keys(monthlyRevenue),
      ...Object.keys(monthlyOrders)
    ])).sort();

    return allMonths.map(month => {
      const [year, m] = month.split('-');
      return {
        name: `T${m}/${year}`,
        gmv: monthlyGmv[month] || 0,
        revenue: monthlyRevenue[month] || 0,
        orders: monthlyOrders[month] || 0,
      };
    });
  }, [stats]);

  const inspectionData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Đạt', value: stats.passedInspections, color: '#10b981' },
      { name: 'Không đạt', value: stats.failedInspections, color: '#ef4444' },
    ];
  }, [stats]);

  const monthlyGmvMap = stats?.monthlyGmv ?? stats?.monthlyRevenue ?? {};
  const monthlyRecognizedPlatformRevenueMap = stats?.monthlyRecognizedPlatformRevenue ?? {};
  
  const currentMonthlyGmv = monthlyGmvMap[currentMonthKey] ?? 0;
  const currentMonthlyRevenue = monthlyRecognizedPlatformRevenueMap[currentMonthKey] ?? 0;
  
  const currentMonthlyOrders = stats?.monthlyOrders?.[currentMonthKey] ?? 0;
  const totalGmv = stats?.totalGmv ?? 0;
  const pendingPlatformFee = stats?.pendingPlatformFee ?? 0;
  const recognizedPlatformRevenue = stats?.recognizedPlatformRevenue ?? 0;
  const reversedPlatformFee = stats?.reversedPlatformFee ?? 0;

  const statCards = stats
    ? [
        {
          title: 'Tổng người dùng',
          value: stats.totalUsers.toLocaleString('vi-VN'),
          icon: Users,
        },
        {
          title: 'Tổng sản phẩm',
          value: stats.totalProducts.toLocaleString('vi-VN'),
          icon: FileText,
        },
        {
          title: 'Tổng đơn hàng',
          value: stats.totalOrders.toLocaleString('vi-VN'),
          icon: ShoppingCart,
        },
        {
          title: 'Tổng GMV',
          value: formatCurrency(totalGmv),
          icon: DollarSign,
          description: 'Tổng giá trị xe của các giao dịch hoàn tất',
        },
        {
          title: 'Phí sàn chờ ghi nhận',
          value: formatCurrency(pendingPlatformFee),
          icon: Clock3,
          description: 'Đã thu nhưng chưa được ghi nhận là doanh thu',
        },
        {
          title: 'Doanh thu sàn đã ghi nhận',
          value: formatCurrency(recognizedPlatformRevenue),
          icon: TrendingUp,
          description: 'Chỉ tính phần phí sàn đã settled',
        },
      ]
    : [];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Bảng điều khiển</h2>
        <p className="text-muted-foreground">
          Tổng quan về hoạt động kinh doanh, doanh thu và kiểm định trên hệ thống.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-border bg-card p-4"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statCards.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          {/* Charts Row 1: GMV & Revenue */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Doanh thu & GMV theo tháng
                  </h3>
                  <p className="text-sm text-muted-foreground">Theo dõi tăng trưởng giao dịch và phí sàn</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <span>GMV</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span>Doanh thu</span>
                  </div>
                </div>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={(value) => formatCurrency(value)}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        color: 'hsl(var(--foreground))',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: number) => [formatFullCurrency(value), '']}
                    />
                    <Bar 
                      dataKey="gmv" 
                      name="GMV"
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                    />
                    <Bar 
                      dataKey="revenue" 
                      name="Doanh thu"
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Tỷ lệ kiểm định
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inspectionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {inspectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-emerald-700">Đạt yêu cầu</span>
                  </div>
                  <span className="font-bold text-emerald-700">{stats.passedInspections}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="text-sm font-medium text-rose-700">Không đạt</span>
                  </div>
                  <span className="font-bold text-rose-700">{stats.failedInspections}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Stats Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Flag className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">GMV tháng này</h3>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(currentMonthlyGmv)}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Tháng {currentMonthKey.split('-')[1]}/{currentMonthKey.split('-')[0]}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground">
                  Doanh thu tháng này
                </h3>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(currentMonthlyRevenue)}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Đã ghi nhận trong tháng
                </span>
              </div>
            </div>

          </div>

          {/* Data Note */}
          <div className="rounded-xl border border-border bg-muted/30 p-6 flex items-start gap-4">
             <div className="p-2 bg-foreground/5 rounded-full mt-1">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
             </div>
             <div>
                <p className="font-semibold text-foreground">Lưu ý về số liệu</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  GMV (Gross Merchandise Value) là tổng giá trị xe của các giao dịch hoàn tất. 
                  Doanh thu sàn là phần phí dịch vụ đã được ghi nhận sau khi giao dịch thành công. 
                  Dữ liệu được cập nhật theo thời gian thực từ hệ thống.
                </p>
             </div>
          </div>
        </>
      )}
    </div>
  );
}

