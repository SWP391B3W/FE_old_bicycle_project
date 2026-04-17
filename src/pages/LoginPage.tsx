import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
    const [email, setEmail] = useState(() => localStorage.getItem('rememberedEmail') || '')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('rememberedEmail'))
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resendMessage, setResendMessage] = useState<string | null>(null)
    const [canResendVerification, setCanResendVerification] = useState(false)
    const { login, resendVerification } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const fromLocation = (location.state as { from?: { pathname: string; search?: string } })?.from
    const from = fromLocation ? `${fromLocation.pathname}${fromLocation.search ?? ''}` : ROUTES.HOME

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError(null)
        setResendMessage(null)
        setCanResendVerification(false)

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: example@email.com).')
            return
        }

        if (!password.trim()) {
            setError('Vui lòng nhập mật khẩu.')
            return
        }

        setIsLoading(true)

        try {
            const loggedInUser = await login({ email, password })

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email)
            } else {
                localStorage.removeItem('rememberedEmail')
            }

            // Redirect admin thẳng vào trang quản trị
            if (loggedInUser?.role === 'admin') {
                navigate(ROUTES.ADMIN, { replace: true })
            } else {
                navigate(from, { replace: true })
            }
        } catch (err: unknown) {
            const errorCode = (err as { response?: { data?: { code?: number } } })?.response?.data?.code
            let message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message

            if (!message) {
                message = 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.'
            } else {
                const msgLower = message.toLowerCase()
                if (msgLower.includes('credential') || msgLower.includes('password') || msgLower.includes('incorrect')) {
                    message = 'Email hoặc mật khẩu không chính xác.'
                } else if (msgLower.includes('not found') || msgLower.includes('user') || msgLower.includes('exist')) {
                    message = 'Tài khoản không tồn tại.'
                } else if (msgLower.includes('disable') || msgLower.includes('inactive')) {
                    message = 'Tài khoản đã bị vô hiệu hóa.'
                } else if (msgLower.includes('lock')) {
                    message = 'Tài khoản đã bị khóa.'
                } else if (msgLower.includes('verify') || msgLower.includes('verified')) {
                    message = 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư.'
                }
            }

            setError(message)
            setCanResendVerification(errorCode === 1024)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendVerification = async () => {
        setError(null)
        setResendMessage(null)
        setIsResending(true)

        try {
            const message = await resendVerification(email)
            setResendMessage(message)
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                'Không thể gửi lại email xác thực. Vui lòng thử lại sau.'
            setError(message)
        } finally {
            setIsResending(false)
        }
    }

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <section className="relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.86))]" />
                <div className="relative mx-auto max-w-7xl">
                    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
                        <div className="w-full max-w-md">
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                    Đăng nhập
                                </h1>
                                <p className="mt-3 text-base leading-8 text-slate-200">
                                    Đăng nhập để mua bán xe đạp thể thao
                                </p>
                            </div>

                            <div className="rounded-3xl border border-white/15 bg-slate-900/75 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
                                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                                    {error && (
                                        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                                            <AlertCircle className="h-4 w-4 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    {resendMessage && (
                                        <div className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400 border border-green-500/20">{resendMessage}</div>
                                    )}

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium text-slate-200">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="example@email.com"
                                                className="pl-10 bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/30"
                                                value={email}
                                                onChange={(event) => setEmail(event.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label htmlFor="password" className="text-sm font-medium text-slate-200">
                                                Mật khẩu
                                            </label>
                                            <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-sky-400 hover:text-sky-300">
                                                Quên mật khẩu?
                                            </Link>
                                        </div>

                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                className="pl-10 pr-10 bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/30"
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            className="h-4 w-4 rounded border-slate-600 bg-slate-800/90 text-sky-500 focus:ring-sky-400"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer text-slate-200">
                                            Nhớ mật khẩu
                                        </label>
                                    </div>

                                    {canResendVerification && (
                                        <div className="rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-3 text-sm">
                                            <p className="font-medium text-slate-200">Tài khoản này chưa xác thực email.</p>
                                            <p className="mt-1 text-slate-400">
                                                Bạn có thể yêu cầu hệ thống gửi lại email xác thực tới địa chỉ vừa nhập.
                                            </p>
                                            <Button
                                                className="mt-3 w-full bg-slate-700 text-white hover:bg-slate-600 border-slate-600"
                                                type="button"
                                                variant="outline"
                                                onClick={handleResendVerification}
                                                disabled={isResending || !email.trim()}
                                            >
                                                {isResending ? 'Đang gửi lại email...' : 'Gửi lại email xác thực'}
                                            </Button>
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20" size="lg" disabled={isLoading}>
                                        {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-sm text-slate-400">
                                        Chưa có tài khoản?{' '}
                                        <Link to={ROUTES.REGISTER} className="font-medium text-sky-400 hover:text-sky-300">
                                            Đăng ký ngay
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
