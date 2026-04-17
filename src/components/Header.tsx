import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/constants/routes'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()

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

        <div className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
          <Link className="transition hover:text-white" to={ROUTES.HOME}>
            Trang chủ
          </Link>
          <Link className="transition hover:text-white" to={ROUTES.MARKET}>
            Mua xe
          </Link>
          <Link className="transition hover:text-white" to={ROUTES.SELL}>
            Bán xe
          </Link>
          <Link className="transition hover:text-white" to={ROUTES.MESSAGES}>
            Nhắn tin
          </Link>
          <Link className="transition hover:text-white" to={ROUTES.GUIDE}>
            Hướng dẫn
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white shadow-sm shadow-slate-950/20">
              <span>Hi, {user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10">
                Đăng xuất
              </Button>
            </div>
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
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
