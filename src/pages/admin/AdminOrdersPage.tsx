import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ClipboardList, Loader2, Search, ShoppingBag, Wallet } from 'lucide-react'
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
import type { Order, OrderFundingStatus, OrderStatus } from '@/types/order'

type StatusFilter = 'all' | OrderStatus
type FundingFilter = 'all' | OrderFundingStatus

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái đơn' },
  { value: 'pending', label: 'Pending' },
  { value: 'deposited', label: 'Deposited' },
  { value: 'awaiting_buyer_confirmation', label: 'Chờ buyer xác nhận' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const fundingOptions: Array<{ value: FundingFilter; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái tiền' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'awaiting_payment', label: 'Awaiting payment' },
  { value: 'held', label: 'Held' },
  { value: 'seller_payout_pending', label: 'Seller payout pending' },
  { value: 'released', label: 'Released' },
  { value: 'refund_pending', label: 'Refund pending' },
  { value: 'refund_pending_transfer', label: 'Refund pending transfer' },
  { value: 'refunded', label: 'Refunded' },
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [fundingFilter, setFundingFilter] = useState<FundingFilter>('all')

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
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesFunding = fundingFilter === 'all' || order.fundingStatus === fundingFilter

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

  const pendingOrders = filteredOrders.filter((order) => order.status === 'pending').length
  const completedOrders = filteredOrders.filter((order) => order.status === 'completed').length
  const payoutPendingAmount = filteredOrders
    .filter((order) => order.fundingStatus === 'seller_payout_pending')
    .reduce((sum, order) => sum + (order.sellerNetPayoutAmount ?? 0), 0)

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
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
          <p className="text-base font-medium text-foreground">Không có đơn hàng phù hợp.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Thử đổi bộ lọc hoặc từ khóa để xem lại toàn bộ đơn trong hệ thống.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
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
                        Buyer: <span className="font-medium text-foreground">{order.buyerName}</span>
                      </span>
                      <span>
                        Seller: <span className="font-medium text-foreground">{order.sellerName}</span>
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
                        Trạng thái đơn: <span className="font-medium text-foreground">{order.status}</span>
                      </p>
                      <p>
                        Trạng thái tiền: <span className="font-medium text-foreground">{order.fundingStatus}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-1 text-left lg:min-w-64 lg:text-right">
                    <p className="text-sm text-muted-foreground">Tổng giá trị</p>
                    <p className="text-2xl font-bold text-primary">{formatOrderCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-muted-foreground">
                      Buyer trả hiện tại: {formatOrderCurrency(order.buyerChargeAmount ?? order.paidAmount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Seller net: {formatOrderCurrency(order.sellerNetPayoutAmount ?? 0)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
