import { ROUTES } from '@/constants/routes'
import type { AppRole } from '@/types/auth'

export interface AppHeaderNavigationItem {
  name: string
  href: string
}

const baseNavigation: AppHeaderNavigationItem[] = [
  { name: 'Trang chủ', href: ROUTES.HOME },
  { name: 'Mua xe', href: ROUTES.MARKET },
  { name: 'Bán xe', href: ROUTES.SELL },
  { name: 'Tin nhắn', href: ROUTES.MESSAGES },
  { name: 'Hướng dẫn', href: ROUTES.GUIDE },
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

export function getAppHeaderNavigation(role?: AppRole | null, isAuthenticated = false) {
  const baseItems = canAccessSellerEntry(role, isAuthenticated)
    ? baseNavigation.map((item) =>
        item.href === ROUTES.SELL
          ? { ...item, href: getSellEntryHref(role, isAuthenticated) }
          : item,
      )
    : baseNavigation.filter((item) => item.href !== ROUTES.SELL)

  if (isAuthenticated) {
    return [...baseItems, { name: 'Trợ lý', href: ROUTES.ASSISTANT }]
  }

  return baseItems
}
