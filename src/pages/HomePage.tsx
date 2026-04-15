import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import Logo from '@/components/Logo'

export default function HomePage() {
  const { user, logout, isAuthenticated } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-slate-950 px-6 py-8 sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.86))]" />
        <div className="relative mx-auto max-w-7xl">
          <nav className="flex flex-wrap items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <Logo className="h-11 w-11" showText={false} />
              <span className="text-lg font-semibold tracking-tight text-white">Market Bike</span>
            </div>
            <div className="hidden items-center gap-8 text-sm text-slate-200 md:flex">
              <Link className="transition hover:text-white" to={ROUTES.HOME}>Trang chủ</Link>
              <Link className="transition hover:text-white" to={ROUTES.MARKET}>Mua xe</Link>
              <Link className="transition hover:text-white" to={ROUTES.SELL}>Bán xe</Link>
              <a className="transition hover:text-white" href="#guide">Hướng dẫn</a>
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
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" asChild>
                    <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
                  </Button>
                  <Button size="sm" className="bg-sky-500 text-white hover:bg-sky-400" asChild>
                    <Link to={ROUTES.REGISTER}>Đăng ký</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>

          <div className="mx-auto mt-10 max-w-4xl text-center">
            <span className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-sky-100 ring-1 ring-white/20">
              Nền tảng mua bán xe đạp thể thao
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Nền tảng mua bán xe đạp thể thao cũ có kiểm định
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
              Tìm kiếm linh hoạt, an tâm giao dịch với mọi tin đăng đã được ban quản trị kiểm định kỹ lưỡng.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="rounded-full bg-sky-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400">
                <Link to={ROUTES.MARKET}>Khám phá tin mua xe</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-white/20 px-7 py-3 text-sm font-semibold text-white hover:bg-white/10">
                <Link to={ROUTES.SELL}>Đăng tin bán xe</Link>
              </Button>
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-white/15 bg-slate-900/75 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur sm:p-6">
              <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr_1fr_1fr]">
                <div>
                  <label className="sr-only" htmlFor="query">Tìm kiếm</label>
                  <input
                    id="query"
                    type="text"
                    placeholder="Tìm theo tên xe, thương hiệu"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-800/90 px-4 text-white placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="province">Tỉnh</label>
                  <select
                    id="province"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-800/90 px-4 text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  >
                    <option>Tất cả tỉnh thành</option>
                    <option>Hà Nội</option>
                    <option>TP. Hồ Chí Minh</option>
                  </select>
                </div>
                <div>
                  <label className="sr-only" htmlFor="district">Quận/huyện</label>
                  <select
                    id="district"
                    className="h-14 w-full rounded-2xl border border-white/10 bg-slate-800/90 px-4 text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                  >
                    <option>Tất cả quận/huyện</option>
                    <option>Quận 1</option>
                    <option>Quận 3</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <Button className="h-14 w-full rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400">
                    Tìm kiếm
                  </Button>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-sky-600/10 px-4 py-3 text-center text-sm text-slate-100 ring-1 ring-white/10">
                Mọi tin đăng đều đã qua kiểm định
              </div>
              <div className="rounded-2xl bg-sky-600/10 px-4 py-3 text-center text-sm text-slate-100 ring-1 ring-white/10">
                Đặt cọc và xác nhận giao dịch an toàn
              </div>
              <div className="rounded-2xl bg-sky-600/10 px-4 py-3 text-center text-sm text-slate-100 ring-1 ring-white/10">
                Hoàn tiền và giải ngân đối soát kỹ lưỡng
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="text-xl font-semibold text-slate-900">Khám phá xe chất lượng</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Duyệt qua các tin đăng đã được kiểm tra kỹ, chọn xe phù hợp theo nhu cầu và ngân sách.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="text-xl font-semibold text-slate-900">Giao dịch an tâm</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Hỗ trợ đặt cọc và xác nhận giao dịch, cam kết tỷ lệ mua bán minh bạch, rõ ràng.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-900/5">
            <h2 className="text-xl font-semibold text-slate-900">Hỗ trợ khách hàng</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Đội ngũ hỗ trợ nhanh chóng giải đáp thắc mắc, hỗ trợ quá trình đăng tin và trao đổi.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}