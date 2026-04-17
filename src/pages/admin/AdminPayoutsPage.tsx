import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import {
  ArrowRightLeft,
  Banknote,
  BellRing,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MoreHorizontal,
  Search,
  Wallet,
} from 'lucide-react'
import { payoutsApi } from '@/api/payouts.api'
import { DataTable } from '@/components/dashboard/DataTable'
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
import type { AdminPayout, PayoutStatus, PayoutType } from '@/types/payout'

type TypeFilter = 'all' | PayoutType
type StatusFilter = 'all' | PayoutStatus

const PAGE_SIZE = 10

const typeOptions: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'Tất cả payout' },
  { value: 'refund', label: 'Hoàn tiền buyer' },
  { value: 'seller_release', label: 'Giải ngân seller' },
]

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'profile_required', label: 'Thiếu payout profile' },
  { value: 'pending_transfer', label: 'Chờ chuyển khoản' },
  { value: 'completed', label: 'Đã chuyển khoản' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const statusLabelMap: Record<PayoutStatus, string> = {
  profile_required: 'Thiếu payout profile',
  pending_transfer: 'Chờ chuyển khoản',
  completed: 'Đã chuyển khoản',
  cancelled: 'Đã hủy',
}

const typeLabelMap: Record<PayoutType, string> = {
  refund: 'Hoàn tiền buyer',
  seller_release: 'Giải ngân seller',
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

function getGrossAmount(payout: AdminPayout) {
  return payout.grossAmount ?? payout.amount
}

function getFeeDeductionAmount(payout: AdminPayout) {
  return payout.feeDeductionAmount ?? 0
}

function getNetAmount(payout: AdminPayout) {
  return payout.netAmount ?? payout.amount
}

function getStatusTone(status: PayoutStatus) {
  switch (status) {
    case 'pending_transfer':
      return 'text-orange-600 dark:text-orange-400'
    case 'completed':
      return 'text-green-600 dark:text-green-400'
    case 'profile_required':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-muted-foreground'
  }
}

export default function AdminPayoutsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery.trim())
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [payouts, setPayouts] = useState<AdminPayout[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; payout: AdminPayout | null }>({
    open: false,
    payout: null,
  })
  const [completeDialog, setCompleteDialog] = useState<{
    open: boolean
    payout: AdminPayout | null
    bankReference: string
    adminNote: string
    loading: boolean
  }>({
    open: false,
    payout: null,
    bankReference: '',
    adminNote: '',
    loading: false,
  })
  const [remindingPayoutId, setRemindingPayoutId] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadPayouts() {
      setLoading(true)

      try {
        const result = await payoutsApi.getAdminPayouts({
          keyword: deferredSearchQuery || undefined,
          type: typeFilter === 'all' ? undefined : typeFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          page,
          size: PAGE_SIZE,
        })

        if (ignore) {
          return
        }

        setPayouts(result.content)
        setTotalPages(result.totalPages)
        setTotalElements(result.totalElements)
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setPayouts([])
        setTotalPages(0)
        setTotalElements(0)
        setError(getErrorMessage(requestError, 'Không thể tải danh sách payout lúc này.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadPayouts()

    return () => {
      ignore = true
    }
  }, [deferredSearchQuery, page, statusFilter, typeFilter])

  async function reloadPayouts() {
    const result = await payoutsApi.getAdminPayouts({
      keyword: deferredSearchQuery || undefined,
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      size: PAGE_SIZE,
    })

    setPayouts(result.content)
    setTotalPages(result.totalPages)
    setTotalElements(result.totalElements)
    setError(null)
  }

  async function handleCompletePayout() {
    if (!completeDialog.payout) {
      return
    }

    setCompleteDialog((current) => ({ ...current, loading: true }))

    try {
      await payoutsApi.completeAdminPayout(completeDialog.payout.id, {
        bankReference: completeDialog.bankReference.trim(),
        adminNote: completeDialog.adminNote.trim() || undefined,
      })

      await reloadPayouts()
      setNotice('Đã xác nhận payout hoàn tất.')
      setCompleteDialog({
        open: false,
        payout: null,
        bankReference: '',
        adminNote: '',
        loading: false,
      })
    } catch (requestError) {
      setCompleteDialog((current) => ({ ...current, loading: false }))
      setError(getErrorMessage(requestError, 'Không thể xác nhận payout lúc này.'))
    }
  }

  async function handleRemindProfile(payout: AdminPayout) {
    setRemindingPayoutId(payout.id)

    try {
      await payoutsApi.remindProfileRequiredPayout(payout.id)
      setNotice(`Đã nhắc ${payout.recipientName} cập nhật payout profile.`)
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Không thể gửi nhắc cập nhật payout profile lúc này.'))
    } finally {
      setRemindingPayoutId(null)
    }
  }

  const emptyMessage = useMemo(() => {
    if (deferredSearchQuery || typeFilter !== 'all' || statusFilter !== 'all') {
      return 'Không tìm thấy payout phù hợp.'
    }

    return 'Chưa có payout nào cần xử lý.'
  }, [deferredSearchQuery, statusFilter, typeFilter])

  const columns: ColumnDef<AdminPayout>[] = [
    {
      accessorKey: 'type',
      header: 'Loại payout',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{typeLabelMap[row.original.type]}</p>
          <p className="text-xs text-muted-foreground">Mã: {row.original.id}</p>
        </div>
      ),
    },
    {
      id: 'recipient',
      header: 'Người nhận',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.recipientName}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.type === 'refund'
              ? `Buyer: ${row.original.buyerName ?? '—'}`
              : `Seller: ${row.original.sellerName ?? '—'}`}
          </p>
        </div>
      ),
    },
    {
      id: 'context',
      header: 'Đơn / sản phẩm',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.productTitle ?? '—'}</p>
          <p className="text-xs text-muted-foreground">Đơn: {row.original.orderId ?? '—'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Gross / Fee / Net',
      cell: ({ row }) => (
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-foreground">{formatCurrency(getNetAmount(row.original))}</p>
          <p className="text-xs text-muted-foreground">
            Tổng số tiền: {formatCurrency(getGrossAmount(row.original))}
          </p>
          <p className="text-xs text-muted-foreground">
            Khoản phí khấu trừ: {formatCurrency(getFeeDeductionAmount(row.original))}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <span className={`font-medium ${getStatusTone(row.original.status)}`}>{statusLabelMap[row.original.status]}</span>
      ),
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
            <DropdownMenuItem onClick={() => setDetailDialog({ open: true, payout: row.original })}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>

            {row.original.status === 'profile_required' && (
              <DropdownMenuItem
                onClick={() => void handleRemindProfile(row.original)}
                disabled={remindingPayoutId === row.original.id}
              >
                <BellRing className="mr-2 h-4 w-4" />
                Nhắc cập nhật payout profile
              </DropdownMenuItem>
            )}

            {row.original.status === 'pending_transfer' && (
              <DropdownMenuItem
                onClick={() =>
                  setCompleteDialog({
                    open: true,
                    payout: row.original,
                    bankReference: '',
                    adminNote: row.original.adminNote ?? '',
                    loading: false,
                  })
                }
              >
                <Banknote className="mr-2 h-4 w-4" />
                Xác nhận đã chuyển khoản
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
        <h2 className="text-2xl font-bold text-foreground">Giải ngân thủ công</h2>
        <p className="text-muted-foreground">
          Theo dõi payout cho hoàn tiền buyer và giải ngân tiền cọc cho seller bằng quy trình VietQR thủ công có audit.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo sản phẩm, order, buyer, seller..."
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
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as TypeFilter)
              setPage(0)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Loại payout" />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <SelectValue placeholder="Trạng thái payout" />
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

      {notice && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{loading ? 'Đang tải danh sách payout...' : `Tìm thấy ${totalElements} payout`}</p>
          <p>{typeFilter === 'all' ? 'Đang xem tất cả loại payout' : `Đang lọc: ${typeLabelMap[typeFilter]}`}</p>
        </div>

        <DataTable
          columns={columns}
          data={payouts}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Chi tiết payout</DialogTitle>
            <DialogDescription>
              Kiểm tra thông tin người nhận, QR thủ công và trạng thái xử lý của payout.
            </DialogDescription>
          </DialogHeader>

          {detailDialog.payout && (
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3 text-sm">
                {[
                  ['Loại payout', typeLabelMap[detailDialog.payout.type]],
                  ['Trạng thái', statusLabelMap[detailDialog.payout.status]],
                  ['Người nhận', detailDialog.payout.recipientName],
                  ['Sản phẩm', detailDialog.payout.productTitle ?? '—'],
                  ['Đơn hàng', detailDialog.payout.orderId ?? '—'],
                  ['Refund request', detailDialog.payout.refundRequestId ?? '—'],
                  ['Tổng số tiền', formatCurrency(getGrossAmount(detailDialog.payout))],
                  ['Khoản phí khấu trừ', formatCurrency(getFeeDeductionAmount(detailDialog.payout))],
                  ['Số tiền thực nhận', formatCurrency(getNetAmount(detailDialog.payout))],
                  ['Ngân hàng', detailDialog.payout.bankCode ?? '—'],
                  ['Bank BIN', detailDialog.payout.bankBin ?? '—'],
                  ['Số tài khoản', detailDialog.payout.accountNumber ?? '—'],
                  ['Chủ tài khoản', detailDialog.payout.accountName ?? '—'],
                  ['Nội dung chuyển khoản', detailDialog.payout.transferContent ?? '—'],
                  ['Bank ref', detailDialog.payout.bankReference ?? '—'],
                  ['Admin note', detailDialog.payout.adminNote ?? '—'],
                  ['Hoàn tất bởi', detailDialog.payout.completedByName ?? '—'],
                  ['Hoàn tất lúc', formatDateTime(detailDialog.payout.completedAt)],
                  ['Tạo lúc', formatDateTime(detailDialog.payout.createdAt)],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between gap-4 border-b border-border pb-2">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="max-w-[60%] text-right font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ArrowRightLeft className="h-4 w-4" />
                  Hướng dẫn payout thủ công
                </div>
                <p className="text-sm text-muted-foreground">
                  Admin hoặc kế toán có thể mở QR bên dưới, chuyển khoản thủ công từ tài khoản công ty, sau đó nhập
                  `bankRef` để chốt payout.
                </p>

                {detailDialog.payout.qrCodeUrl ? (
                  <div className="overflow-hidden rounded-lg border bg-white p-2">
                    <img
                      src={detailDialog.payout.qrCodeUrl}
                      alt="VietQR payout"
                      className="mx-auto h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                    <p>Người nhận chưa có payout profile hoặc thiếu đủ thông tin để tạo VietQR.</p>
                    {detailDialog.payout.status === 'profile_required' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleRemindProfile(detailDialog.payout!)}
                        disabled={remindingPayoutId === detailDialog.payout.id}
                      >
                        {remindingPayoutId === detailDialog.payout.id ? 'Đang gửi nhắc...' : 'Nhắc cập nhật payout profile'}
                      </Button>
                    )}
                  </div>
                )}

                <div className="space-y-2 rounded-lg border bg-background px-4 py-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">Nội dung chuyển khoản:</span>{' '}
                    <span className="font-medium">{detailDialog.payout.transferContent ?? '—'}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Provider:</span>{' '}
                    <span className="font-medium">{detailDialog.payout.provider}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={completeDialog.open} onOpenChange={(open) => setCompleteDialog((current) => ({ ...current, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xác nhận payout thủ công</DialogTitle>
            <DialogDescription>
              Dùng sau khi công ty đã chuyển khoản thật cho người nhận và đã có mã tham chiếu ngân hàng.
            </DialogDescription>
          </DialogHeader>

          {completeDialog.payout && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                <p className="font-medium text-foreground">{completeDialog.payout.recipientName}</p>
                <p className="mt-1 text-muted-foreground">
                  {typeLabelMap[completeDialog.payout.type]} • Số tiền thực nhận: {formatCurrency(getNetAmount(completeDialog.payout))}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Tổng số tiền: {formatCurrency(getGrossAmount(completeDialog.payout))} • Khoản phí khấu trừ:{' '}
                  {formatCurrency(getFeeDeductionAmount(completeDialog.payout))}
                </p>
                <p className="mt-1 text-muted-foreground">
                  Nội dung chuyển khoản: {completeDialog.payout.transferContent ?? '—'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mã tham chiếu ngân hàng</label>
                <Input
                  value={completeDialog.bankReference}
                  onChange={(event) =>
                    setCompleteDialog((current) => ({ ...current, bankReference: event.target.value }))
                  }
                  placeholder="Ví dụ: IBFT20260319..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú admin</label>
                <Textarea
                  value={completeDialog.adminNote}
                  onChange={(event) =>
                    setCompleteDialog((current) => ({ ...current, adminNote: event.target.value }))
                  }
                  rows={4}
                  placeholder="Ghi chú thêm về lệnh chuyển khoản thủ công..."
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() =>
                setCompleteDialog({
                  open: false,
                  payout: null,
                  bankReference: '',
                  adminNote: '',
                  loading: false,
                })
              }
            >
              Hủy
            </Button>
            <Button onClick={() => void handleCompletePayout()} disabled={completeDialog.loading}>
              {completeDialog.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Xác nhận đã chuyển khoản
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
