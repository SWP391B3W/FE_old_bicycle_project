import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Bike,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Flag,
  History,
  LayoutDashboard,
  Package,
  Scale,
  ShoppingBag,
  Tags,
  Users,
  Wallet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
}

interface SidebarProps {
  items: NavItem[]
  title?: string
}

export function Sidebar({ items }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-3">
        {collapsed ? (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed((current) => !current)} className="mx-auto">
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Link
              to={ROUTES.HOME}
              className="flex min-w-0 flex-1 items-center gap-2 text-foreground hover:opacity-80"
              title="Về trang chủ"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Bike className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="truncate text-base font-bold">BikeExchange</span>
            </Link>

            <Button variant="ghost" size="icon" onClick={() => setCollapsed((current) => !current)} className="shrink-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {items.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted',
                    isActive && 'bg-primary/10 font-medium text-primary',
                    collapsed && 'justify-center',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: ROUTES.ADMIN },
  { icon: Users, label: 'Người dùng', href: ROUTES.ADMIN_USERS },
  { icon: ShoppingBag, label: 'Đơn hàng', href: ROUTES.ADMIN_ORDERS },
  { icon: FileText, label: 'Tin đăng', href: ROUTES.ADMIN_LISTINGS },
  { icon: Flag, label: 'Báo cáo', href: ROUTES.ADMIN_REPORTS },
  { icon: Tags, label: 'Danh mục', href: ROUTES.ADMIN_CATEGORIES },
  { icon: Scale, label: 'Tranh chấp', href: ROUTES.ADMIN_DISPUTES },
  { icon: Wallet, label: 'Giải ngân', href: ROUTES.ADMIN_PAYOUTS },
]

export const inspectorNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: ROUTES.INSPECTOR },
  { icon: ClipboardCheck, label: 'Yêu cầu kiểm định', href: ROUTES.INSPECTOR_REQUESTS },
  { icon: History, label: 'Lịch sử', href: ROUTES.INSPECTOR_HISTORY },
]

export const sellerNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Tổng quan', href: ROUTES.SELLER },
  { icon: Package, label: 'Quản lý tin đăng', href: ROUTES.SELLER_LISTINGS },
  { icon: ShoppingBag, label: 'Quản lý đơn cọc', href: ROUTES.SELLER_ORDERS },
]
