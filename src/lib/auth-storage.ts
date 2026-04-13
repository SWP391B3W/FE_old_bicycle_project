const ACCESS_TOKEN_KEY = 'authToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export interface StoredAuthSession {
  accessToken: string
  refreshToken?: string | null
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthSession(session: StoredAuthSession) {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)

  if (session.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
    return
  }

  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken())
}
