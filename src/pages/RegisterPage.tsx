import { Bike } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/constants/routes'
import { RegisterForm } from './register/RegisterForm'
import { RegisterSuccessState } from './register/RegisterSuccessState'
import { useRegisterPage } from './register/useRegisterPage'

export default function RegisterPage() {
    const registerPage = useRegisterPage()

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
                        <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
                        <CardDescription>Tham gia cộng đồng mua bán xe đạp lớn nhất</CardDescription>
                    </CardHeader>

                    <CardContent>
                        {registerPage.success ? (
                            <RegisterSuccessState
                                email={registerPage.formData.email}
                                isResending={registerPage.isResending}
                                resendError={registerPage.resendError}
                                resendMessage={registerPage.resendMessage}
                                onResendVerification={registerPage.handleResendVerification}
                                onReset={registerPage.resetForm}
                            />
                        ) : (
                            <>
                                <RegisterForm
                                    formData={registerPage.formData}
                                    error={registerPage.error}
                                    isLoading={registerPage.isLoading}
                                    showPassword={registerPage.showPassword}
                                    passwordChecks={registerPage.passwordChecks}
                                    onSubmit={registerPage.handleSubmit}
                                    onFieldChange={registerPage.handleFieldChange}
                                    onRoleChange={registerPage.setRole}
                                    onTogglePasswordVisibility={registerPage.togglePasswordVisibility}
                                />

                                <div className="relative my-6">
                                    <Separator />
                                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                                        hoặc
                                    </span>
                                </div>
                            </>
                        )}
                    </CardContent>

                    <CardFooter className="justify-center">
                        <p className="text-sm text-muted-foreground">
                            Đã có tài khoản?{' '}
                            <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                                Đăng nhập
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}