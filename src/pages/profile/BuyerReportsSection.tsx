import { useEffect, useState } from 'react'
import { reportsApi } from '@/api/reports.api'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, AlertCircle } from 'lucide-react'
import type { Report } from '@/types/report'

const statusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  investigating: 'Đang điều tra',
  resolved_upheld: 'Xác nhận vi phạm',
  resolved_dismissed: 'Bác bỏ báo cáo',
}

const reasonLabels: Record<string, string> = {
  fraud: 'Dấu hiệu lừa đảo',
  fake: 'Hàng giả, hàng nhái',
  wrong_description: 'Mô tả sai sự thật',
  spam: 'Tin rác, trùng lặp',
  other: 'Lý do khác',
}

export function BuyerReportsSection() {
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReports() {
      setIsLoading(true)
      try {
        const result = await reportsApi.getMine()
        setReports(result.content || [])
      } catch (err) {
        console.error('Failed to load reports:', err)
        setError('Không thể tải danh sách báo cáo.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadReports()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-destructive">
        <AlertCircle className="mb-2 h-10 w-10" />
        <p>{error}</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử báo cáo</CardTitle>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-muted-foreground">
            Bạn chưa gửi báo cáo nào.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {report.targetType === 'PRODUCT' ? 'Tin đăng' : 'Người dùng'}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      ID: {report.targetId.substring(0, 8)}...
                    </span>
                  </div>
                  <h4 className="font-medium text-foreground">
                    {reasonLabels[report.reason] ?? report.reason}
                  </h4>
                  {report.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{report.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Ngày gửi: {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-2 md:items-end">
                  <StatusBadge 
                    status={report.status} 
                    labelOverride={statusLabels[report.status]} 
                  />
                  {report.adminNote && (
                    <p className="max-w-xs text-right text-xs italic text-muted-foreground">
                      Phản hồi: {report.adminNote}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
