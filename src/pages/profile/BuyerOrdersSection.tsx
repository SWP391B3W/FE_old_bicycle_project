import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Loader2, ShoppingBag, Wallet, XCircle, Star, RotateCcw } from 'lucide-react'
import { ordersApi } from '@/api/orders.api'
import { OrderEvidenceDialog } from '@/components/profile/OrderEvidenceDialog'
import { OrderEvidenceSection } from '@/components/profile/OrderEvidenceSection'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { ReviewModal } from '@/components/reviews/ReviewModal'
import { ReportModal } from '@/components/common/ReportModal'
import { Flag } from 'lucide-react'
import {
  canBuyerConfirmReceived,
  canBuyerRequestPayment,
  canBuyerRequestRefund,
  canBuyerSubmitReview,
  canCancelOpenOrder,
  formatOrderCurrency,
  formatOrderDate,
  getOrderBuyerChargeAmount,
  getOrderStatusMeta,
  getOrderToneClass,
  getPaymentCountdownText,
  getPaymentMethodLabel,
  getPaymentOptionLabel,
  isPaymentDeadlineExpired,
} from '@/lib/order-display'
import type { Order, OrderEvidenceInput, PaymentRequest } from '@/types/order'

interface BuyerOrdersSectionProps {
  buyerId: string
}

function getErrorMessage(error: unknown, fallback: string) {
  const statusCode = (error as { response?: { status?: number } })?.response?.status
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
    const backendMessage = error.response.data.message
    if (backendMessage && backendMessage.trim().toLowerCase() !== 'lỗi không xác định') {
      return backendMessage
    }

    if (statusCode) {
      return `${fallback} (HTTP ${statusCode})`
    }

    return fallback
  }

  if (error instanceof Error && error.message) {
    if (statusCode) {
      return `${fallback} (HTTP ${statusCode})`
    }
    return error.message
  }

  if (statusCode) {
    return `${fallback} (HTTP ${statusCode})`
  }

  return fallback
}

export function BuyerOrdersSection({ buyerId }: BuyerOrdersSectionProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [paymentRequestsByOrderId, setPaymentRequestsByOrderId] = useState<Record<string, PaymentRequest>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null)
  const [deliveryError, setDeliveryError] = useState<string | null>(null)
  const [selectedOrderForReceiveConfirm, setSelectedOrderForReceiveConfirm] = useState<Order | null>(null)
  const [selectedOrderForReview, setSelectedOrderForReview] = useState<Order | null>(null)
  const [selectedOrderForReport, setSelectedOrderForReport] = useState<Order | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  async function refreshBuyerOrders(maxAttempts = 1, delayMs = 0) {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const refreshedOrders = await ordersApi.getMine()
      setOrders(refreshedOrders.filter((item) => item.buyerId === buyerId))

      if (attempt < maxAttempts - 1 && delayMs > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(() => resolve(), delayMs)
        })
      }
    }
  }

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  // Auto-polling when there are active payment requests
  useEffect(() => {
    const hasActivePayment = Object.keys(paymentRequestsByOrderId).length > 0
    if (!hasActivePayment) return

    const pollInterval = window.setInterval(async () => {
      try {
        const result = await ordersApi.getMine()
        const myOrders = result.filter((item) => item.buyerId === buyerId)
        
        // Check if any order that had a payment request has now changed status
        let shouldClearRequests = false
        myOrders.forEach(order => {
          if (paymentRequestsByOrderId[order.id] && order.fundingStatus !== 'awaiting_payment') {
            shouldClearRequests = true
          }
        })

        setOrders(myOrders)

        if (shouldClearRequests) {
          setPaymentRequestsByOrderId(prev => {
            const next = { ...prev }
            myOrders.forEach(order => {
              if (order.fundingStatus !== 'awaiting_payment') {
                delete next[order.id]
              }
            })
            return next
          })
        }
      } catch (err) {
        console.error('Polling failed:', err)
      }
    }, 8000) // Poll every 8 seconds

    return () => window.clearInterval(pollInterval)
  }, [buyerId, paymentRequestsByOrderId])

  useEffect(() => {
    let cancelled = false

    async function loadOrders() {
      setLoading(true)

      try {
        const result = await ordersApi.getMine()

        if (!cancelled) {
          setOrders(result.filter((order) => order.buyerId === buyerId))
          setError(null)
          setSuccess(null)
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(getErrorMessage(requestError, 'Không thể tải danh sách đơn mua.'))
          setOrders([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      cancelled = true
    }
  }, [buyerId])

  function replaceOrder(updatedOrder: Order) {
    setOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
    )
  }

  async function runOrderAction(order: Order, action: 'cancel' | 'pay') {
    setActionLoadingKey(`${action}:${order.id}`)
    setSuccess(null)

    try {
      const result =
        action === 'pay'
          ? await ordersApi.pay(order.id)
          : await ordersApi.cancel(order.id)

      if (action === 'pay') {
        setPaymentRequestsByOrderId((currentValue) => ({
          ...currentValue,
          [order.id]: result as PaymentRequest,
        }))
        await refreshBuyerOrders(2, 500)
        setSuccess('Đã tạo yêu cầu thanh toán. Quét mã QR hoặc dùng thông tin chuyển khoản hiển thị trong đơn hàng.')
      } else {
        replaceOrder(result as Order)
        setPaymentRequestsByOrderId((currentValue) => {
          const nextValue = { ...currentValue }
          delete nextValue[order.id]
          return nextValue
        })
      }

      setError(null)
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          action === 'pay'
            ? 'Không thể tạo yêu cầu thanh toán lúc này.'
            : 'Không thể hủy đơn hàng lúc này.',
        ),
      )
      setSuccess(null)
    } finally {
      setActionLoadingKey(null)
    }
  }

  async function handleSubmitReceiveEvidence(order: Order, values: OrderEvidenceInput) {
    setActionLoadingKey(`received:${order.id}`)

    try {
      const updatedOrder = await ordersApi.confirmReceived(order.id, values)
      replaceOrder(updatedOrder)
      setSelectedOrderForReceiveConfirm(null)
      setDeliveryError(null)
      setError(null)
      setSuccess('Đã xác nhận nhận xe thành công.')
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'Không thể xác nhận đã nhận xe lúc này.')
      setDeliveryError(message)
      setError(message)
      setSuccess(null)
    } finally {
      setActionLoadingKey(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đơn mua</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-card">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải danh sách đơn mua...
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
              <p className="text-base font-medium text-foreground">Bạn chưa có đơn mua nào.</p>
              <p className="mt-2 text-sm text-muted-foreground">Khi bạn đặt mua xe, đơn sẽ xuất hiện tại đây.</p>
              <Button className="mt-4" asChild>
                <Link to={ROUTES.MARKET}>Đi mua xe</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => {
                const statusMeta = getOrderStatusMeta(order, nowMs)
                const paymentDeadlineExpired = isPaymentDeadlineExpired(order, nowMs)
                const paymentCountdownText = getPaymentCountdownText(order.paymentDeadline, nowMs)
                const buyerChargeAmount = getOrderBuyerChargeAmount(order) || order.totalAmount
                const canPayNow = canBuyerRequestPayment(order, nowMs)
                const paymentRequest = paymentRequestsByOrderId[order.id]

                return (
                  <div key={order.id} className="space-y-4 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex gap-4">
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/50 text-muted-foreground">
                          <ShoppingBag className="h-5 w-5" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">{order.productTitle}</h3>
                            <Badge variant="outline" className="text-xs font-normal">
                              Mã: {order.id}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span>Người bán: <span className="font-medium text-foreground">{order.sellerName}</span></span>
                            <span>•</span>
                            <span>{formatOrderDate(order.createdAt)}</span>
                          </div>

                          <div className={`inline-flex items-center text-sm font-medium ${getOrderToneClass(statusMeta.tone)}`}>
                            Trạng thái: {statusMeta.label}
                          </div>
                          <p className="text-sm text-muted-foreground">{statusMeta.helperText}</p>

                          {order.fundingStatus === 'awaiting_payment' && order.paymentDeadline && (
                            <div
                              className={`rounded-lg border px-3 py-2 text-sm ${
                                paymentDeadlineExpired
                                  ? 'border-destructive/30 bg-destructive/5 text-destructive'
                                  : 'border-primary/20 bg-primary/5 text-primary'
                              }`}
                            >
                              <p className="font-medium">Hạn thanh toán: {formatOrderDate(order.paymentDeadline)}</p>
                              <p className={paymentDeadlineExpired ? 'text-destructive/90' : 'text-primary/90'}>
                                {paymentCountdownText}
                              </p>
                            </div>
                          )}

                          <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                            <p>
                              Phương thức: <span className="font-medium text-foreground">{getPaymentMethodLabel(order)}</span>
                            </p>
                            <p>
                              Hình thức: <span className="font-medium text-foreground">{getPaymentOptionLabel(order)}</span>
                            </p>
                            <p>
                              Cần thanh toán hiện tại:{' '}
                              <span className="font-medium text-foreground">{formatOrderCurrency(buyerChargeAmount)}</span>
                            </p>
                            <p>
                              Đã thanh toán:{' '}
                              <span className="font-medium text-foreground">{formatOrderCurrency(order.paidAmount ?? 0)}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full flex-col items-start gap-3 border-t border-border pt-4 lg:w-auto lg:items-end lg:border-0 lg:pt-0">
                        <div className="text-lg font-bold text-primary">{formatOrderCurrency(order.totalAmount)}</div>

                        <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
                          {canPayNow && (
                            <Button
                              className="gap-1.5"
                              onClick={() => void runOrderAction(order, 'pay')}
                              disabled={actionLoadingKey === `pay:${order.id}`}
                            >
                              {actionLoadingKey === `pay:${order.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Wallet className="h-4 w-4" />
                              )}
                              {actionLoadingKey === `pay:${order.id}` ? 'Đang xử lý...' : 'Thanh toán ngay'}
                            </Button>
                          )}

                          {canBuyerConfirmReceived(order) && (
                            <Button
                              className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                setSelectedOrderForReceiveConfirm(order)
                                setDeliveryError(null)
                              }}
                              disabled={actionLoadingKey === `received:${order.id}`}
                            >
                              {actionLoadingKey === `received:${order.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              Đã nhận được xe
                            </Button>
                          )}

                          {canBuyerConfirmReceived(order) && (
                            <Button
                              variant="outline"
                              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setSelectedOrderForReport(order)}
                            >
                              <Flag className="h-4 w-4" />
                              Khiếu nại / Hoàn tiền
                            </Button>
                          )}

                          {canCancelOpenOrder(order, nowMs) && (
                            <Button
                              variant="outline"
                              className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50"
                              onClick={() => void runOrderAction(order, 'cancel')}
                              disabled={actionLoadingKey === `cancel:${order.id}`}
                            >
                              {actionLoadingKey === `cancel:${order.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                              Hủy đơn
                            </Button>
                          )}

                          {canBuyerRequestRefund(order) && !canBuyerConfirmReceived(order) && (
                            <Button
                              variant="outline"
                              className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => {
                                // Reuse cancel action for refund request if implemented in API
                                void runOrderAction(order, 'cancel')
                              }}
                              disabled={actionLoadingKey === `cancel:${order.id}`}
                            >
                              {actionLoadingKey === `cancel:${order.id}` ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                              Yêu cầu hoàn tiền
                            </Button>
                          )}

                          {canBuyerSubmitReview(order) && (
                            <Button
                              variant="outline"
                              className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
                              onClick={() => setSelectedOrderForReview(order)}
                            >
                              <Star className="h-4 w-4" />
                              Đánh giá ngay
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {paymentRequest && (order.productStatus === 'active' || order.productStatus === 'inspected_passed') && order.productIsVerified !== false && (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">Thông tin thanh toán</p>
                            <div className="grid gap-1 text-sm text-muted-foreground">
                              <p>
                                Số tiền cần chuyển:{' '}
                                <span className="font-medium text-foreground">
                                  {formatOrderCurrency(paymentRequest.amount ?? buyerChargeAmount)}
                                </span>
                              </p>
                              {paymentRequest.bankAccountName ? (
                                <p>
                                  Chủ tài khoản:{' '}
                                  <span className="font-medium text-foreground">{paymentRequest.bankAccountName}</span>
                                </p>
                              ) : null}
                              {paymentRequest.bankAccountNumber ? (
                                <p>
                                  Số tài khoản:{' '}
                                  <span className="font-medium text-foreground">{paymentRequest.bankAccountNumber}</span>
                                </p>
                              ) : null}
                              {paymentRequest.bankBin ? (
                                <p>
                                  Mã ngân hàng:{' '}
                                  <span className="font-medium text-foreground">{paymentRequest.bankBin}</span>
                                </p>
                              ) : null}
                              {paymentRequest.transferContent ? (
                                <p>
                                  Nội dung chuyển khoản:{' '}
                                  <span className="font-medium text-foreground">{paymentRequest.transferContent}</span>
                                </p>
                              ) : null}
                              {paymentRequest.expiresAt ? (
                                <p>
                                  Hết hạn:{' '}
                                  <span className="font-medium text-foreground">{formatOrderDate(paymentRequest.expiresAt)}</span>
                                </p>
                              ) : null}
                              {paymentRequest.instructions ? (
                                <p className="pt-1 text-xs">{paymentRequest.instructions}</p>
                              ) : null}
                            </div>
                          </div>

                          {paymentRequest.qrCodeUrl ? (
                            <div className="w-full max-w-[220px] overflow-hidden rounded-lg border bg-white p-3">
                              <img
                                src={paymentRequest.qrCodeUrl}
                                alt={`QR thanh toán cho đơn ${order.id}`}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-3 lg:grid-cols-2">
                      <OrderEvidenceSection
                        title="Chứng cứ gửi hàng từ người bán"
                        evidence={order.sellerHandoverEvidence}
                      />
                      <OrderEvidenceSection
                        title="Chứng cứ đã nhận xe từ người mua"
                        evidence={order.buyerReceiptEvidence}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <OrderEvidenceDialog
        open={Boolean(selectedOrderForReceiveConfirm)}
        title="Xác nhận đã nhận xe"
        description="Tải ảnh xác nhận nhận xe để hệ thống hoàn tất giao dịch và chuyển bước giải ngân."
        noteLabel="Ghi chú xác nhận"
        notePlaceholder="Ví dụ: đã nhận đúng xe, tình trạng đúng mô tả."
        submitLabel="Xác nhận đã nhận"
        orderTitle={selectedOrderForReceiveConfirm?.productTitle ?? ''}
        helperText="Bạn có thể đính kèm ảnh nhận xe để hỗ trợ đối soát khi cần."
        loading={Boolean(selectedOrderForReceiveConfirm) && actionLoadingKey === `received:${selectedOrderForReceiveConfirm?.id}`}
        error={deliveryError}
        onClose={() => {
          setSelectedOrderForReceiveConfirm(null)
          setDeliveryError(null)
        }}
        onSubmit={(values) =>
          selectedOrderForReceiveConfirm ? handleSubmitReceiveEvidence(selectedOrderForReceiveConfirm, values) : undefined
        }
      />
      <ReviewModal
        isOpen={Boolean(selectedOrderForReview)}
        orderId={selectedOrderForReview?.id ?? ''}
        onClose={() => setSelectedOrderForReview(null)}
        onSuccess={() => void refreshBuyerOrders()}
      />
      <ReportModal
        open={Boolean(selectedOrderForReport)}
        onOpenChange={(open) => !open && setSelectedOrderForReport(null)}
        targetId={selectedOrderForReport?.sellerId ?? ''}
        targetType="USER"
        targetName={selectedOrderForReport?.sellerName ?? 'người bán'}
      />
    </div>
  )
}
