import { compactParams, getResult, http, patchResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { AdminRefund, AdminRefundFilters, Refund, RefundRequest, RefundReviewRequest } from '@/types/refund'

function buildRefundFormData(request: RefundRequest) {
  const formData = new FormData()

  formData.append('amount', String(request.amount))
  formData.append('reason', request.reason)

  if (request.evidenceNote?.trim()) {
    formData.append('evidenceNote', request.evidenceNote.trim())
  }

  request.files?.forEach((file) => {
    formData.append('files', file)
  })

  return formData
}

export const refundsApi = {
  async create(orderId: string, request: RefundRequest) {
    const response = await http.post(`/api/orders/${orderId}/refunds`, buildRefundFormData(request), {
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
