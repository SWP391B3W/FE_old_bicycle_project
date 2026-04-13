import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-blue-950 dark:to-indigo-950">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">
                        {success ? 'Đăng ký thành công!' : 'Tạo tài khoản'}
                    </CardTitle>
                    <CardDescription>
                        {success
                            ? 'Tài khoản của bạn đã được tạo thành công'
                            : 'Điền thông tin để tạo tài khoản mới'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                            <div className="mt-6 text-center text-sm">
                                <span className="text-muted-foreground">Đã có tài khoản? </span>
                                <Link
                                    to={ROUTES.LOGIN}
                                    className="font-medium text-primary hover:underline"
                                >
                                    Đăng nhập
                                </Link>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}