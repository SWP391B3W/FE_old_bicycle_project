import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Loader2, Search, ShoppingBag, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ordersApi } from '@/api/orders.api'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  formatOrderCurrency,
  formatOrderDate,
  getOrderStatusMeta,
  getOrderToneClass,
  getPaymentMethodLabel,
  getPaymentOptionLabel,
} from '@/lib/order-display'
import type { Order } from '@/types/order'

type StatusFilter =
  | 'Tất cả trạng thái đơn'
  | 'Chờ xử lý'
  | 'Đã thanh toán'
  | 'Chờ người mua xác nhận'
  | 'Hoàn tất'
  | 'Đã hủy'

type FundingFilter =
  | 'Tất cả trạng thái tiền'
  | 'Chưa thanh toán'
  | 'Chờ thanh toán'
  | 'Đang tạm giữ'
  | 'Chờ quyết toán người bán'
  | 'Đã giải ngân'
  | 'Chờ hoàn tiền'
  | 'Chờ chuyển khoản hoàn tiền'
  | 'Đã hoàn tiền'

const STATUS_MAP: Record<StatusFilter, string> = {
  'Tất cả trạng thái đơn': 'all',
  'Chờ xử lý': 'pending',
  'Đã thanh toán': 'deposited',
  'Chờ người mua xác nhận': 'awaiting_buyer_confirmation',
  'Hoàn tất': 'completed',
  'Đã hủy': 'cancelled',
}

const FUNDING_MAP: Record<FundingFilter, string> = {
  'Tất cả trạng thái tiền': 'all',
  'Chưa thanh toán': 'unpaid',
  'Chờ thanh toán': 'awaiting_payment',
  'Đang tạm giữ': 'held',
  'Chờ quyết toán người bán': 'seller_payout_pending',
  'Đã giải ngân': 'released',
  'Chờ hoàn tiền': 'refund_pending',
  'Chờ chuyển khoản hoàn tiền': 'refund_pending_transfer',
  'Đã hoàn tiền': 'refunded',
}

const STATUS_DISPLAY: Record<string, string> = {
  pending: 'Chờ xử lý',
  deposited: 'Đã thanh toán',
  awaiting_buyer_confirmation: 'Chờ người mua xác nhận',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
}

const FUNDING_DISPLAY: Record<string, string> = {
  unpaid: 'Chưa thanh toán',
  awaiting_payment: 'Chờ thanh toán',
  held: 'Đang tạm giữ',
  seller_payout_pending: 'Chờ quyết toán người bán',
  released: 'Đã giải ngân',
  refund_pending: 'Chờ hoàn tiền',
  refund_pending_transfer: 'Chờ chuyển khoản hoàn tiền',
  refunded: 'Đã hoàn tiền',
}

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'Tất cả trạng thái đơn', label: 'Tất cả trạng thái đơn' },
  { value: 'Chờ xử lý', label: 'Chờ xử lý' },
  { value: 'Đã thanh toán', label: 'Đã thanh toán' },
  { value: 'Chờ người mua xác nhận', label: 'Chờ người mua xác nhận' },
  { value: 'Hoàn tất', label: 'Hoàn tất' },
  { value: 'Đã hủy', label: 'Đã hủy' },
]

const fundingOptions: Array<{ value: FundingFilter; label: string }> = [
  { value: 'Tất cả trạng thái tiền', label: 'Tất cả trạng thái tiền' },
  { value: 'Chưa thanh toán', label: 'Chưa thanh toán' },
  { value: 'Chờ thanh toán', label: 'Chờ thanh toán' },
  { value: 'Đang tạm giữ', label: 'Đang tạm giữ' },
  { value: 'Chờ quyết toán người bán', label: 'Chờ quyết toán người bán' },
  { value: 'Đã giải ngân', label: 'Đã giải ngân' },
  { value: 'Chờ hoàn tiền', label: 'Chờ hoàn tiền' },
  { value: 'Chờ chuyển khoản hoàn tiền', label: 'Chờ chuyển khoản hoàn tiền' },
  { value: 'Đã hoàn tiền', label: 'Đã hoàn tiền' },
]

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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery.trim().toLowerCase())
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Tất cả trạng thái đơn')
  const [fundingFilter, setFundingFilter] = useState<FundingFilter>('Tất cả trạng thái tiền')
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 5

  useEffect(() => {
    let ignore = false

    async function loadOrders() {
      setLoading(true)

      try {
        const result = await ordersApi.getMine()

        if (ignore) {
          return
        }

        setOrders(result)
        setError(null)
      } catch (requestError) {
        if (ignore) {
          return
        }

        setOrders([])
        setError(getErrorMessage(requestError, 'Không thể tải danh sách đơn hàng lúc này.'))
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      ignore = true
    }
  }, [])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const targetStatus = STATUS_MAP[statusFilter]
      const targetFunding = FUNDING_MAP[fundingFilter]

      const matchesStatus = targetStatus === 'all' || order.status === targetStatus
      const matchesFunding = targetFunding === 'all' || order.fundingStatus === targetFunding

      if (!matchesStatus || !matchesFunding) {
        return false
      }

      if (!deferredSearchQuery) {
        return true
      }

      return [
        order.id,
        order.productTitle,
        order.buyerName,
        order.sellerName,
        order.status,
        order.fundingStatus,
      ]
        .join(' ')
        .toLowerCase()
        .includes(deferredSearchQuery)
    })
  }, [deferredSearchQuery, fundingFilter, orders, statusFilter])

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE)
  const paginatedOrders = filteredOrders.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const pendingOrders = orders.filter((order) => order.status === 'pending').length
  const completedOrders = orders.filter((order) => order.status === 'completed').length
  const payoutPendingAmount = orders
    .filter((order) => order.fundingStatus === 'seller_payout_pending')
    .reduce((sum, order) => sum + (order.sellerNetPayoutAmount ?? 0), 0)

  // Reset page when filters change
  useEffect(() => {
    setPage(0)
  }, [statusFilter, fundingFilter, deferredSearchQuery])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quản lý đơn hàng</h2>
        <p className="text-muted-foreground">
          Admin có thể rà toàn bộ đơn hàng, trạng thái thanh toán, trạng thái giữ tiền và tiến độ giải ngân từ một chỗ.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Đơn đang mở</p>
              <p className="text-2xl font-semibold">{pendingOrders}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Đơn hoàn tất</p>
              <p className="text-2xl font-semibold">{completedOrders}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Tiền chờ giải ngân</p>
              <p className="text-2xl font-semibold">{formatOrderCurrency(payoutPendingAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_240px]">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm theo mã đơn, buyer, seller hoặc sản phẩm"
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="Lọc trạng thái đơn" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={fundingFilter} onValueChange={(value) => setFundingFilter(value as FundingFilter)}>
          <SelectTrigger>
            <SelectValue placeholder="Lọc trạng thái tiền" />
          </SelectTrigger>
          <SelectContent>
            {fundingOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tải danh sách đơn hàng...
          </div>
        </div>
      ) : (
        <>
          {filteredOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
              <p className="text-base font-medium text-foreground">Không có đơn hàng phù hợp.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Thử đổi bộ lọc hoặc từ khóa để xem lại toàn bộ đơn trong hệ thống.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <p>Tìm thấy {filteredOrders.length} đơn hàng</p>
              </div>
              
              <div className="grid gap-4">
                {paginatedOrders.map((order) => {
                  const statusMeta = getOrderStatusMeta(order)

                  return (
                    <div key={order.id} className="rounded-xl border bg-card p-5 shadow-sm">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">{order.productTitle}</h3>
                            <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                              Mã: {order.id}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>
                              Người mua: <span className="font-medium text-foreground">{order.buyerName}</span>
                            </span>
                            <span>
                              Người bán: <span className="font-medium text-foreground">{order.sellerName}</span>
                            </span>
                            <span>Tạo lúc: {formatOrderDate(order.createdAt)}</span>
                          </div>

                          <div className={`text-sm font-medium ${getOrderToneClass(statusMeta.tone)}`}>
                            {statusMeta.label}
                          </div>
                          <p className="max-w-3xl text-sm text-muted-foreground">{statusMeta.helperText}</p>

                          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                            <p>
                              Phương thức: <span className="font-medium text-foreground">{getPaymentMethodLabel(order)}</span>
                            </p>
                            <p>
                              Hình thức: <span className="font-medium text-foreground">{getPaymentOptionLabel(order)}</span>
                            </p>
                            <p>
                              Trạng thái đơn: <span className="font-medium text-foreground">{STATUS_DISPLAY[order.status] || order.status}</span>
                            </p>
                            <p>
                              Trạng thái tiền: <span className="font-medium text-foreground">{FUNDING_DISPLAY[order.fundingStatus] || order.fundingStatus}</span>
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-1 text-left lg:min-w-64 lg:text-right">
                          <p className="text-sm text-muted-foreground">Tổng giá trị</p>
                          <p className="text-2xl font-bold text-primary">{formatOrderCurrency(order.totalAmount)}</p>
                          <p className="text-sm text-muted-foreground">
                            Người mua đã trả: {formatOrderCurrency(order.buyerChargeAmount ?? order.paidAmount ?? 0)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Người bán nhận: {formatOrderCurrency(order.sellerNetPayoutAmount ?? 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              Trang {totalPages === 0 ? 0 : page + 1} / {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={totalPages === 0 || page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
