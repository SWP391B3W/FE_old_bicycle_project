import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'

interface RegisterSuccessStateProps {
    email: string
    isResending: boolean
    resendError: string | null
    resendMessage: string | null
    onResendVerification: () => void
    onReset: () => void
}

export function RegisterSuccessState({
    email,
    isResending,
    resendError,
    resendMessage,
    onResendVerification,
    onReset,
}: RegisterSuccessStateProps) {
    return (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                <Check className="h-7 w-7 text-green-600" />
            </div>

            <div className="space-y-2">
                <p className="text-lg font-semibold">Kiểm tra email để xác thực tài khoản</p>
                <p className="text-sm text-muted-foreground">
                    Chúng tôi đã gửi liên kết xác thực tới{' '}
                    <span className="font-medium text-foreground">{email}</span>.
                </p>
                <p className="text-sm text-muted-foreground">
                    Bạn chưa thể đăng nhập cho đến khi nhấn vào liên kết xác thực trong email.
                </p>
            </div>

            <div className="w-full rounded-xl border border-border/70 bg-muted/40 p-4 text-left">
                <p className="text-sm font-medium text-foreground">Chưa nhận được email?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                    Hãy kiểm tra thư mục Spam/Promotion. Nếu vẫn chưa thấy, bạn có thể yêu cầu gửi lại.
                </p>
                {resendMessage ? <p className="mt-3 text-sm text-green-600">{resendMessage}</p> : null}
                {resendError ? <p className="mt-3 text-sm text-destructive">{resendError}</p> : null}
                <Button
                    className="mt-4 w-full"
                    variant="outline"
                    onClick={onResendVerification}
                    disabled={isResending}
                >
                    {isResending ? 'Đang gửi lại email...' : 'Gửi lại email xác thực'}
                </Button>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button className="flex-1" asChild>
                    <Link to={ROUTES.LOGIN}>Tới trang đăng nhập</Link>
                </Button>
                <Button className="flex-1" variant="outline" type="button" onClick={onReset}>
                    Đăng ký tài khoản khác
                </Button>
            </div>
        </div>
    )
}
