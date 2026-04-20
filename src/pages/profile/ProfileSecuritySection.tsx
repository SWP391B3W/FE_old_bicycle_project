import { AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PASSWORD_POLICY_GUIDANCE } from '@/lib/password-policy'
import type { PasswordFormData } from './profile.types'

interface ProfileSecuritySectionProps {
  formData: PasswordFormData
  isLoading: boolean
  error: string | null
  success: boolean
  onSubmit: React.ComponentProps<'form'>['onSubmit']
  onFieldChange: (field: keyof PasswordFormData, value: string) => void
}

export function ProfileSecuritySection({
  formData,
  isLoading,
  error,
  success,
  onSubmit,
  onFieldChange,
}: Readonly<ProfileSecuritySectionProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="max-w-md space-y-4" noValidate>
          {error ? (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-950/20">
              <Check className="h-4 w-4 shrink-0" />
              Đổi mật khẩu thành công!
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="current-password" className="text-sm font-medium">
              Mật khẩu hiện tại
            </label>
            <Input
              id="current-password"
              type="password"
              value={formData.currentPassword}
              onChange={(event) => onFieldChange('currentPassword', event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-medium">
              Mật khẩu mới
            </label>
            <Input
              id="new-password"
              type="password"
              value={formData.newPassword}
              onChange={(event) => onFieldChange('newPassword', event.target.value)}
              required
            />
            <p className="text-sm text-muted-foreground">{PASSWORD_POLICY_GUIDANCE}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-new-password" className="text-sm font-medium">
              Xác nhận mật khẩu mới
            </label>
            <Input
              id="confirm-new-password"
              type="password"
              value={formData.confirmNewPassword}
              onChange={(event) => onFieldChange('confirmNewPassword', event.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}