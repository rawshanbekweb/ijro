import { useAuthStore } from '../../store/auth.store'
import SuperadminDashboard from './pages/SuperadminDashboard'
import BajaruvchiDashboard from './pages/BajaruvchiDashboard'
import NazoratDashboard from './nazorat/NazoratDashboard'

export default function DashboardRouter() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return null
  }

  if (user.rol === 'SUPERADMIN') {
    return <SuperadminDashboard />
  }

  if (user.rol === 'BAJARUVCHI') {
    return <BajaruvchiDashboard />
  }

  if (user.rol === 'NAZORAT') {
    return <NazoratDashboard />
  }

  return null
}
