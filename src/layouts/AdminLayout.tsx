import { Outlet } from 'react-router-dom'
import { Sidebar, adminNavItems } from '@/components/dashboard/Sidebar'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { UserAccountMenu } from '@/components/UserAccountMenu'
import { useNotificationUnreadCount } from '@/lib/use-notification-unread-count'

export default function AdminLayout() {
  const unreadCount = useNotificationUnreadCount()

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar items={adminNavItems} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Quản trị hệ thống</h1>

          <div className="flex items-center gap-3">
            <NotificationDropdown
              unreadCount={unreadCount}
              className="rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            />
            <UserAccountMenu isDarkHeader={false} />
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
