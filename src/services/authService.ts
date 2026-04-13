import { authApi, isAuthSession } from '@/api/auth.api'
import { clearAuthSession, getAccessToken, getRefreshToken, hasAccessToken, setAuthSession } from '@/lib/auth-storage'
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

export type User = AuthUser
export type {
  AuthSession,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
} from '@/types/auth'

export const authService = {
  async login(request: LoginRequest): Promise<AuthSession> {
    const session = await authApi.login(request)

    setAuthSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    })

    return session
  },

  async register(request: RegisterRequest): Promise<void> {
    await authApi.register(request)
  },

  async logout(): Promise<void> {
    try {
      if (hasAccessToken()) {
        await authApi.logout()
      }
    } finally {
      clearAuthSession()
    }
  },

  getMe() {
    return authApi.getCurrentUser()
  },

  async refreshToken(): Promise<string> {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      throw new Error('Missing refresh token')
    }

    const session = await authApi.refreshSession(refreshToken)

    setAuthSession({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    })

    return session.accessToken
  },

  forgotPassword(request: ForgotPasswordRequest) {
    return authApi.forgotPassword(request)
  },

  resendVerification(request: ResendVerificationRequest) {
    return authApi.resendVerification(request)
  },

  resetPassword(request: ResetPasswordRequest) {
    return authApi.resetPassword(request)
  },

  changePassword(request: ChangePasswordRequest) {
    return authApi.changePassword(request)
  },

  updateProfile(request: UpdateProfileRequest) {
    return authApi.updateProfile(request)
  },

  async verifyEmail(token: string): Promise<string | AuthSession> {
    const result = await authApi.verifyEmail(token)

    if (isAuthSession(result)) {
      setAuthSession({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      })
    }

    return result
  },

  getToken: getAccessToken,
  isAuthenticated: hasAccessToken,
}
