import type { PayoutProfile } from '@/types/payout'

export function isPayoutProfileReady(profile: PayoutProfile | null | undefined) {
  if (!profile) {
    return false
  }

  return [profile.bankCode, profile.bankBin, profile.accountNumber, profile.accountName].every(
    (value) => typeof value === 'string' && value.trim().length > 0,
  )
}
