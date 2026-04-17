import { compactParams, getResult, http, putResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type { Report, ReportProcessRequest, ReportRequest, ReportStatus } from '@/types/report'

export interface AdminReportFilters {
  status?: ReportStatus
  targetType?: string
  page?: number
  size?: number
}

function buildReportFormData(request: ReportRequest) {
  const formData = new FormData()

  formData.append('targetId', request.targetId)
  formData.append('targetType', request.targetType)
  formData.append('reason', request.reason)

  if (request.description?.trim()) {
    formData.append('description', request.description.trim())
  }

  request.files?.forEach((file) => {
    formData.append('files', file)
  })

  return formData
}

export const reportsApi = {
  async submit(request: ReportRequest) {
    const response = await http.post('/api/reports', buildReportFormData(request), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    return response.data.result as Report
  },

  getMine(page = 0, size = 15) {
    return getResult<PageResult<Report>>('/api/reports/me', {
      params: { page, size },
    })
  },

  getAdminReports(filters: AdminReportFilters = {}) {
    return getResult<PageResult<Report>>('/api/admin/reports', {
      params: compactParams(filters),
    })
  },

  process(reportId: string, request: ReportProcessRequest) {
    return putResult<Report, ReportProcessRequest>(`/api/admin/reports/${reportId}/process`, request)
  },
}
