import { useEffect, useState } from 'react'
import { Clock, Eye, Loader2, Package, ShoppingBag, TrendingUp, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard } from '@/components/dashboard/StatCard'
import { ordersApi } from '@/api/orders.api'
import { productsApi } from '@/api/products.api'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { canSellerAcceptOrder } from '@/lib/order-display'
import type { Order } from '@/types/order'
import type { Product } from '@/types/product'
import { getSellerListingStatusPresentation } from './seller-listing-visibility'
import { formatPriceDisplay } from '@/lib/currency-input'

function formatPrice(amount: number): string {
  return formatPriceDisplay(amount)
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)

  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`
  }

  if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)} giờ trước`
  }

  return `${Math.floor(diffMinutes / 1440)} ngày trước`
}

function getAttentionText(order: Order): string {
  if (canSellerAcceptOrder(order)) {
    return 'Chờ người bán phản hồi'
  }

  if (order.status === 'pending' && order.fundingStatus === 'awaiting_payment') {
    return 'Đã chốt buyer, đang chờ thanh toán'
  }

  return 'Đang theo dõi giao dịch'
}

export default function SellerDashboardPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sellerId = user?.id

    Promise.all([productsApi.getMine(0, 50), ordersApi.getMine()])
      .then(([productsPage, allOrders]) => {
        setProducts(productsPage.content)
        setOrders(allOrders.filter((order) => order.sellerId === sellerId))
      })
      .catch(() => {
        setProducts([])
        setOrders([])
      })
      .finally(() => setIsLoading(false))
  }, [user?.id])

  const activeListings = products.filter((product) => getSellerListingStatusPresentation(product).isPubliclyVisible).length
  const pendingListings = products.filter((product) => product.status === 'pending').length
  const incomingRequests = orders.filter((order) => canSellerAcceptOrder(order))
  const acceptedWaitingPayment = orders.filter(
    (order) => order.status === 'pending' && order.fundingStatus === 'awaiting_payment',
  )
  const attentionOrders = incomingRequests.length > 0 ? incomingRequests : acceptedWaitingPayment
  const completedOrders = orders.filter((order) => order.status === 'completed')
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0)
  const releasedProfit = completedOrders
    .filter((order) => order.fundingStatus === 'released')
    .reduce((sum, order) => sum + (order.sellerNetPayoutAmount ?? 0), 0)
  const pendingPayoutAmount = completedOrders
    .filter((order) => order.fundingStatus === 'seller_payout_pending')
    .reduce((sum, order) => sum + (order.sellerNetPayoutAmount ?? 0), 0)
  const pendingPayoutOrders = completedOrders.filter((order) => order.fundingStatus === 'seller_payout_pending').length

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tổng quan cửa hàng</h2>
        <p className="text-muted-foreground">
          Theo dõi hoạt động kinh doanh, yêu cầu mua đang chờ xử lý và các khoản tiền seller đã nhận hoặc còn chờ giải ngân.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Yêu cầu cần phản hồi"
          value={String(incomingRequests.length)}
          icon={ShoppingBag}
          description={
            incomingRequests.length > 0
              ? 'Seller cần chọn buyer hoặc từ chối yêu cầu còn lại'
              : acceptedWaitingPayment.length > 0
                ? `${acceptedWaitingPayment.length} đơn đã chốt đang chờ buyer thanh toán`
                : 'Không có yêu cầu mới'
          }
          trend={incomingRequests.length > 0 ? { value: incomingRequests.length, isPositive: false } : undefined}
        />
        <StatCard
          title="Tin đang bật"
          value={String(activeListings)}
          icon={Package}
          description={`${pendingListings} tin đăng chờ duyệt`}
        />
        <StatCard
          title="Đơn hoàn thành"
          value={String(completedOrders.length)}
          icon={Eye}
          description="Tổng giao dịch đã hoàn tất"
          trend={completedOrders.length > 0 ? { value: completedOrders.length, isPositive: true } : undefined}
        />
        <StatCard
          title="Doanh thu"
          value={totalRevenue > 0 ? formatPrice(totalRevenue) : '—'}
          icon={TrendingUp}
          description="Tổng giá trị xe của các đơn hoàn tất"
        />
        <StatCard
          title="Seller đã thực nhận"
          value={releasedProfit > 0 ? formatPrice(releasedProfit) : '—'}
          icon={Wallet}
          description="Net payout của các đơn đã released"
        />
        <StatCard
          title="Chờ giải ngân"
          value={pendingPayoutAmount > 0 ? formatPrice(pendingPayoutAmount) : '—'}
          icon={Clock}
          description={
            pendingPayoutOrders > 0
              ? `${pendingPayoutOrders} đơn đang chờ admin chuyển khoản`
              : 'Không có khoản pending payout'
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-row items-center justify-between p-6 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Tin đăng gần đây</h3>
            <Link to={ROUTES.SELLER_LISTINGS} className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3 p-6 pt-2">
            {products.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Chưa có tin đăng nào.</p>
            ) : (
              products.slice(0, 5).map((product) => {
                const statusPresentation = getSellerListingStatusPresentation(product)

                return (
                  <div key={product.id} className="flex items-center gap-3">
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="h-10 w-10 shrink-0 rounded-md border bg-muted object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                        Xe
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(product.createdAt)}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusPresentation.className}`}
                    >
                      {statusPresentation.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-row items-center justify-between p-6 pb-2">
            <h3 className="text-lg font-medium tracking-tight">Việc cần làm ngay</h3>
            <Link to={ROUTES.SELLER_ORDERS} className="text-sm text-primary hover:underline">
              Xem đơn
            </Link>
          </div>
          <div className="space-y-4 p-6 pt-2">
            {attentionOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-muted-foreground">
                <Clock className="h-8 w-8 opacity-40" />
                <p className="text-sm">Không có yêu cầu mua cần theo dõi ngay</p>
              </div>
            ) : (
              attentionOrders.slice(0, 4).map((order) => (
                <div key={order.id} className="flex items-center gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                    <ShoppingBag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-medium leading-none">
                      {order.buyerName} muốn mua {order.productTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)} · {getAttentionText(order)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
