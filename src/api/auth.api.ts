import { getResult, patchResult, postResult } from '@/lib/http'
import type {
  AuthSession,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from '@/types/auth'

function isAuthSession(result: unknown): result is AuthSession {
  if (!result || typeof result !== 'object') {
    return false
  }

  const candidate = result as Partial<AuthSession>

  return typeof candidate.accessToken === 'string' && Boolean(candidate.user)
}

function isVerifyEmailResult(result: unknown): result is string | AuthSession {
  return typeof result === 'string' || isAuthSession(result)
}

function isApiResponse(result: unknown): result is { code: number; message?: string; result: string | AuthSession } {
  if (!result || typeof result !== 'object') {
    return false
  }

  const candidate = result as Partial<{ code: number; message?: string; result: unknown }>
  return typeof candidate.code === 'number' && (typeof candidate.result === 'string' || isAuthSession(candidate.result))
}

function normalizeAuthUser(user: Omit<AuthUser, 'name' | 'avatar' | 'address' | 'verified'> & Partial<AuthUser>): AuthUser {
  const firstName = user.firstName ?? ''
  const lastName = user.lastName ?? ''

  return {
    ...user,
    name: `${firstName} ${lastName}`.trim(),
    avatar: user.avatar ?? user.avatarUrl ?? null,
    address: user.address ?? user.defaultAddress ?? null,
    verified: Boolean(user.verified ?? user.isVerified),
  }
}

function normalizeAuthSession(session: AuthSession): AuthSession {
  return {
    ...session,
    user: normalizeAuthUser(session.user),
  }
}

export const authApi = {
  login(request: LoginRequest) {
    return postResult<AuthSession, LoginRequest>('/api/auth/login', request).then(normalizeAuthSession)
  },

  register(request: RegisterRequest) {
    return postResult<string, RegisterRequest>('/api/auth/register', request)
  },

  logout() {
    return postResult<string>('/api/auth/logout')
  },

  getCurrentUser() {
    return getResult<AuthUser>('/api/auth/me').then(normalizeAuthUser)
  },

  refreshSession(refreshToken: string) {
    return postResult<AuthSession, { refreshToken: string }>('/api/auth/refresh', { refreshToken }).then(
      normalizeAuthSession,
    )
  },

  forgotPassword(request: ForgotPasswordRequest) {
    return postResult<string, ForgotPasswordRequest>('/api/auth/forgot-password', request)
  },

  resendVerification(request: ResendVerificationRequest) {
    return postResult<string, ResendVerificationRequest>('/api/auth/resend-verification', request)
  },

  resetPassword(request: ResetPasswordRequest) {
    return postResult<string, ResetPasswordRequest>('/api/auth/reset-password', request)
  },

  changePassword(request: ChangePasswordRequest) {
    return patchResult<string, ChangePasswordRequest>('/api/auth/change-password', request)
  },

  updateProfile(request: UpdateProfileRequest) {
    return patchResult<AuthUser, UpdateProfileRequest>('/api/auth/profile', request).then(normalizeAuthUser)
  },

  verifyEmail(token: string) {
    return getResult<unknown>('/api/auth/verify-email', { params: { token } }).then((response) => {
      // Handle new API response format: { code, message?, result }
      if (isApiResponse(response)) {
        if (response.code !== 1000) {
          throw new Error(response.message || 'Email verification failed')
        }
        const result = response.result
        if (!isVerifyEmailResult(result)) {
          throw new Error('Invalid verify email response')
        }
        return isAuthSession(result) ? normalizeAuthSession(result) : result
      }

      // Handle legacy direct response format
      if (!isVerifyEmailResult(response)) {
        throw new Error('Invalid verify email response')
      }

      return isAuthSession(response) ? normalizeAuthSession(response) : response
    })
  },
}

export { isAuthSession, normalizeAuthUser }
