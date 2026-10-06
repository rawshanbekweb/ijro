import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, type Role } from '../store/auth.store'
import { dashboardPathByRole } from './dashboard-paths'

interface ProtectedRouteProps {
  allowedRoles?: Role[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, accessToken, hasHydrated } = useAuthStore()

  if (!hasHydrated) {
    return null
  }

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to={dashboardPathByRole[user.rol]} replace />
  }

  return <Outlet />
}
