import { AlertCircle, Check, Mail, MapPin, Phone, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { AuthUser } from '@/types/auth'
import type { ProfileFormData } from './profile.types'

interface ProfileInfoSectionProps {
  user: AuthUser
  formData: ProfileFormData
  isEditing: boolean
  isLoading: boolean
  error: string | null
  success: boolean
  onStartEditing: () => void
  onCancelEditing: () => void
  onSave: () => void
  onFieldChange: (field: keyof ProfileFormData, value: string) => void
}

interface ProfileInputFieldProps {
  label: string
  value: string
  disabled: boolean
  icon: typeof User
  placeholder?: string
  onChange?: (value: string) => void
}

function ProfileInputField({
  label,
  value,
  disabled,
  icon: Icon,
  placeholder,
  onChange,
}: Readonly<ProfileInputFieldProps>) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </label>
      <Input
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  )
}

export function ProfileInfoSection({
  user,
  formData,
  isEditing,
  isLoading,
  error,
  success,
  onStartEditing,
  onCancelEditing,
  onSave,
  onFieldChange,
}: Readonly<ProfileInfoSectionProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Thông tin cá nhân</CardTitle>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancelEditing}>
              Hủy
            </Button>
            <Button size="sm" onClick={onSave} disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={onStartEditing}>
            Chỉnh sửa
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {error ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-950/20">
            <Check className="h-4 w-4 shrink-0" />
            Cập nhật thông tin thành công!
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <ProfileInputField
            label="Họ"
            value={formData.firstName}
            disabled={!isEditing}
            icon={User}
            placeholder="Nguyễn"
            onChange={(value) => onFieldChange('firstName', value)}
          />

          <ProfileInputField
            label="Tên"
            value={formData.lastName}
            disabled={!isEditing}
            icon={User}
            placeholder="Văn A"
            onChange={(value) => onFieldChange('lastName', value)}
          />

          <ProfileInputField label="Email" value={user.email} disabled icon={Mail} />

          <ProfileInputField
            label="Số điện thoại"
            value={formData.phone}
            disabled={!isEditing}
            icon={Phone}
            onChange={(value) => onFieldChange('phone', value)}
          />

          <div className="md:col-span-2">
            <ProfileInputField
              label="Địa chỉ"
              value={formData.address}
              disabled={!isEditing}
              icon={MapPin}
              onChange={(value) => onFieldChange('address', value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}