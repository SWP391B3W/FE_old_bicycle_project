import type { AuthUser } from '@/types/auth'

export type ProfileTabId = 'profile' | 'orders' | 'listings' | 'wishlist' | 'reviews' | 'payout' | 'security'

export interface ProfileFormData {
  firstName: string
  lastName: string
  phone: string
  address: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmNewPassword: string
}

export const INITIAL_PASSWORD_FORM_DATA: PasswordFormData = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
}

export function createProfileFormData(user?: AuthUser | null): ProfileFormData {
  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.defaultAddress || user?.address || '',
  }
}