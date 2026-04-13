export type AppRole = 'guest' | 'buyer' | 'seller' | 'inspector' | 'admin'

export type UserStatus = 'active' | 'unactive' | 'banned'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  avatarUrl?: string | null
  defaultAddress?: string | null
  role?: AppRole | null
  status?: UserStatus | null
  isVerified?: boolean
  name: string
  avatar?: string | null
  address?: string | null
  verified: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  password: string
  role?: Exclude<AppRole, 'guest' | 'admin' | 'inspector'>
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResendVerificationRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  phone?: string
  defaultAddress?: string
  avatarUrl?: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  user: AuthUser
}
