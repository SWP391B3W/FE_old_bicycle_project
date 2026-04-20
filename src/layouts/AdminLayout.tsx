import { Outlet } from 'react-router-dom'
import { Sidebar, adminNavItems } from '@/components/dashboard/Sidebar'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAccountMenu } from '@/components/UserAccountMenu'
import { useNotificationUnreadCount } from '@/lib/use-notification-unread-count'

export default function AdminLayout() {
  const unreadCount = useNotificationUnreadCount()

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar items={adminNavItems} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0b1120] px-6 shadow-sm shadow-black/30">
          <h1 className="text-lg font-semibold text-white">Quản trị hệ thống</h1>

          <div className="flex items-center gap-3">
            <ThemeToggle className="rounded-full text-white hover:bg-white/8 hover:text-white" />
            <NotificationDropdown
              unreadCount={unreadCount}
              className="rounded-full text-white hover:bg-white/8 hover:text-white"
            />
            <UserAccountMenu />
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
