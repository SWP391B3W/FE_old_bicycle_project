import { compactParams, getResult, http, patchResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { AdminRefund, AdminRefundFilters, Refund, RefundRequest, RefundReviewRequest } from '@/types/refund'

function buildRefundFormData(request: RefundRequest) {
  const formData = new FormData()

  // BE expects @RequestPart("request") as a JSON blob
  const requestPayload = {
    amount: request.amount,
    reason: request.reason,
    ...(request.evidenceNote?.trim() ? { evidenceNote: request.evidenceNote.trim() } : {}),
  }
  formData.append('request', new Blob([JSON.stringify(requestPayload)], { type: 'application/json' }))

  request.files?.forEach((file) => {
    formData.append('files', file)
  })

  return formData
}

export const refundsApi = {
  async create(orderId: string, request: RefundRequest) {
    const response = await http.post(`/api/refunds/orders/${orderId}`, buildRefundFormData(request), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.result as Refund
  },

  getAll(filters: AdminRefundFilters = {}) {
    return getResult<PageResult<AdminRefund>>('/api/admin/refunds', {
      params: compactParams(filters),
    })
  },

  review(refundId: string, request: RefundReviewRequest) {
    return patchResult<Refund, RefundReviewRequest>(`/api/admin/refunds/${refundId}/review`, request)
  },
}
