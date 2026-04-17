import { useEffect, useState } from 'react';
import {
  Clock3,
  DollarSign,
  FileText,
  Flag,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
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
  const monthlyGmv = stats?.monthlyGmv ?? stats?.monthlyRevenue ?? {};
  const monthlyRecognizedPlatformRevenue = stats?.monthlyRecognizedPlatformRevenue ?? {};
  const currentMonthlyGmv = monthlyGmv[currentMonthKey] ?? 0;
  const currentMonthlyPlatformRevenue =
    monthlyRecognizedPlatformRevenue[currentMonthKey] ?? 0;
  const currentMonthlyOrders = stats?.monthlyOrders?.[currentMonthKey] ?? 0;
  const totalGmv = stats?.totalGmv ?? stats?.totalRevenue ?? 0;
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tổng quan</h2>
        <p className="text-muted-foreground">
          Theo dõi quy mô giao dịch và doanh thu sàn theo đúng nghĩa dữ liệu.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-lg border border-border bg-card p-4"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && !error && stats && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statCards.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground">Kiểm định xe</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng kiểm định</span>
                  <span className="font-medium">{stats.totalInspections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Đạt</span>
                  <span className="font-medium text-green-600">
                    {stats.passedInspections}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">Không đạt</span>
                  <span className="font-medium text-red-600">
                    {stats.failedInspections}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">GMV tháng này</h3>
              </div>
              <p className="mt-3 text-2xl font-bold text-primary">
                {formatCurrency(currentMonthlyGmv)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Chỉ lấy tháng hiện tại: {currentMonthKey}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">
                  Doanh thu sàn tháng này
                </h3>
              </div>
              <p className="mt-3 text-2xl font-bold text-primary">
                {formatCurrency(currentMonthlyPlatformRevenue)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Chỉ tính phần phí sàn đã được ghi nhận
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Phí sàn bị reverse</h3>
              </div>
              <p className="mt-3 text-2xl font-bold text-primary">
                {formatCurrency(reversedPlatformFee)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Đơn hàng tháng này hoàn tất: {currentMonthlyOrders}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="font-semibold text-foreground">Lưu ý về số liệu</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              GMV là tổng giá trị xe của các giao dịch hoàn tất. Doanh thu sàn chỉ
              là phần phí sàn đã được ghi nhận sau khi giao dịch settled. Hai con số
              này không có cùng ý nghĩa.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
