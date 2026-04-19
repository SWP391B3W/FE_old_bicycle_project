import { ROUTES } from '@/constants/routes'
import type { AppRole } from '@/types/auth'

export interface AppHeaderNavigationItem {
  label: string
  to: string
  match?: (pathname: string) => boolean
}

export interface RoleDashboardEntry {
  href: string
  label: string
}

const baseNavigation: AppHeaderNavigationItem[] = [
  { label: 'Trang chủ', to: ROUTES.HOME, match: (pathname) => pathname === ROUTES.HOME },
  { label: 'Mua xe', to: ROUTES.MARKET, match: (pathname) => pathname === ROUTES.MARKET || pathname.startsWith('/bikes/') },
  { label: 'Bán xe', to: ROUTES.SELL, match: (pathname) => pathname === ROUTES.SELL || pathname.startsWith(ROUTES.SELLER) },
  { label: 'Nhắn tin', to: ROUTES.MESSAGES, match: (pathname) => pathname.startsWith(ROUTES.MESSAGES) },
  { label: 'Hướng dẫn', to: ROUTES.GUIDE, match: (pathname) => pathname === ROUTES.GUIDE },
]

export function canAccessSellerEntry(role?: AppRole | null, isAuthenticated = false) {
  return !isAuthenticated || role === 'seller'
}

export function getSellEntryHref(role?: AppRole | null, isAuthenticated = false) {
  if (role === 'seller' && isAuthenticated) {
    return ROUTES.SELLER_NEW_PRODUCT
  }

  return ROUTES.SELL
}

export function getRoleLabel(role?: AppRole | null) {
  switch (role) {
    case 'seller':
      return 'Người bán'
    case 'inspector':
      return 'Kiểm định viên'
    case 'admin':
      return 'Quản trị viên'
    case 'buyer':
    default:
      return 'Người mua'
  }
}

export function getRoleDashboardEntry(role?: AppRole | null): RoleDashboardEntry | null {
  switch (role) {
    case 'seller':
      return { href: ROUTES.SELLER, label: 'Kênh người bán' }
    case 'inspector':
      return { href: ROUTES.INSPECTOR, label: 'Kênh kiểm định' }
    case 'admin':
      return { href: ROUTES.ADMIN, label: 'Trang quản trị' }
    default:
      return null
  }
}

export function getAppHeaderNavigation(role?: AppRole | null, isAuthenticated = false) {
  const showSellerEntry = canAccessSellerEntry(role, isAuthenticated)

  return baseNavigation
    .filter((item) => showSellerEntry || item.to !== ROUTES.SELL)
    .map((item) => (item.to === ROUTES.SELL ? { ...item, to: getSellEntryHref(role, isAuthenticated) } : item))
}
