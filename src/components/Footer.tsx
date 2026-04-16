import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import Logo from '@/components/Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-700 bg-slate-950 text-slate-200">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10" showText={false} />
              <span className="text-lg font-semibold tracking-tight text-white">Market Bike</span>
            </div>
            <p className="text-sm leading-6 text-slate-400">
              Nền tảng mua bán xe đạp thể thao cũ có kiểm định. Giao dịch an tâm với mọi tin đăng đã được kiểm tra kỹ lưỡng.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#facebook"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-800 text-sky-400 hover:bg-sky-500 hover:text-white transition"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="#twitter"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-800 text-sky-400 hover:bg-sky-500 hover:text-white transition"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="#instagram"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-slate-800 text-sky-400 hover:bg-sky-500 hover:text-white transition"
                aria-label="Instagram"
              >
                ◎
              </a>
            </div>
          </div>

          {/* Browse Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Duyệt</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={ROUTES.MARKET} className="text-slate-400 hover:text-sky-400 transition">
                  Mua xe
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SELL} className="text-slate-400 hover:text-sky-400 transition">
                  Bán xe
                </Link>
              </li>
              <li>
                <Link to={ROUTES.MESSAGES} className="text-slate-400 hover:text-sky-400 transition">
                  Nhắn tin
                </Link>
              </li>
              <li>
                <Link to={ROUTES.HOME} className="text-slate-400 hover:text-sky-400 transition">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to={ROUTES.GUIDE} className="text-slate-400 hover:text-sky-400 transition">
                  Hướng dẫn
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#contact" className="text-slate-400 hover:text-sky-400 transition">
                  Liên hệ chúng tôi
                </a>
              </li>
              <li>
                <a href="#faq" className="text-slate-400 hover:text-sky-400 transition">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#help" className="text-slate-400 hover:text-sky-400 transition">
                  Trung tâm hỗ trợ
                </a>
              </li>
              <li>
                <a href="#feedback" className="text-slate-400 hover:text-sky-400 transition">
                  Góp ý
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Pháp lý</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#privacy" className="text-slate-400 hover:text-sky-400 transition">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#terms" className="text-slate-400 hover:text-sky-400 transition">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-slate-400 hover:text-sky-400 transition">
                  Chính sách cookie
                </a>
              </li>
              <li>
                <a href="#terms-of-transaction" className="text-slate-400 hover:text-sky-400 transition">
                  Điều khoản giao dịch
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 border-t border-slate-700" />

        {/* Bottom Footer */}
        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-slate-400 sm:flex-row">
          <p>© {currentYear} Market Bike. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-6">
            <a href="#privacy-footer" className="hover:text-sky-400 transition">
              Bảo mật
            </a>
            <a href="#terms-footer" className="hover:text-sky-400 transition">
              Điều khoản
            </a>
            <a href="#sitemap" className="hover:text-sky-400 transition">
              Sơ đồ trang web
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
