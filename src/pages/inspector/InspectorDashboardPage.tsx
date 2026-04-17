import { useEffect, useState } from 'react'
import { CheckCircle, ClipboardCheck, Clock, TrendingUp } from 'lucide-react'
import { inspectionsApi } from '@/api/inspections.api'
import { StatCard } from '@/components/dashboard/StatCard'
import { Button } from '@/components/ui/button'
import type { InspectionDashboard } from '@/types/inspection'

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatScore(value?: number | null) {
  if (value == null) {
    return '—'
  }

  return `${value.toFixed(1)}/5`
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data &&
    'message' in error.response.data &&
    typeof error.response.data.message === 'string'
  ) {
    return error.response.data.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export default function InspectorDashboardPage() {
  const [dashboard, setDashboard] = useState<InspectionDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadDashboard() {
      setLoading(true)

      try {
        const result = await inspectionsApi.getDashboard()

        if (ignore) {
          return
        }

        setDashboard(result)
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setDashboard(null)
        setError(getErrorMessage(requestError, 'Không thể tải tổng quan kiểm định lúc này.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      ignore = true
    }
  }, [])

  const stats = [
    {
      title: 'Yêu cầu chờ xử lý',
      value: dashboard?.pendingRequests ?? 0,
      icon: Clock,
    },
    {
      title: 'Đã kiểm định tuần này',
      value: dashboard?.completedThisWeek ?? 0,
      icon: ClipboardCheck,
    },
    {
      title: 'Tỷ lệ đạt chuẩn',
      value: dashboard ? `${dashboard.passRate.toFixed(1)}%` : '0%',
      icon: CheckCircle,
    },
    {
      title: 'Điểm trung bình',
      value: dashboard?.averageScore != null ? `${dashboard.averageScore.toFixed(1)}/5` : '—',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tổng quan kiểm định</h2>
        <p className="text-muted-foreground">
          Theo dõi nhanh các yêu cầu đang chờ, kết quả kiểm định gần đây và chất lượng đánh giá của bạn.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border bg-destructive/10 p-4 text-sm text-destructive">
          <div className="flex items-center justify-between gap-4">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold text-foreground">Kiểm định gần đây</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Danh sách này giúp inspector xem nhanh những xe vừa được đánh giá.
          </p>
        </div>

        <div className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between gap-4 p-4">
                <div className="space-y-2">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))
          ) : dashboard?.recentInspections?.length ? (
            dashboard.recentInspections.map((inspection) => (
              <div
                key={inspection.inspectionId}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{inspection.productTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    Người bán: {inspection.sellerName} · Điểm: {formatScore(inspection.overallScore)}
                  </p>
                </div>
                <div className="text-sm">
                  <span
                    className={
                      inspection.passed
                        ? 'font-medium text-green-600'
                        : 'font-medium text-red-600'
                    }
                  >
                    {inspection.passed ? 'Đạt chuẩn' : 'Không đạt'}
                  </span>
                  <p className="text-muted-foreground">{formatDateTime(inspection.evaluatedAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Chưa có lượt kiểm định nào được hoàn tất.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
