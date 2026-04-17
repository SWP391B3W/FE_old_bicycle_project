import { useDeferredValue, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { inspectionsApi } from '@/api/inspections.api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { InspectionRequestItem } from '@/types/inspection'

const PAGE_SIZE = 8

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(value: string) {
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

export default function InspectionRequestsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery.trim())
  const [requests, setRequests] = useState<InspectionRequestItem[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadRequests() {
      setLoading(true)

      try {
        const result = await inspectionsApi.getRequests({
          keyword: deferredSearchQuery || undefined,
          page,
          size: PAGE_SIZE,
        })

        if (ignore) {
          return
        }

        setRequests(result.content)
        setTotalPages(result.totalPages)
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setRequests([])
        setTotalPages(0)
        setError(getErrorMessage(requestError, 'Không thể tải danh sách yêu cầu kiểm định.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadRequests()

    return () => {
      ignore = true
    }
  }, [deferredSearchQuery, page])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Yêu cầu kiểm định</h2>
        <p className="text-muted-foreground">
          Đây là hàng chờ dành cho inspector. Mỗi thẻ là một tin đăng đã được admin chuyển sang
          bước kiểm định.
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border bg-card p-4">
              <div className="flex gap-4">
                <div className="h-24 w-24 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))
        ) : requests.length ? (
          requests.map((request) => (
            <div key={request.inspectionId} className="rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-24 w-full overflow-hidden rounded-lg bg-muted sm:w-28">
                  {request.productImageUrl ? (
                    <img
                      src={request.productImageUrl}
                      alt={request.productTitle}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ClipboardList className="h-8 w-8 opacity-50" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{request.productTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        Người bán: {request.sellerName}
                        {request.sellerPhone ? ` · ${request.sellerPhone}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(request.productPrice)}
                    </p>
                  </div>

                  <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>Tỉnh thành: {request.province || 'Chưa cập nhật'}</p>
                    <p>Thời điểm chuyển kiểm định: {formatDateTime(request.requestedAt)}</p>
                  </div>

                  <div className="flex justify-end">
                    <Link to={`/inspector/inspect/${request.productId}`}>
                      <Button>Bắt đầu kiểm định</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            <ClipboardList className="mx-auto mb-4 h-10 w-10 opacity-40" />
            <p className="font-medium">Hiện chưa có yêu cầu kiểm định nào</p>
            <p className="mt-1 text-sm">
              Khi admin chuyển tin qua kiểm định, danh sách sẽ hiển thị ở đây.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((current) => current - 1)}
            disabled={page === 0}
          >
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
