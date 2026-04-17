import { compactParams, getResult, patchResult, putResult } from '@/lib/http'
import type { PageResult } from '@/types/api'
import type {
  AdminPayout,
  AdminPayoutFilters,
  PayoutCompleteRequest,
  PayoutProfile,
  PayoutProfileUpsertRequest,
} from '@/types/payout'

export const payoutsApi = {
  getMyProfile() {
    return getResult<PayoutProfile | null>('/api/payout-profiles/me')
  },

  upsertMyProfile(request: PayoutProfileUpsertRequest) {
    return putResult<PayoutProfile, PayoutProfileUpsertRequest>('/api/payout-profiles/me', request)
  },

  getAdminPayouts(filters: AdminPayoutFilters = {}) {
    return getResult<PageResult<AdminPayout>>('/api/admin/payouts', {
      params: compactParams(filters),
    })
  },

  completeAdminPayout(payoutId: string, request: PayoutCompleteRequest) {
    return patchResult<AdminPayout, PayoutCompleteRequest>(`/api/admin/payouts/${payoutId}/complete`, request)
  },

  remindProfileRequiredPayout(payoutId: string) {
    return patchResult<AdminPayout, undefined>(`/api/admin/payouts/${payoutId}/remind-profile`)
  },
}
