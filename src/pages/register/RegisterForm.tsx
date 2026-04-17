import type { ChangeEvent, FormEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle, Mail, Phone, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RegisterPasswordFields } from './RegisterPasswordFields'
import { RegisterRoleSelector } from './RegisterRoleSelector'
import type { RegisterFormData, RegisterPasswordChecks } from './register.types'

interface RegisterFormProps {
    formData: RegisterFormData
    error: string | null
    isLoading: boolean
    showPassword: boolean
    passwordChecks: RegisterPasswordChecks
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    onFieldChange: (event: ChangeEvent<HTMLInputElement>) => void
    onRoleChange: (role: RegisterFormData['role']) => void
    onTogglePasswordVisibility: () => void
}

interface RegisterInputFieldProps {
    id: 'firstName' | 'lastName' | 'email' | 'phone'
    label: string
    placeholder: string
    icon: LucideIcon
    value: string
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
    type?: string
    required?: boolean
}

function RegisterInputField({
    id,
    label,
    placeholder,
    icon: Icon,
    value,
    onChange,
    type = 'text',
    required = false,
}: RegisterInputFieldProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="text-sm font-medium text-slate-200">
                {label}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                    id={id}
                    name={id}
                    type={type}
                    placeholder={placeholder}
                    className="pl-10 bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/30"
                    value={value}
                    onChange={onChange}
                    required={required}
                />
            </div>
        </div>
    )
}

export function RegisterForm({
    formData,
    error,
    isLoading,
    showPassword,
    passwordChecks,
    onSubmit,
    onFieldChange,
    onRoleChange,
    onTogglePasswordVisibility,
}: RegisterFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {error ? (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                </div>
            ) : null}

            <RegisterRoleSelector role={formData.role} onChange={onRoleChange} />

            <RegisterInputField
                id="firstName"
                label="Họ"
                placeholder="Nguyễn"
                icon={User}
                value={formData.firstName}
                onChange={onFieldChange}
                required
            />

            <RegisterInputField
                id="lastName"
                label="Tên"
                placeholder="Văn A"
                icon={User}
                value={formData.lastName}
                onChange={onFieldChange}
                required
            />

            <RegisterInputField
                id="email"
                label="Email"
                placeholder="example@email.com"
                icon={Mail}
                value={formData.email}
                onChange={onFieldChange}
                type="email"
                required
            />

            <RegisterInputField
                id="phone"
                label="Số điện thoại"
                placeholder="0901234567"
                icon={Phone}
                value={formData.phone}
                onChange={onFieldChange}
                type="tel"
            />

            <RegisterPasswordFields
                password={formData.password}
                confirmPassword={formData.confirmPassword}
                showPassword={showPassword}
                passwordChecks={passwordChecks}
                onFieldChange={onFieldChange}
                onTogglePasswordVisibility={onTogglePasswordVisibility}
            />

            <div className="flex items-start gap-2">
                <input
                    type="checkbox"
                    id="agreeTerms"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={onFieldChange}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800/90 text-sky-500 focus:ring-sky-400"
                    required
                />
                <label htmlFor="agreeTerms" className="text-sm text-slate-400">
                    Tôi đồng ý với{' '}
                    <Link to="/terms" className="text-sky-400 hover:text-sky-300">
                        Điều khoản sử dụng
                    </Link>{' '}
                    và{' '}
                    <Link to="/privacy" className="text-sky-400 hover:text-sky-300">
                        Chính sách bảo mật
                    </Link>
                </label>
            </div>

            <Button type="submit" className="w-full bg-sky-500 text-white hover:bg-sky-400 shadow-lg shadow-sky-500/20" size="lg" disabled={isLoading}>
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </Button>
        </form>
    )
}