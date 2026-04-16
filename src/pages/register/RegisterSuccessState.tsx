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
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
                <Check className="h-7 w-7 text-green-400" />
            </div>

            <div className="space-y-2">
                <p className="text-lg font-semibold text-white">Kiểm tra email để xác thực tài khoản</p>
                <p className="text-sm text-slate-400">
                    Chúng tôi đã gửi liên kết xác thực tới{' '}
                    <span className="font-medium text-white">{email}</span>.
                </p>
                <p className="text-sm text-slate-400">
                    Bạn chưa thể đăng nhập cho đến khi nhấn vào liên kết xác thực trong email.
                </p>
            </div>

            <div className="w-full rounded-xl border border-slate-600 bg-slate-800/50 p-4 text-left">
                <p className="text-sm font-medium text-white">Chưa nhận được email?</p>
                <p className="mt-1 text-sm text-slate-400">
                    Hãy kiểm tra thư mục Spam/Promotion. Nếu vẫn chưa thấy, bạn có thể yêu cầu gửi lại.
                </p>
                {resendMessage ? <p className="mt-3 text-sm text-green-400">{resendMessage}</p> : null}
                {resendError ? <p className="mt-3 text-sm text-red-400">{resendError}</p> : null}
                <Button
                    className="mt-4 w-full bg-slate-700 text-white hover:bg-slate-600 border-slate-600"
                    variant="outline"
                    onClick={onResendVerification}
                    disabled={isResending}
                >
                    {isResending ? 'Đang gửi lại email...' : 'Gửi lại email xác thực'}
                </Button>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
                <Button className="flex-1 bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20" asChild>
                    <Link to={ROUTES.LOGIN}>Tới trang đăng nhập</Link>
                </Button>
                <Button className="flex-1 bg-slate-700 text-white hover:bg-slate-600 border-slate-600" variant="outline" type="button" onClick={onReset}>
                    Đăng ký tài khoản khác
                </Button>
            </div>
        </div>
    )
}