import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PASSWORD_POLICY_GUIDANCE, getPasswordPolicyChecks } from '@/lib/password-policy'
import {
    INITIAL_REGISTER_FORM_DATA,
    type RegisterFormData,
    type RegisterPasswordChecks,
    type RegisterRole,
} from './register.types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getRegisterPasswordChecks(formData: RegisterFormData): RegisterPasswordChecks {
    const passwordChecks = getPasswordPolicyChecks(formData.password)

    return {
        isPasswordValid: passwordChecks.hasMinimumLength,
        hasUppercase: passwordChecks.hasUppercase,
        hasNumber: passwordChecks.hasNumber,
        passwordsMatch:
            formData.password === formData.confirmPassword && formData.confirmPassword.length > 0,
    }
}

function getRegisterErrorMessage(
    formData: RegisterFormData,
    passwordChecks: RegisterPasswordChecks,
) {
    if (!formData.firstName.trim()) {
        return 'Vui lòng nhập họ.'
    }

    if (!formData.lastName.trim()) {
        return 'Vui lòng nhập tên.'
    }

    if (!formData.email.trim() || !EMAIL_PATTERN.test(formData.email)) {
        return 'Vui lòng nhập địa chỉ email hợp lệ (ví dụ: example@email.com).'
    }

    if (
        !passwordChecks.isPasswordValid ||
        !passwordChecks.hasUppercase ||
        !passwordChecks.hasNumber
    ) {
        return PASSWORD_POLICY_GUIDANCE
    }

    if (!passwordChecks.passwordsMatch) {
        return 'Mật khẩu xác nhận không khớp.'
    }

    if (!formData.agreeTerms) {
        return 'Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.'
    }

    return null
}

function mapRegisterErrorMessage(error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message

    if (!message) {
        return 'Đăng ký thất bại. Vui lòng thử lại.'
    }

    const normalizedMessage = message.toLowerCase()

    if (normalizedMessage.includes('email') && normalizedMessage.includes('exist')) {
        return 'Email này đã được sử dụng. Vui lòng chọn email khác.'
    }

    if (normalizedMessage.includes('phone') && normalizedMessage.includes('exist')) {
        return 'Số điện thoại này đã được sử dụng.'
    }

    return message
}

function mapResendErrorMessage(error: unknown) {
    return (
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể gửi lại email xác thực. Vui lòng thử lại sau.'
    )
}

export function useRegisterPage() {
    const [formData, setFormData] = useState(INITIAL_REGISTER_FORM_DATA)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [resendError, setResendError] = useState<string | null>(null)
    const [resendMessage, setResendMessage] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const { register, resendVerification } = useAuth()

    const passwordChecks = getRegisterPasswordChecks(formData)

    function handleFieldChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value, type, checked } = event.target

        setFormData((current) => ({
            ...current,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    function setRole(role: RegisterRole) {
        setFormData((current) => ({ ...current, role }))
    }

    function togglePasswordVisibility() {
        setShowPassword((current) => !current)
    }

    function resetForm() {
        setFormData(INITIAL_REGISTER_FORM_DATA)
        setShowPassword(false)
        setIsLoading(false)
        setIsResending(false)
        setError(null)
        setResendError(null)
        setResendMessage(null)
        setSuccess(false)
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const validationError = getRegisterErrorMessage(formData, passwordChecks)

        if (validationError) {
            setError(validationError)
            return
        }

        setError(null)
        setIsLoading(true)

        try {
            await register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role,
            })

            setResendError(null)
            setResendMessage(null)
            setSuccess(true)
        } catch (submitError: unknown) {
            setError(mapRegisterErrorMessage(submitError))
        } finally {
            setIsLoading(false)
        }
    }

    async function handleResendVerification() {
        setResendError(null)
        setResendMessage(null)
        setIsResending(true)

        try {
            const message = await resendVerification(formData.email)
            setResendMessage(message)
        } catch (resendVerificationError: unknown) {
            setResendError(mapResendErrorMessage(resendVerificationError))
        } finally {
            setIsResending(false)
        }
    }

    return {
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
    }
}