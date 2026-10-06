import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import ProtectedRoute from './ProtectedRoute'
import { dashboardPathByRole } from './dashboard-paths'
import LoginPage from '../features/auth/LoginPage'
import DashboardRouter from '../features/dashboard/DashboardRouter'
import PageShell from '../components/layout/PageShell'
import TaskDetailPage from '../features/tasks/detail/TaskDetailPage'
import TasksPage from '../features/tasks/list/TasksPage'
import CreateTaskPage from '../features/tasks/create/CreateTaskPage'
import SohalarPage from '../features/sohalar/pages/SohalarPage'
import DelegationPage from '../features/delegation/pages/DelegationPage'
import NotFoundPage from '../pages/NotFoundPage'

function RootRedirect() {
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)

  if (!hasHydrated) {
    return null
  }

  return <Navigate to={user ? dashboardPathByRole[user.rol] : '/login'} replace />
}

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route path="/" element={<RootRedirect />} />
      <Route path="/dashboard" element={<RootRedirect />} />

      <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'BAJARUVCHI', 'NAZORAT']} />}>
        <Route element={<PageShell />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />

          <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN', 'NAZORAT']} />}>
            <Route path="/tasks/yangi" element={<CreateTaskPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN']} />}>
            <Route path="/sohalar" element={<SohalarPage />} />
            <Route path="/nazorat-huquqlari" element={<DelegationPage />} />
            <Route path="/admin/*" element={<DashboardRouter />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['BAJARUVCHI']} />}>
            <Route path="/bajaruvchi/*" element={<DashboardRouter />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['NAZORAT']} />}>
            <Route path="/nazorat/*" element={<DashboardRouter />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
