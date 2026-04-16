import { compactParams, getResult, http, postResult } from '@/lib/http'
import type {
  Inspection,
  InspectionDashboard,
  InspectionEvaluationRequest,
  InspectionHistoryItem,
  InspectionListFilters,
  InspectionRequestItem,
} from '@/types/inspection'
import type { PageResult } from '@/types/api'
import type { Product } from '@/types/product'

export const inspectionsApi = {
  request(productId: string) {
    return postResult<Inspection>(`/api/inspections/request/${productId}`)
  },

  evaluate(productId: string, request: InspectionEvaluationRequest) {
    return postResult<Inspection, InspectionEvaluationRequest>(`/api/inspections/evaluate/${productId}`, request)
  },

  async uploadReport(productId: string, reportFile: File) {
    const formData = new FormData()
    formData.append('reportFile', reportFile)
    const response = await http.post(`/api/inspections/report/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.result as Inspection
  },

  getByProduct(productId: string) {
    return getResult<Inspection | null>(`/api/inspections/product/${productId}`)
  },

  getProductContext(productId: string) {
    return getResult<Product>(`/api/inspections/product-context/${productId}`)
  },

  getDashboard() {
    return getResult<InspectionDashboard>('/api/inspections/dashboard')
  },

  getRequests(filters: InspectionListFilters) {
    return getResult<PageResult<InspectionRequestItem>>('/api/inspections/requests', {
      params: compactParams(filters),
    })
  },

  getHistory(filters: InspectionListFilters) {
    return getResult<PageResult<InspectionHistoryItem>>('/api/inspections/history', {
      params: compactParams(filters),
    })
  },
}
