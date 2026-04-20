import type { Order } from '@/types/order'

export type OrderTone = 'muted' | 'info' | 'warning' | 'success' | 'danger'

interface OrderStatusMeta {
  label: string
  helperText: string
  tone: OrderTone
}

const toneClassMap: Record<OrderTone, string> = {
  muted: 'text-muted-foreground',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-orange-600 dark:text-orange-400',
  success: 'text-green-600 dark:text-green-400',
  danger: 'text-red-600 dark:text-red-400',
}

export function formatOrderCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function getOrderToneClass(tone: OrderTone) {
  return toneClassMap[tone]
}

export function getPaymentMethodLabel(order: Order) {
  return order.paymentMethod === 'cash'
    ? 'Tiền mặt'
    : order.paymentMethod === 'transfer'
      ? 'Thanh toán online qua SePay'
      : 'Thanh toán online'
}

export function getPaymentOptionLabel(order: Order) {
  return order.paymentOption === 'full' ? 'Thanh toán toàn bộ' : 'Đặt cọc một phần'
}

export function getOrderPlatformFeeTotal(order: Order) {
  return order.platformFeeTotal ?? order.serviceFee ?? 0
}

export function getOrderBuyerFeeAmount(order: Order) {
  return order.buyerFeeAmount ?? 0
}

export function getOrderBuyerChargeAmount(order: Order) {
  return order.buyerChargeAmount ?? order.paidAmount ?? 0
}

export function getOrderSellerFeeAmount(order: Order) {
  return order.sellerFeeAmount ?? 0
}

export function getOrderSellerGrossPayoutAmount(order: Order) {
  return order.sellerGrossPayoutAmount ?? order.requiredUpfrontAmount ?? 0
}

export function getOrderSellerNetPayoutAmount(order: Order) {
  const fallbackGrossAmount = getOrderSellerGrossPayoutAmount(order)
  return order.sellerNetPayoutAmount ?? Math.max(0, fallbackGrossAmount - getOrderSellerFeeAmount(order))
}

export function getOrderRefundableBuyerAmount(order: Order) {
  const buyerChargeAmount = order.buyerChargeAmount ?? 0
  return buyerChargeAmount > 0 ? buyerChargeAmount : order.paidAmount ?? 0
}

function getPaymentDeadlineMs(order: Order) {
  if (!order.paymentDeadline) {
    return null
  }

  const deadlineMs = new Date(order.paymentDeadline).getTime()
  return Number.isFinite(deadlineMs) ? deadlineMs : null
}

export function isPaymentDeadlineExpired(order: Order, nowMs = Date.now()) {
  const deadlineMs = getPaymentDeadlineMs(order)
  return deadlineMs !== null && deadlineMs <= nowMs
}

export function getPaymentCountdownText(paymentDeadline?: string | null, nowMs = Date.now()) {
  if (!paymentDeadline) {
    return null
  }

  const deadlineMs = new Date(paymentDeadline).getTime()
  if (!Number.isFinite(deadlineMs)) {
    return null
  }

  const diffMs = deadlineMs - nowMs
  if (diffMs <= 0) {
    return 'Đã quá hạn thanh toán'
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `Còn ${hours} giờ ${minutes} phút`
  }
  if (minutes > 0) {
    return `Còn ${minutes} phút ${seconds} giây`
  }
  return `Còn ${seconds} giây`
}

export function getOrderStatusMeta(order: Order, nowMs = Date.now()): OrderStatusMeta {
  if (order.status === 'completed' && order.fundingStatus === 'seller_payout_pending') {
    return {
      label: 'Chờ giải ngân cho người bán',
      helperText:
        'Đơn hàng đã hoàn tất. Hệ thống đang chờ admin chuyển khoản thủ công số tiền bán xe sau khi trừ phí sàn cho người bán.',
      tone: 'warning',
    }
  }

  if (order.status === 'completed') {
    return {
      label: 'Hoàn tất',
      helperText: 'Giao dịch đã hoàn tất.',
      tone: 'success',
    }
  }

  if (order.status === 'awaiting_buyer_confirmation' && order.fundingStatus === 'held') {
    const deadlineText = order.buyerConfirmationDeadline
      ? ` Hết hạn xác nhận vào ${formatOrderDate(order.buyerConfirmationDeadline)}.`
      : ''

    return {
      label: 'Chờ người mua xác nhận',
      helperText:
        'Người bán đã xác nhận gửi hàng và tải bằng chứng. Người mua có 5 ngày để test xe, xác nhận đã nhận hoặc khiếu nại trước khi hệ thống tự hoàn tất đơn.' +
        deadlineText,
      tone: 'warning',
    }
  }

  if (
    (order.status === 'deposited' || order.status === 'awaiting_buyer_confirmation') &&
    order.fundingStatus === 'refund_pending'
  ) {
    return {
      label: 'Chờ admin duyệt hoàn tiền',
      helperText: 'Người mua đã gửi yêu cầu hoàn tiền. Đơn hàng đang tạm dừng để admin xem xét.',
      tone: 'warning',
    }
  }

  if (
    (order.status === 'deposited' || order.status === 'awaiting_buyer_confirmation') &&
    order.fundingStatus === 'refund_pending_transfer'
  ) {
    return {
      label: 'Chờ chuyển khoản hoàn tiền',
      helperText: 'Admin đã duyệt hoàn tiền và đang chờ chuyển khoản thủ công lại cho người mua.',
      tone: 'warning',
    }
  }

  if (order.status === 'cancelled' && order.fundingStatus === 'refund_pending_transfer') {
    return {
      label: 'Chờ chuyển khoản hoàn tiền',
      helperText: 'Khoản thanh toán đến sau khi đơn bị hủy đang chờ hoàn thủ công cho người mua.',
      tone: 'warning',
    }
  }

  if (order.status === 'cancelled' && order.fundingStatus === 'refund_pending') {
    return {
      label: 'Đang chờ hoàn tiền',
      helperText: 'Admin đang xem xét yêu cầu hoàn tiền của đơn hàng này.',
      tone: 'warning',
    }
  }

  if (order.status === 'cancelled' && order.fundingStatus === 'refunded') {
    return {
      label: 'Đã hoàn tiền',
      helperText: 'Khoản thanh toán đã được hoàn lại và đơn hàng đã đóng.',
      tone: 'success',
    }
  }

  if (order.status === 'cancelled' && order.cancelReason === 'seller_rejected') {
    return {
      label: 'Bị người bán từ chối',
      helperText:
        'Người bán đã chọn một yêu cầu mua khác hoặc không tiếp tục yêu cầu này. Bạn có thể theo dõi listing khác hoặc thử lại nếu xe được mở bán trở lại.',
      tone: 'danger',
    }
  }

  if (order.status === 'cancelled' && order.cancelReason === 'payment_expired') {
    return {
      label: 'Đã hết hạn thanh toán',
      helperText: 'Người mua không thanh toán đúng hạn nên đơn đã tự hủy.',
      tone: 'danger',
    }
  }

  if (order.status === 'cancelled') {
    return {
      label: 'Đã hủy',
      helperText: 'Đơn hàng đã bị hủy trước khi hoàn tất.',
      tone: 'danger',
    }
  }

  if (order.status === 'deposited' && order.fundingStatus === 'held') {
    return {
      label: 'Đã đặt cọc',
      helperText: 'Hệ thống đã giữ khoản thanh toán hiện tại và đang chờ người bán xác nhận gửi hàng.',
      tone: 'info',
    }
  }

  if (order.status === 'pending' && order.fundingStatus === 'awaiting_payment' && isPaymentDeadlineExpired(order, nowMs)) {
    return {
      label: 'Đã hết hạn thanh toán',
      helperText: 'Đơn hàng đã quá hạn thanh toán và sẽ tự hủy hoặc đang đồng bộ trạng thái hủy.',
      tone: 'danger',
    }
  }

  if (order.status === 'pending' && order.fundingStatus === 'awaiting_payment') {
    return {
      label: 'Chờ thanh toán',
      helperText:
        'Người bán đã duyệt đơn, người mua cần hoàn tất khoản thanh toán online hiện tại theo breakdown được hiển thị.',
      tone: 'warning',
    }
  }

  if (order.status === 'pending' && order.fundingStatus === 'unpaid') {
    return {
      label: 'Chờ người bán xem xét',
      helperText:
        'Yêu cầu mua đã được gửi. Người bán có thể đang xem nhiều yêu cầu mua cho cùng listing và sẽ chọn đơn đi tiếp.',
      tone: 'muted',
    }
  }

  return {
    label: 'Đang xử lý',
    helperText: 'Đơn hàng đang ở trạng thái trung gian.',
    tone: 'muted',
  }
}

export function canSellerAcceptOrder(order: Order) {
  return order.status === 'pending' && order.fundingStatus === 'unpaid'
}

export function canSellerConfirmCashDeposit(_order: Order, _nowMs = Date.now()) {
  return false
}

export function canSellerCompleteOrder(order: Order) {
  return order.status === 'deposited' && order.fundingStatus === 'held'
}

export function canBuyerConfirmReceived(order: Order) {
  return order.status === 'awaiting_buyer_confirmation' && order.fundingStatus === 'held'
}

export function canCancelOpenOrder(order: Order, nowMs = Date.now()) {
  return (
    order.status === 'pending' &&
    (order.fundingStatus === 'unpaid' ||
      (order.fundingStatus === 'awaiting_payment' && !isPaymentDeadlineExpired(order, nowMs)))
  )
}

export function canBuyerRequestPayment(order: Order, nowMs = Date.now()) {
  return (
    order.status === 'pending' &&
    order.fundingStatus === 'awaiting_payment' &&
    order.paymentMethod !== 'cash' &&
    !isPaymentDeadlineExpired(order, nowMs)
  )
}

export function canBuyerRequestRefund(order: Order) {
  return (
    (order.status === 'deposited' || order.status === 'awaiting_buyer_confirmation') &&
    order.fundingStatus === 'held' &&
    (order.paidAmount ?? 0) > 0
  )
}

export function canBuyerSubmitReview(order: Order) {
  return order.status === 'completed' && !order.buyerReviewSubmitted
}
