import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { authService } from '@/services/authService'
import Logo from '@/components/Logo'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Vui lòng nhập địa chỉ email hợp lệ.')
            return
        }

        setIsLoading(true)
        try {
            await authService.forgotPassword({ email })
            setSuccess(true)
        } catch (err: unknown) {
            let message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message

            if (!message) {
                message = 'Không thể gửi email. Vui lòng thử lại.'
            } else {
                const msgLower = message.toLowerCase()
                if (msgLower.includes('not found') || msgLower.includes('user')) {
                    message = 'Không tìm thấy tài khoản với email này.'
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
                    <Logo className="h-10 w-10" textClassName="text-2xl font-bold text-foreground" />
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
                        <CardDescription>
                            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="space-y-4 text-center py-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950 mx-auto">
                                    <Mail className="h-7 w-7 text-green-600" />
                                </div>
                                <p className="font-semibold">Kiểm tra hộp thư của bạn!</p>
                                <p className="text-sm text-muted-foreground">
                                    Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>.
                                    Vui lòng kiểm tra cả hộp thư spam.
                                </p>
                                <Button variant="outline" className="w-full" onClick={() => navigate(ROUTES.LOGIN)}>
                                    Về trang đăng nhập
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                                {error && (
                                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="example@email.com"
                                            className="pl-10"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                    {isLoading ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => navigate(ROUTES.LOGIN)}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Quay lại đăng nhập
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}