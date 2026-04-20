import { Outlet, useNavigate } from 'react-router-dom'
import { Home, LogOut } from 'lucide-react'
import { Sidebar, adminNavItems } from '@/components/dashboard/Sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.HOME)
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar items={adminNavItems} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm shadow-slate-900/5">
          <h1 className="text-lg font-semibold text-slate-900">Quản trị hệ thống</h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.HOME)}
              className="border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:text-sky-800"
            >
              <Home className="mr-2 h-4 w-4" />
              Trang chủ
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
