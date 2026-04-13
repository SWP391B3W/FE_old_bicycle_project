/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearAuthSession } from '@/lib/auth-storage'
import { setUnauthorizedHandler } from '@/lib/http'
import { authService, type LoginRequest, type RegisterRequest, type User } from '@/services/authService'
import type { AppRole } from '@/types/auth'

interface AuthContextValue {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (data: LoginRequest) => Promise<void>
    register: (data: RegisterRequest) => Promise<void>
    resendVerification: (email: string) => Promise<string>
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
    setUser: (user: User | null) => void
    hasRole: (...roles: AppRole[]) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const clearSessionState = useCallback(() => {
        clearAuthSession()
        setUser(null)
        setIsLoading(false)
    }, [])

    const refreshUser = useCallback(async () => {
        if (!authService.getToken()) {
            setUser(null)
            setIsLoading(false)
            return
        }

        try {
            const me = await authService.getMe()
            setUser(me)
        } catch {
            clearSessionState()
        } finally {
            setIsLoading(false)
        }
    }, [clearSessionState])

    useEffect(() => {
        setUnauthorizedHandler(() => {
            clearSessionState()
        })

        return () => {
            setUnauthorizedHandler(null)
        }
    }, [clearSessionState])

    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    const login = useCallback(async (data: LoginRequest) => {
        const session = await authService.login(data)
        setUser(session.user)
    }, [])

    const register = useCallback(async (data: RegisterRequest) => {
        await authService.register(data)
    }, [])

    const resendVerification = useCallback(async (email: string) => {
        return authService.resendVerification({ email: email.trim() })
    }, [])

    const logout = useCallback(async () => {
        await authService.logout()
        setUser(null)
    }, [])

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isAuthenticated: Boolean(user),
            isLoading,
            login,
            register,
            resendVerification,
            logout,
            refreshUser,
            setUser,
            hasRole: (...roles) => Boolean(user?.role && roles.includes(user.role)),
        }),
        [user, isLoading, login, register, resendVerification, logout, refreshUser],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)

    if (!ctx) {
        throw new Error('useAuth must be used within an <AuthProvider>')
    }

    return ctx
}
