import { Outlet } from 'react-router-dom'
import { Sidebar, inspectorNavItems } from '@/components/dashboard/Sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAccountMenu } from '@/components/UserAccountMenu'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'
import { useNotificationUnreadCount } from '@/lib/use-notification-unread-count'

export default function InspectorLayout() {
  const unreadCount = useNotificationUnreadCount()

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar items={inspectorNavItems} title="Inspector" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0b1120] px-6 shadow-sm shadow-black/30">
          <h1 className="text-lg font-semibold text-white">Trung tâm kiểm định</h1>

          <div className="flex items-center gap-3">
            <ThemeToggle className="rounded-full text-white hover:bg-white/8 hover:text-white" />
            <NotificationDropdown
              unreadCount={unreadCount}
              className="rounded-full text-white hover:bg-white/8 hover:text-white"
            />
            <UserAccountMenu />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
