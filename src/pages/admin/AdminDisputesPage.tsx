import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  Search,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { refundsApi } from '@/api/refunds.api'
import { DataTable } from '@/components/dashboard/DataTable'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { OrderEvidenceSection } from '@/components/profile/OrderEvidenceSection'
import { RefundEvidenceSection } from '@/components/profile/RefundEvidenceSection'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { AdminRefund, RefundStatus } from '@/types/refund'

type StatusFilter = 'all' | RefundStatus

const PAGE_SIZE = 10

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'approved', label: 'Đã duyệt hoàn tiền' },
  { value: 'rejected', label: 'Đã từ chối' },
  { value: 'completed', label: 'Đã hoàn tiền' },
]

const reviewLabels: Record<RefundStatus, string> = {
  pending: 'Chờ xử lý',
  approved: 'Duyệt hoàn tiền',
  rejected: 'Từ chối hoàn tiền',
  completed: 'Xác nhận đã hoàn tiền',
}

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

export default function AdminDisputesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery.trim())
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [refunds, setRefunds] = useState<AdminRefund[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; refund: AdminRefund | null }>({
    open: false,
    refund: null,
  })
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean
    refund: AdminRefund | null
    nextStatus: RefundStatus
    adminNote: string
    refundReference: string
    loading: boolean
  }>({
    open: false,
    refund: null,
    nextStatus: 'approved',
    adminNote: '',
    refundReference: '',
    loading: false,
  })

  useEffect(() => {
    let ignore = false

    async function loadRefunds() {
      setLoading(true)

      try {
        const result = await refundsApi.getAll({
          keyword: deferredSearchQuery || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          page,
          size: PAGE_SIZE,
        })

        if (ignore) {
          return
        }

        setRefunds(result.content)
        setTotalPages(result.totalPages)
        setTotalElements(result.totalElements)
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setRefunds([])
        setTotalPages(0)
        setTotalElements(0)
        setError(getErrorMessage(requestError, 'Không thể tải danh sách tranh chấp lúc này.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadRefunds()

    return () => {
      ignore = true
    }
  }, [deferredSearchQuery, page, statusFilter])

  const reviewDialogTitle = useMemo(() => reviewLabels[reviewDialog.nextStatus], [reviewDialog.nextStatus])

  const emptyMessage = useMemo(() => {
    if (deferredSearchQuery || statusFilter !== 'all') {
      return 'Không tìm thấy yêu cầu tranh chấp phù hợp.'
    }

    return 'Chưa có yêu cầu tranh chấp nào.'
  }, [deferredSearchQuery, statusFilter])

  function openReviewDialog(refund: AdminRefund, nextStatus: RefundStatus) {
    setReviewDialog({
      open: true,
      refund,
      nextStatus,
      adminNote: '',
      refundReference: '',
      loading: false,
    })
  }

  async function reloadRefunds() {
    const result = await refundsApi.getAll({
      keyword: deferredSearchQuery || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      size: PAGE_SIZE,
    })

    setRefunds(result.content)
    setTotalPages(result.totalPages)
    setTotalElements(result.totalElements)
    setError(null)
  }

  async function handleReviewRefund() {
    if (!reviewDialog.refund) {
      return
    }

    setReviewDialog((current) => ({ ...current, loading: true }))

    try {
      await refundsApi.review(reviewDialog.refund.id, {
        status: reviewDialog.nextStatus,
        adminNote: reviewDialog.adminNote.trim() || undefined,
        refundReference:
          reviewDialog.nextStatus === 'completed'
            ? reviewDialog.refundReference.trim() || undefined
            : undefined,
      })

      await reloadRefunds()
      setReviewDialog({
        open: false,
        refund: null,
        nextStatus: 'approved',
        adminNote: '',
        refundReference: '',
        loading: false,
      })
    } catch (requestError) {
      setReviewDialog((current) => ({ ...current, loading: false }))
      setError(getErrorMessage(requestError, 'Không thể cập nhật yêu cầu hoàn tiền lúc này.'))
    }
  }

  const columns: ColumnDef<AdminRefund>[] = [
    {
      accessorKey: 'orderId',
      header: 'Đơn hàng',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.productTitle ?? 'Sản phẩm không xác định'}</p>
          <p className="text-xs text-muted-foreground">Mã đơn: {row.original.orderId}</p>
        </div>
      ),
    },
    {
      id: 'participants',
      header: 'Người mua / bán',
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p>
            Buyer: <span className="font-medium text-foreground">{row.original.buyerName ?? '—'}</span>
          </p>
          <p className="text-muted-foreground">
            Seller: <span className="font-medium text-foreground">{row.original.sellerName ?? '—'}</span>
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Số tiền',
      cell: ({ row }) => formatCurrency(row.original.amount),
    },
    {
      accessorKey: 'hasInspection',
      header: 'Kiểm định',
      cell: ({ row }) => (
        <span className={row.original.hasInspection ? 'text-primary' : 'text-muted-foreground'}>
          {row.original.hasInspection ? 'Có báo cáo kiểm định' : 'Không có báo cáo kiểm định'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Ngày tạo',
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setDetailDialog({ open: true, refund: row.original })}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>

            {row.original.status === 'pending' && (
              <>
                <DropdownMenuItem onClick={() => openReviewDialog(row.original, 'approved')}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Duyệt hoàn tiền
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openReviewDialog(row.original, 'rejected')}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối yêu cầu
                </DropdownMenuItem>
              </>
            )}

            {row.original.status === 'approved' && (
              <DropdownMenuItem onClick={() => openReviewDialog(row.original, 'completed')}>
                <ShieldAlert className="mr-2 h-4 w-4" />
                Xác nhận đã hoàn tiền
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Giải quyết tranh chấp</h2>
        <p className="text-muted-foreground">
          Quản lý các yêu cầu hoàn tiền và tranh chấp phát sinh từ giao dịch.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã đơn, sản phẩm hoặc người dùng..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(0)
            }}
            className="pl-9"
          />
        </div>

        <div className="w-full md:w-56">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as StatusFilter)
              setPage(0)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{loading ? 'Đang tải dữ liệu tranh chấp...' : `Tìm thấy ${totalElements} yêu cầu tranh chấp`}</p>
          <p>
            {statusFilter === 'all'
              ? 'Đang xem tất cả trạng thái'
              : `Đang lọc: ${statusOptions.find((option) => option.value === statusFilter)?.label}`}
          </p>
        </div>

        <DataTable
          columns={columns}
          data={refunds}
          pageSize={PAGE_SIZE}
          showPagination={false}
          loading={loading}
          loadingRowCount={6}
          emptyMessage={emptyMessage}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
              disabled={loading || page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={loading || totalPages === 0 || page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog((current) => ({ ...current, open }))}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu hoàn tiền</DialogTitle>
            <DialogDescription>
              Xem nhanh thông tin giao dịch, lý do tranh chấp, chứng cứ bàn giao và lịch sử xử lý của admin.
            </DialogDescription>
          </DialogHeader>

          {detailDialog.refund && (
            <div className="space-y-4 text-sm">
              {[
                ['Mã yêu cầu', detailDialog.refund.id],
                ['Mã đơn hàng', detailDialog.refund.orderId],
                ['Sản phẩm', detailDialog.refund.productTitle ?? '—'],
                ['Buyer', detailDialog.refund.buyerName ?? '—'],
                ['Seller', detailDialog.refund.sellerName ?? '—'],
                ['Số tiền', formatCurrency(detailDialog.refund.amount)],
                ['Lý do', detailDialog.refund.reason],
                ['Ghi chú bằng chứng', detailDialog.refund.evidenceNote || '—'],
                ['Trạng thái', reviewLabels[detailDialog.refund.status]],
                ['Phương thức thanh toán', detailDialog.refund.paymentMethod ?? '—'],
                ['Trạng thái đơn hàng', detailDialog.refund.orderStatus ?? '—'],
                ['Trạng thái tiền giữ', detailDialog.refund.fundingStatus ?? '—'],
                ['Có kiểm định', detailDialog.refund.hasInspection ? 'Có' : 'Không'],
                ['Admin note', detailDialog.refund.adminNote || '—'],
                ['Mã tham chiếu hoàn tiền', detailDialog.refund.refundReference || '—'],
                ['Reviewed by', detailDialog.refund.reviewedByName || '—'],
                ['Reviewed at', formatDateTime(detailDialog.refund.reviewedAt)],
                ['Processed at', formatDateTime(detailDialog.refund.processedAt)],
                ['Created at', formatDateTime(detailDialog.refund.createdAt)],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex justify-between gap-4 border-b border-border pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="max-w-[60%] text-right font-medium text-foreground">{value}</span>
                </div>
              ))}

              <div className="grid gap-4 lg:grid-cols-2">
                <OrderEvidenceSection
                  title="Ảnh seller bàn giao xe"
                  evidence={detailDialog.refund.sellerHandoverEvidence}
                />
                <OrderEvidenceSection
                  title="Ảnh buyer xác nhận đã nhận"
                  evidence={detailDialog.refund.buyerReceiptEvidence}
                />
                <RefundEvidenceSection
                  title="Ảnh buyer gửi kèm yêu cầu hoàn tiền"
                  files={detailDialog.refund.evidenceFiles}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog((current) => ({ ...current, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{reviewDialogTitle}</DialogTitle>
            <DialogDescription>
              {reviewDialog.nextStatus === 'approved'
                ? 'Dùng khi admin chấp nhận yêu cầu hoàn tiền và chuyển vụ việc sang bước xử lý hoàn trả.'
                : reviewDialog.nextStatus === 'rejected'
                  ? 'Dùng khi admin bác bỏ yêu cầu hoàn tiền sau khi xem xét bằng chứng.'
                  : 'Dùng khi admin đã hoàn tất việc chuyển tiền trả lại cho buyer.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <p className="font-medium text-foreground">
                {reviewDialog.refund?.productTitle ?? 'Sản phẩm không xác định'}
              </p>
              <p className="mt-1 text-muted-foreground">
                Buyer: {reviewDialog.refund?.buyerName ?? '—'} • Seller: {reviewDialog.refund?.sellerName ?? '—'}
              </p>
              <p className="mt-1 text-muted-foreground">
                Số tiền cần xử lý: {reviewDialog.refund ? formatCurrency(reviewDialog.refund.amount) : '—'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú admin</label>
              <Textarea
                placeholder="Nhập kết luận, căn cứ hoặc hướng xử lý..."
                value={reviewDialog.adminNote}
                onChange={(event) =>
                  setReviewDialog((current) => ({ ...current, adminNote: event.target.value }))
                }
                rows={4}
              />
            </div>

            {reviewDialog.nextStatus === 'completed' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Mã tham chiếu hoàn tiền</label>
                <Input
                  placeholder="Ví dụ: RF-20260318-001"
                  value={reviewDialog.refundReference}
                  onChange={(event) =>
                    setReviewDialog((current) => ({
                      ...current,
                      refundReference: event.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setReviewDialog({
                  open: false,
                  refund: null,
                  nextStatus: 'approved',
                  adminNote: '',
                  refundReference: '',
                  loading: false,
                })
              }
            >
              Hủy
            </Button>
            <Button onClick={() => void handleReviewRefund()} disabled={reviewDialog.loading}>
              {reviewDialog.loading ? 'Đang lưu...' : reviewLabels[reviewDialog.nextStatus]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
