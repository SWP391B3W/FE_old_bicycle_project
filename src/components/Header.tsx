import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import {
  canAccessSellerEntry,
  getAppHeaderNavigation,
  getRoleDashboardEntry,
  getRoleLabel,
  getSellEntryHref,
} from '@/layouts/app-header-visibility'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const { pathname } = useLocation()
  const navigationItems = getAppHeaderNavigation(user?.role, isAuthenticated)
  const showSellerEntry = canAccessSellerEntry(user?.role, isAuthenticated)
  const sellEntryHref = getSellEntryHref(user?.role, isAuthenticated)
  const dashboardEntry = getRoleDashboardEntry(user?.role)
  const roleLabel = getRoleLabel(user?.role)

  function isActive(item: (typeof navigationItems)[number]) {
    if (item.match) {
      return item.match(pathname)
    }

    if (item.to === ROUTES.HOME) {
      return pathname === item.to
    }

    return pathname.startsWith(item.to)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl shadow-sm shadow-slate-950/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-10">
        <Link to={ROUTES.HOME} className="flex items-center gap-3">
          <Logo className="h-11 w-11" showText={false} />
          <span className="text-lg font-semibold tracking-tight text-white">Market Bike</span>
        </Link>

        <div className="hidden items-center gap-3 text-sm text-slate-200 md:flex">
          {navigationItems.map((item) => (
            <Link
              key={`${item.label}-${item.to}`}
              to={item.to}
              className={[
                'rounded-full px-4 py-2 font-medium transition',
                isActive(item)
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-200 hover:bg-white/5 hover:text-white',
              ].join(' ')}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {dashboardEntry ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sky-400/50 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20 hover:text-white"
                  asChild
                >
                  <Link to={dashboardEntry.href}>{dashboardEntry.label}</Link>
                </Button>
              ) : null}
              <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white shadow-sm shadow-slate-950/20">
                <span>{roleLabel}: {user?.email}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="border-red-400/50 bg-red-950/60 text-red-100 hover:bg-red-900/80 hover:text-red-50"
                >
                  Đăng xuất
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300/35 bg-slate-900/70 text-slate-100 hover:bg-slate-800/80 hover:text-white"
                asChild
              >
                <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
              </Button>
              <Button size="sm" className="bg-sky-500 text-white hover:bg-sky-400" asChild>
                <Link to={ROUTES.REGISTER}>Đăng ký</Link>
              </Button>
              {showSellerEntry ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sky-400/50 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20 hover:text-white"
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
