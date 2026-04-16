import { Outlet, useNavigate } from 'react-router-dom'
import { Home, LogOut, User } from 'lucide-react'
import { Sidebar, sellerNavItems } from '@/components/dashboard/Sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useNotificationUnreadCount } from '@/lib/use-notification-unread-count'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function SellerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const unreadCount = useNotificationUnreadCount()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.HOME)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar items={sellerNavItems} title="Kênh Người Bán" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="text-lg font-semibold">Kênh Người Bán</h1>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationDropdown unreadCount={unreadCount} />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar ?? undefined} />
                    <AvatarFallback className="text-sm">
                      {(user?.firstName || user?.email)?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                  <User className="mr-2 h-4 w-4" />
                  Trang cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(ROUTES.HOME)}>
                  <Home className="mr-2 h-4 w-4" />
                  Về trang mua bán
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
