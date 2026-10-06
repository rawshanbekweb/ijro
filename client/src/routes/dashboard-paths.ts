import type { Role } from '../store/auth.store'

export const dashboardPathByRole: Record<Role, string> = {
  SUPERADMIN: '/admin',
  BAJARUVCHI: '/bajaruvchi',
  NAZORAT: '/nazorat',
}
