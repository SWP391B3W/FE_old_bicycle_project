import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import Logo from '@/components/Logo'
import { RegisterForm } from './RegisterForm'
import { RegisterSuccessState } from './RegisterSuccessState'
import { useRegisterPage } from './useRegisterPage'

export default function RegisterPage() {
    const {
        formData,
        showPassword,
        isLoading,
        isResending,
        error,
        resendError,
        resendMessage,
        success,
        passwordChecks,
        handleFieldChange,
        setRole,
        togglePasswordVisibility,
        handleSubmit,
        handleResendVerification,
        resetForm,
    } = useRegisterPage()

    return (
        <main className="min-h-screen bg-slate-950 text-white">
            <section className="relative overflow-hidden px-6 py-8 sm:px-8 lg:px-10">
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
                            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" asChild>
                                <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
                            </Button>
                        </div>
                    </nav>

                    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center">
                        <div className="w-full max-w-md">
                            <div className="mb-8 text-center">
                                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                                    {success ? 'Đăng ký thành công!' : 'Tạo tài khoản'}
                                </h1>
                                <p className="mt-3 text-base leading-8 text-slate-200">
                                    {success
                                        ? 'Tài khoản của bạn đã được tạo thành công'
                                        : 'Điền thông tin để tạo tài khoản mới'
                                    }
                                </p>
                            </div>

                            <div className="rounded-3xl border border-white/15 bg-slate-900/75 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
                                {success ? (
                                    <RegisterSuccessState
                                        email={formData.email}
                                        isResending={isResending}
                                        resendError={resendError}
                                        resendMessage={resendMessage}
                                        onResendVerification={handleResendVerification}
                                        onReset={resetForm}
                                    />
                                ) : (
                                    <>
                                        <RegisterForm
                                            formData={formData}
                                            showPassword={showPassword}
                                            isLoading={isLoading}
                                            error={error}
                                            passwordChecks={passwordChecks}
                                            onFieldChange={handleFieldChange}
                                            onRoleChange={setRole}
                                            onTogglePasswordVisibility={togglePasswordVisibility}
                                            onSubmit={handleSubmit}
                                        />
                                        <div className="mt-6 text-center">
                                            <p className="text-sm text-slate-400">
                                                Đã có tài khoản?{' '}
                                                <Link to={ROUTES.LOGIN} className="font-medium text-sky-400 hover:text-sky-300">
                                                    Đăng nhập
                                                </Link>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}