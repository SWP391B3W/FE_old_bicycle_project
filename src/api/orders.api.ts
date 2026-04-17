import { getResult, http, patchResult, postResult } from '@/lib/http'
import type { Order, OrderCreateRequest, OrderEvidenceInput } from '@/types/order'

function buildOrderEvidenceFormData(input?: OrderEvidenceInput) {
  const formData = new FormData()

  if (input?.note?.trim()) {
    formData.append('note', input.note.trim())
  }

  input?.files?.forEach((file) => {
    formData.append('files', file)
  })

  return formData
}

export const ordersApi = {
  create(request: OrderCreateRequest) {
    return postResult<Order, OrderCreateRequest>('/api/orders', request)
  },

  getMine() {
    return getResult<Order[]>('/api/orders/me')
  },

  accept(orderId: string) {
    return patchResult<Order>(`/api/orders/${orderId}/accept`)
  },

  confirmDeposit(orderId: string) {
    return patchResult<Order>(`/api/orders/${orderId}/confirm-deposit`)
  },

  async complete(orderId: string, input: OrderEvidenceInput) {
    const response = await http.patch(`/api/orders/${orderId}/complete`, buildOrderEvidenceFormData(input), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.result as Order
  },

  async confirmReceived(orderId: string, input: OrderEvidenceInput) {
    const response = await http.patch(`/api/orders/${orderId}/confirm-received`, buildOrderEvidenceFormData(input), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.result as Order
  },

  cancel(orderId: string) {
    return patchResult<Order>(`/api/orders/${orderId}/cancel`)
  },
}
