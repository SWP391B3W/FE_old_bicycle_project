import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAccountMenu } from '@/components/UserAccountMenu'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { useNotificationUnreadCount } from '@/lib/use-notification-unread-count'
import {
  canAccessSellerEntry,
  getAppHeaderNavigation,
  getRoleDashboardEntry,
  getSellEntryHref,
} from '@/layouts/app-header-visibility'

export default function Header() {
  const { user, isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  const unreadCount = useNotificationUnreadCount()
  const navigationItems = getAppHeaderNavigation(user?.role, isAuthenticated)
  const showSellerEntry = canAccessSellerEntry(user?.role, isAuthenticated)
  const sellEntryHref = getSellEntryHref(user?.role, isAuthenticated)
  const dashboardEntry = getRoleDashboardEntry(user?.role)

  function isActive(item: (typeof navigationItems)[number]) {
    if (item.match) {
      return item.match(pathname)
    }

    if (item.to === ROUTES.HOME) {
      return pathname === item.to
    }

    return pathname.startsWith(item.to)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b1120]/95 backdrop-blur-xl shadow-sm shadow-black/30">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-4 sm:px-8 lg:px-10">
        <Link to={ROUTES.HOME} className="flex items-center gap-3 justify-self-start">
          <Logo className="h-11 w-11 rounded-xl shadow-none" showText={false} />
          <span className="text-lg font-semibold tracking-tight text-white">Market Bike</span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full px-1 py-1 text-sm md:flex">
          {navigationItems.map((item) => (
            <Link
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={[
                'rounded-full px-5 py-2.5 font-semibold transition duration-200',
                isActive(item)
                  ? 'bg-[linear-gradient(180deg,#29b6ff,#1f9df4)] text-white shadow-[0_0_24px_rgba(41,182,255,0.35)] ring-1 ring-white/18'
                  : 'text-white hover:bg-white/6 hover:text-white',
              ].join(' ')}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-self-end gap-3">
          {isAuthenticated ? (
            <>
              {dashboardEntry ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden rounded-full border-white/12 bg-white/5 px-4 text-white hover:bg-white/10 hover:text-white sm:inline-flex"
                  asChild
                >
                  <Link to={dashboardEntry.href}>{dashboardEntry.label}</Link>
                </Button>
              ) : null}

              <ThemeToggle className="rounded-full border border-transparent text-white hover:bg-white/8 hover:text-white" />
              <NotificationDropdown
                unreadCount={unreadCount}
                className="rounded-full border border-transparent text-white hover:bg-white/8 hover:text-white"
              />
              <UserAccountMenu />
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/12 bg-white/5 text-white hover:bg-white/8 hover:text-white"
                asChild
              >
                <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
              </Button>
              <Button size="sm" className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-secondary" asChild>
                <Link to={ROUTES.REGISTER}>Đăng ký</Link>
              </Button>
              {showSellerEntry ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden rounded-full border-white/12 bg-white/5 text-white hover:bg-white/8 hover:text-white sm:inline-flex"
                  asChild
                >
                  <Link to={sellEntryHref}>Bắt đầu bán</Link>
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
