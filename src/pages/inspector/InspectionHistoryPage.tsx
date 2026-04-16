import { useDeferredValue, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, History, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { inspectionsApi } from '@/api/inspections.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InspectionHistoryItem } from '@/types/inspection'

const PAGE_SIZE = 8

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
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

export default function InspectionHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery.trim())
  const [historyItems, setHistoryItems] = useState<InspectionHistoryItem[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadHistory() {
      setLoading(true)

      try {
        const result = await inspectionsApi.getHistory({
          keyword: deferredSearchQuery || undefined,
          page,
          size: PAGE_SIZE,
        })

        if (ignore) {
          return
        }

        setHistoryItems(result.content)
        setTotalPages(result.totalPages)
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setHistoryItems([])
        setTotalPages(0)
        setError(getErrorMessage(requestError, 'Không thể tải lịch sử kiểm định.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadHistory()

    return () => {
      ignore = true
    }
  }, [deferredSearchQuery, page])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Lịch sử kiểm định</h2>
        <p className="text-muted-foreground">
          Danh sách này lưu lại những xe đã được kiểm định xong cùng kết quả và thời gian đánh giá.
        </p>
      </div>

      <div className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => {
              setPage(0)
              setSearchQuery(event.target.value)
            }}
            placeholder="Tìm theo tên xe hoặc người bán"
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border bg-card p-4">
              <div className="flex gap-4">
                <div className="h-20 w-20 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))
        ) : historyItems.length ? (
          historyItems.map((inspection) => (
            <div key={inspection.inspectionId} className="rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-20 w-full overflow-hidden rounded-lg bg-muted sm:w-24">
                  {inspection.productImageUrl ? (
                    <img
                      src={inspection.productImageUrl}
                      alt={inspection.productTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <History className="h-8 w-8 opacity-40" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{inspection.productTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Người bán: {inspection.sellerName} · {formatCurrency(inspection.productPrice)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className={
                          inspection.passed
                            ? 'font-medium text-green-600'
                            : 'font-medium text-red-600'
                        }
                      >
                        {inspection.passed ? 'Đạt chuẩn' : 'Không đạt'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Điểm: {inspection.overallScore != null ? `${inspection.overallScore.toFixed(1)}/5` : '—'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>Đánh giá lúc: {formatDateTime(inspection.evaluatedAt)}</p>
                    <p>Còn hiệu lực đến: {formatDateTime(inspection.validUntil)}</p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {inspection.reportFileUrl && (
                      <a href={inspection.reportFileUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Xem báo cáo
                        </Button>
                      </a>
                    )}
                    <Link to={`/bikes/${inspection.productId}`}>
                      <Button variant="outline">Xem xe trên marketplace</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <History className="mx-auto mb-4 h-10 w-10 opacity-40" />
            <p className="font-medium">Chưa có lịch sử kiểm định</p>
            <p className="mt-1 text-sm">Sau khi hoàn thành đánh giá xe, kết quả sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setPage((current) => current - 1)} disabled={page === 0}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => current + 1)}
            disabled={page >= totalPages - 1}
          >
            Tiếp
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
