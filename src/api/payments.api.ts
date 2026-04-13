import { getResult, postResult } from '@/lib/http'
import type { PaymentHistoryItem, PaymentRequestResponse } from '@/types/payment'

export const paymentsApi = {
  createRequest(orderId: string) {
    return postResult<PaymentRequestResponse>(`/api/payments/orders/${orderId}/request`)
  },

  getByOrder(orderId: string) {
    return getResult<PaymentHistoryItem[]>(`/api/payments/orders/${orderId}`)
  },
}