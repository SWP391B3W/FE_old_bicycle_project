import { getResult, patchResult, compactParams } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type {
  AdminUser,
  AdminUserActivity,
  AdminUserFilters,
  AdminUserPasswordResetRequest,
  AdminUserStatusUpdateRequest,
} from '@/types/admin-user'

export const adminUsersApi = {
  getAll(filters: AdminUserFilters = {}) {
    return getResult<PageResult<AdminUser>>('/api/admin/users', {
      params: compactParams(filters),
    })
  },

  getById(userId: string) {
    return getResult<AdminUser>(`/api/admin/users/${userId}`)
  },

  updateStatus(userId: string, request: AdminUserStatusUpdateRequest) {
    return patchResult<AdminUser, AdminUserStatusUpdateRequest>(`/api/admin/users/${userId}/status`, request)
  },

  resetPassword(userId: string, request: AdminUserPasswordResetRequest) {
    return patchResult<string, AdminUserPasswordResetRequest>(`/api/admin/users/${userId}/password`, request)
  },

  getActivity(userId: string) {
    return getResult<AdminUserActivity>(`/api/admin/users/${userId}/activity`)
  },
}
