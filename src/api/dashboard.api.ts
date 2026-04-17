import { getResult } from '@/lib/http'
import type { DashboardStats } from '@/types/dashboard'

export const dashboardApi = {
  getStats() {
    return getResult<DashboardStats>('/api/admin/dashboard/stats')
  },
}
