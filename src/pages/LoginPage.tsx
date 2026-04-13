import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Bike, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
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
            await login({ email, password })

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email)
            } else {
                localStorage.removeItem('rememberedEmail')
            }

            navigate(from, { replace: true })
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
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <Link to={ROUTES.HOME} className="inline-flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                            <Bike className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <span className="text-2xl font-bold text-foreground">BikeExchange</span>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Đăng nhập</CardTitle>
                        <CardDescription>Đăng nhập để mua bán xe đạp</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                            {error && (
                                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                </div>
                            )}

                            {resendMessage && (
                                <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{resendMessage}</div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium">
                                        Mật khẩu
                                    </label>
                                    <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary hover:underline">
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                                    className="h-4 w-4 rounded border-input"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label htmlFor="remember" className="text-sm font-medium leading-none cursor-pointer">
                                    Nhớ mật khẩu
                                </label>
                            </div>

                            {canResendVerification && (
                                <div className="rounded-lg border border-border/70 bg-muted/40 px-4 py-3 text-sm">
                                    <p className="font-medium text-foreground">Tài khoản này chưa xác thực email.</p>
                                    <p className="mt-1 text-muted-foreground">
                                        Bạn có thể yêu cầu hệ thống gửi lại email xác thực tới địa chỉ vừa nhập.
                                    </p>
                                    <Button
                                        className="mt-3 w-full"
                                        type="button"
                                        variant="outline"
                                        onClick={handleResendVerification}
                                        disabled={isResending || !email.trim()}
                                    >
                                        {isResending ? 'Đang gửi lại email...' : 'Gửi lại email xác thực'}
                                    </Button>
                                </div>
                            )}

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            Chưa có tài khoản?{' '}
                            <Link to={ROUTES.REGISTER} className="font-medium text-primary hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
