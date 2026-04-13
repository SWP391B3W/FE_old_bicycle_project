import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api'
import { clearAuthSession, getAccessToken, getRefreshToken, setAuthSession } from '@/lib/auth-storage'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

const sharedHeaders = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let onUnauthorized: (() => void) | null = null
let refreshPromise: Promise<string> | null = null

const publicAuthPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/forgot-password',
  '/api/auth/resend-verification',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
]

function isPublicAuthRequest(url?: string): boolean {
  if (!url) {
    return false
  }

  return publicAuthPaths.some((path) => url.includes(path))
}

function applyAuthorizationHeader(config: { headers?: unknown }, token: string) {
  if (!config.headers) {
    config.headers = { Authorization: `Bearer ${token}` }
    return
  }

  const headers = config.headers as Record<string, string>
  headers.Authorization = `Bearer ${token}`
}

async function requestNewAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    throw new Error('Missing refresh token')
  }

  const response = await refreshClient.post<ApiResponse<{ accessToken: string; refreshToken?: string | null }>>(
    '/api/auth/refresh',
    { refreshToken },
  )

  const accessToken = response.data.result?.accessToken

  if (!accessToken) {
    throw new Error('Invalid refresh token response')
  }

  setAuthSession({
    accessToken,
    refreshToken: response.data.result?.refreshToken ?? refreshToken,
  })

  return accessToken
}

function notifyUnauthorized() {
  onUnauthorized?.()
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler
}

export function compactParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>
}

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: sharedHeaders,
})

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  headers: sharedHeaders,
})

http.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    applyAuthorizationHeader(config, accessToken)
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config as RetryableConfig | undefined

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    if (!getRefreshToken()) {
      clearAuthSession()
      notifyUnauthorized()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = requestNewAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const newAccessToken = await refreshPromise
      applyAuthorizationHeader(originalRequest, newAccessToken)
      return http(originalRequest)
    } catch (refreshError) {
      clearAuthSession()
      notifyUnauthorized()
      return Promise.reject(refreshError)
    }
  },
)

export async function getResult<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await http.get<ApiResponse<T>>(url, config)
  return response.data.result
}

export async function postResult<T, P = unknown>(
  url: string,
  payload?: P,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.post<ApiResponse<T>>(url, payload, config)
  return response.data.result
}

export async function patchResult<T, P = unknown>(
  url: string,
  payload?: P,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.patch<ApiResponse<T>>(url, payload, config)
  return response.data.result
}

export async function putResult<T, P = unknown>(
  url: string,
  payload?: P,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await http.put<ApiResponse<T>>(url, payload, config)
  return response.data.result
}

export async function deleteResult<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await http.delete<ApiResponse<T>>(url, config)
  return response.data.result
}

export default http
