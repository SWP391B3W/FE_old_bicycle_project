import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Bike, CheckCircle2, LoaderCircle, LogIn, MailCheck, RefreshCcw, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { isAuthSession } from '@/api/auth.api'

type VerifyStatus =
    | 'verifying'
    | 'verified'
    | 'verified_authenticated'
    | 'redirect_reported_success'
    | 'invalid'
    | 'error'

const REDIRECT_DELAY_SECONDS = 5

const STATUS_COPY: Record<
    VerifyStatus,
    {
        title: string
        description: string
    }
> = {
    verifying: {
        title: 'Đang xác thực email',
        description: 'Hệ thống đang kiểm tra liên kết xác thực của bạn. Việc này thường chỉ mất vài giây.',
    },
    verified: {
        title: 'Email đã được xác thực',
        description: 'Ứng dụng đã gọi API xác thực thành công. Bạn sẽ được đưa tới trang đăng nhập để kiểm tra lại tài khoản.',
    },
    verified_authenticated: {
        title: 'Xác thực thành công',
        description: 'Tài khoản đã được kích hoạt và bạn đang ở trạng thái đăng nhập bằng chính tài khoản vừa xác thực.',
    },
    redirect_reported_success: {
        title: 'Đã nhận phản hồi xác thực',
        description: 'Ứng dụng đã nhận tín hiệu thành công từ bước redirect, nhưng chưa thể tự xác nhận phiên đăng nhập nếu không có token hoặc session.',
    },
    invalid: {
        title: 'Liên kết không hợp lệ',
        description: 'Liên kết xác thực đang thiếu token hoặc đã bị sửa đổi. Hãy yêu cầu gửi lại email xác thực.',
    },
    error: {
        title: 'Không thể xác thực email',
        description: 'Liên kết có thể đã hết hạn hoặc đã được sử dụng trước đó. Bạn có thể thử lại hoặc đăng nhập nếu tài khoản đã kích hoạt.',
    },
}

function resolveStatusFromQuery(rawStatus: string | null): VerifyStatus | null {
    switch (rawStatus?.trim().toLowerCase()) {
        case 'success':
        case 'verified':
        case 'authenticated':
        case 'verified_authenticated':
            return 'redirect_reported_success'
        case 'error':
        case 'failed':
            return 'error'
        case 'invalid':
            return 'invalid'
        default:
            return null
    }
}

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')?.trim() ?? ''
    const queryStatus = resolveStatusFromQuery(searchParams.get('status'))
    const messageFromQuery = searchParams.get('message')?.trim() ?? ''
    const navigate = useNavigate()
    const { setUser } = useAuth()

    const [status, setStatus] = useState<VerifyStatus>(token ? 'verifying' : queryStatus ?? 'invalid')
    const [message, setMessage] = useState<string | null>(messageFromQuery || null)
    const [attempt, setAttempt] = useState(0)
    const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS)

    useEffect(() => {
        if (token) {
            let isCancelled = false

            async function runVerification() {
                setStatus('verifying')
                setMessage(null)

                try {
                    const result = await authService.verifyEmail(token)

                    if (isCancelled) {
                        return
                    }

                    if (isAuthSession(result)) {
                        setUser(result.user)
                        setStatus('verified_authenticated')
                        setMessage('Email của bạn đã được xác thực và phiên đăng nhập đã sẵn sàng.')
                        return
                    }

                    setStatus('verified')
                    setMessage(result || 'API xác thực email đã trả về thành công.')
                } catch (error: unknown) {
                    if (isCancelled) {
                        return
                    }

                    const errorMessage =
                        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                        'Xác thực email thất bại. Liên kết có thể đã hết hạn hoặc không còn hiệu lực.'

                    setStatus('error')
                    setMessage(errorMessage)
                }
            }

            void runVerification()

            return () => {
                isCancelled = true
            }
        }

        if (queryStatus) {
            setStatus(queryStatus)
            setMessage(
                messageFromQuery ||
                (queryStatus === 'redirect_reported_success'
                    ? 'Ứng dụng chỉ mới nhận được phản hồi redirect thành công, chưa tự gọi verify bằng token ở phiên hiện tại.'
                    : null),
            )
            return
        }

        setStatus('invalid')
        setMessage(null)
    }, [attempt, messageFromQuery, queryStatus, setUser, token])

    const shouldAutoRedirect =
        status === 'verified' || status === 'verified_authenticated' || status === 'redirect_reported_success'
    const redirectPath = status === 'verified_authenticated' ? ROUTES.HOME : ROUTES.LOGIN
    const redirectLabel = status === 'verified_authenticated' ? 'trang chủ' : 'trang đăng nhập'

    useEffect(() => {
        if (!shouldAutoRedirect) {
            setCountdown(REDIRECT_DELAY_SECONDS)
            return
        }

        setCountdown(REDIRECT_DELAY_SECONDS)

        const interval = window.setInterval(() => {
            setCountdown((current) => (current > 1 ? current - 1 : 1))
        }, 1000)

        const timeout = window.setTimeout(() => {
            navigate(redirectPath, { replace: true })
        }, REDIRECT_DELAY_SECONDS * 1000)

        return () => {
            window.clearInterval(interval)
            window.clearTimeout(timeout)
        }
    }, [navigate, redirectPath, shouldAutoRedirect])

    const copy = STATUS_COPY[status]
    const isBusy = status === 'verifying'
    const isSuccessful = status === 'verified' || status === 'verified_authenticated' || status === 'redirect_reported_success'
    const currentMessage =
        message ??
        (status === 'verifying'
            ? 'Chúng tôi đang xử lý liên kết xác thực mà bạn vừa mở từ email.'
            : 'Bạn có thể tiếp tục bằng các nút hành động bên dưới.')

    const helperText = useMemo(() => {
        if (status === 'verified_authenticated') {
            return `Sau ${countdown} giây nữa hệ thống sẽ chuyển hướng bạn về ${redirectLabel} trong trạng thái đã đăng nhập.`
        }

        if (status === 'verified') {
            return `Sau ${countdown} giây nữa hệ thống sẽ chuyển hướng bạn tới ${redirectLabel}.`
        }

        if (status === 'redirect_reported_success') {
            return `Sau ${countdown} giây nữa hệ thống sẽ chuyển hướng bạn tới ${redirectLabel}.`
        }

        return null
    }, [countdown, redirectLabel, status])

    const sourceLabel = token ? 'Nguồn xác nhận: gọi verify API bằng token' : 'Nguồn xác nhận: query redirect từ link/email'

    return (
        <div className="relative flex min-h-[calc(100vh-9rem)] items-center justify-center overflow-hidden px-4 py-10">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/90 via-background to-background dark:from-emerald-950/10" />
            <div className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl dark:bg-emerald-500/10" />

            <div className="relative w-full max-w-3xl">
                <Card className="border-border/70 bg-card/95 shadow-2xl shadow-emerald-950/10 backdrop-blur">
                    <CardHeader className="space-y-6 pb-4 text-center">
                        <div className="mx-auto inline-flex items-center gap-3 rounded-full border border-border/60 bg-background/80 px-4 py-3 shadow-sm">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <Bike className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-lg font-semibold text-foreground">BikeExchange</p>
                                <p className="text-sm text-muted-foreground">Xác thực tài khoản an toàn và liền mạch</p>
                            </div>
                        </div>

                        <div
                            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${isBusy
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : isSuccessful
                                    ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                                }`}
                        >
                            {status === 'verifying' && <LoaderCircle className="h-10 w-10 animate-spin" />}
                            {status === 'verified' && <MailCheck className="h-10 w-10" />}
                            {status === 'verified_authenticated' && <CheckCircle2 className="h-10 w-10" />}
                            {status === 'redirect_reported_success' && <MailCheck className="h-10 w-10" />}
                            {(status === 'invalid' || status === 'error') && <TriangleAlert className="h-10 w-10" />}
                        </div>

                        <div className="space-y-3">
                            <CardTitle className="text-4xl tracking-tight">{copy.title}</CardTitle>
                            <CardDescription className="mx-auto max-w-2xl text-lg leading-8">{copy.description}</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6 px-6 pb-8 sm:px-10">
                        <div className="rounded-3xl border border-border/70 bg-muted/40 p-6">
                            <p className="text-base font-semibold text-foreground">Trạng thái hiện tại</p>
                            <p className="mt-3 text-base leading-7 text-muted-foreground">{currentMessage}</p>
                            <p className="mt-4 text-sm font-medium text-foreground/70">{sourceLabel}</p>
                        </div>

                        {helperText && (
                            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 px-5 py-4 text-sm font-medium text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                                {helperText}
                            </div>
                        )}

                        <div className="flex flex-col justify-center gap-3 sm:flex-row">
                            {status === 'verifying' && (
                                <Button className="sm:min-w-48" disabled>
                                    <LoaderCircle className="animate-spin" />
                                    Đang xác thực...
                                </Button>
                            )}

                            {status === 'verified_authenticated' && (
                                <Button className="sm:min-w-48" asChild>
                                    <Link to={ROUTES.HOME}>
                                        Về trang chủ
                                        <ArrowRight />
                                    </Link>
                                </Button>
                            )}

                            {(status === 'verified' || status === 'redirect_reported_success') && (
                                <Button className="sm:min-w-48" asChild>
                                    <Link to={ROUTES.LOGIN}>
                                        Đăng nhập ngay
                                        <LogIn />
                                    </Link>
                                </Button>
                            )}

                            {(status === 'error' || status === 'invalid') && token && (
                                <Button className="sm:min-w-48" onClick={() => setAttempt((value) => value + 1)}>
                                    <RefreshCcw />
                                    Thử lại
                                </Button>
                            )}

                            <Button className="sm:min-w-48" variant="outline" asChild>
                                <Link to={status === 'verified_authenticated' ? ROUTES.HOME : ROUTES.LOGIN}>
                                    {status === 'verified_authenticated' ? 'Mở trang chủ' : 'Mở đăng nhập'}
                                </Link>
                            </Button>
                        </div>


                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
