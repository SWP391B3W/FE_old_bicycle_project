import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bike, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/authService'
import { cn } from '@/lib/utils'

const RESET_TOKEN_QUERY_KEYS = ['token', 'resetToken', 'reset_token'] as const

function readResetTokenFromSearch(rawSearch: string): string {
    const query = rawSearch.startsWith('?') ? rawSearch.slice(1) : rawSearch

    for (const key of RESET_TOKEN_QUERY_KEYS) {
        const pattern = new RegExp(`(?:^|&)${key}=([^&]*)`)
        const match = query.match(pattern)

        if (match) {
            return decodeURIComponent(match[1].replace(/\+/g, '%2B')).trim()
        }
    }

    return ''
}

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams()
    const location = useLocation()
    const token =
        readResetTokenFromSearch(location.search) ||
        RESET_TOKEN_QUERY_KEYS.map((key) => searchParams.get(key)?.trim() ?? '').find(Boolean) ||
        ''
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const isPasswordValid = newPassword.length >= 8
    const hasUppercase = /[A-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isPasswordValid || !hasUppercase || !hasNumber) {
            setError('Mật khẩu không đáp ứng đủ yêu cầu bảo mật.')
            return
        }

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.')
            return
        }
        setError(null)
        setIsLoading(true)
        try {
            await authService.resetPassword({ token, newPassword })
            setSuccess(true)
            setTimeout(() => navigate(ROUTES.LOGIN), 3000)
        } catch (err: unknown) {
            let message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message

            if (!message) {
                message = 'Đặt lại mật khẩu thất bại. Link có thể đã hết hạn.'
            } else {
                const msgLower = message.toLowerCase()
                if (msgLower.includes('expire') || msgLower.includes('invalid')) {
                    message = 'Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.'
                }
            }
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
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
                        <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
                        <CardDescription>
                            Tạo mật khẩu mới cho tài khoản của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="space-y-4 text-center py-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 mx-auto">
                                    <Check className="h-7 w-7 text-green-600" />
                                </div>
                                <p className="font-semibold">Đặt lại mật khẩu thành công!</p>
                                <p className="text-sm text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                {!token && (
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        Link đặt lại mật khẩu không hợp lệ.
                                    </div>
                                )}
                                {error && (
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="text-sm font-medium">Mật khẩu mới</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className="pl-10 pr-10"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={!token}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="space-y-1 text-xs">
                                        <div className={cn("flex items-center gap-1", isPasswordValid ? "text-green-600" : "text-muted-foreground")}>
                                            <Check className="h-3 w-3" /> Ít nhất 8 ký tự
                                        </div>
                                        <div className={cn("flex items-center gap-1", hasUppercase ? "text-green-600" : "text-muted-foreground")}>
                                            <Check className="h-3 w-3" /> Có chữ hoa
                                        </div>
                                        <div className={cn("flex items-center gap-1", hasNumber ? "text-green-600" : "text-muted-foreground")}>
                                            <Check className="h-3 w-3" /> Có số
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-sm font-medium">Xác nhận mật khẩu mới</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="••••••••"
                                            className="pl-10"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={!token}
                                        />
                                        {confirmPassword && (
                                            <div className={cn("absolute right-3 top-1/2 -translate-y-1/2", passwordsMatch ? "text-green-600" : "text-red-500")}>
                                                {passwordsMatch ? <Check className="h-4 w-4" /> : '✗'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading || !token}>
                                    {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                                </Button>
                                <div className="text-center text-sm">
                                    <Link to="/forgot-password" className="text-primary hover:underline">
                                        Gửi lại link đặt lại mật khẩu
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
