import { CreditCard, Heart, Lock, Package, ShoppingBag, Star, User, type LucideIcon } from 'lucide-react'
import type { AppRole } from '@/types/auth'
import type { ProfileTabId } from './profile.types'

export interface ProfileTabDefinition {
  id: ProfileTabId
  label: string
  icon: LucideIcon
}

export const PROFILE_TABS: ProfileTabDefinition[] = [
  { id: 'profile', label: 'Thông tin', icon: User },
  { id: 'orders', label: 'Đơn mua', icon: ShoppingBag },
  { id: 'listings', label: 'Tin đăng', icon: Package },
  { id: 'wishlist', label: 'Yêu thích', icon: Heart },
  { id: 'reviews', label: 'Đánh giá', icon: Star },
  { id: 'payout', label: 'Nhận tiền', icon: CreditCard },
  { id: 'security', label: 'Bảo mật', icon: Lock },
]

const PROFILE_TAB_IDS = new Set<ProfileTabId>(PROFILE_TABS.map((tab) => tab.id))
const BUYER_HIDDEN_TABS = new Set<ProfileTabId>(['listings'])
const SELLER_HIDDEN_TABS = new Set<ProfileTabId>(['orders'])
const INSPECTOR_HIDDEN_TABS = new Set<ProfileTabId>(['orders', 'listings', 'wishlist', 'reviews', 'payout'])
const ADMIN_HIDDEN_TABS = new Set<ProfileTabId>(['orders', 'listings', 'wishlist', 'reviews'])

export function isProfileTabId(value: string | null): value is ProfileTabId {
  return value !== null && PROFILE_TAB_IDS.has(value as ProfileTabId)
}

export function getVisibleProfileTabs(role?: AppRole | null) {
  return PROFILE_TABS.filter((tab) => {
    if (role === 'buyer' && BUYER_HIDDEN_TABS.has(tab.id)) {
      return false
    }

    if (role === 'seller' && SELLER_HIDDEN_TABS.has(tab.id)) {
      return false
    }

    if (role === 'inspector' && INSPECTOR_HIDDEN_TABS.has(tab.id)) {
      return false
    }

    if (role === 'admin' && ADMIN_HIDDEN_TABS.has(tab.id)) {
      return false
    }

    return true
  })
}