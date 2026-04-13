import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import type { AppRole } from '@/types/auth'
import BikeLoader from '../components/common/BikeLoader'
import { ROUTES } from '../constants/routes'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: AppRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const location = useLocation()
    const { hasRole, isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <BikeLoader />
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    }

    if (allowedRoles?.length && !hasRole(...allowedRoles)) {
        return <Navigate to={ROUTES.HOME} replace />
    }

    return <>{children}</>
}
