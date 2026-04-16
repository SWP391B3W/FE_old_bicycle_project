import type { ChangeEvent } from 'react'
import { Check, Eye, EyeOff, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { RegisterPasswordChecks } from './register.types'

interface RegisterPasswordFieldsProps {
  password: string
  confirmPassword: string
  showPassword: boolean
  passwordChecks: RegisterPasswordChecks
  onFieldChange: (event: ChangeEvent<HTMLInputElement>) => void
  onTogglePasswordVisibility: () => void
}

const PASSWORD_REQUIREMENTS = [
  {
    key: 'isPasswordValid',
    label: 'Ít nhất 8 ký tự',
  },
  {
    key: 'hasUppercase',
    label: 'Có chữ hoa',
  },
  {
    key: 'hasNumber',
    label: 'Có số',
  },
] as const

export function RegisterPasswordFields({
  password,
  confirmPassword,
  showPassword,
  passwordChecks,
  onFieldChange,
  onTogglePasswordVisibility,
}: RegisterPasswordFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-slate-200">
          Mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pl-10 pr-10 bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/30"
            value={password}
            onChange={onFieldChange}
            required
          />
          <button
            type="button"
            onClick={onTogglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="space-y-1 text-xs">
          {PASSWORD_REQUIREMENTS.map((requirement) => (
            <div
              key={requirement.key}
              className={cn(
                'flex items-center gap-1',
                passwordChecks[requirement.key] ? 'text-green-400' : 'text-slate-400',
              )}
            >
              <Check className="h-3 w-3" />
              {requirement.label}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-200">
          Xác nhận mật khẩu
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="pl-10 bg-slate-800/90 border-slate-600 text-white placeholder:text-slate-400 focus:border-sky-400 focus:ring-sky-400/30"
            value={confirmPassword}
            onChange={onFieldChange}
            required
          />

          {confirmPassword ? (
            <div
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                passwordChecks.passwordsMatch ? 'text-green-400' : 'text-red-400',
              )}
            >
              {passwordChecks.passwordsMatch ? <Check className="h-4 w-4" /> : '×'}
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}