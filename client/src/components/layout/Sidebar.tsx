import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  ListChecks,
  Plus,
  ShieldCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/auth.store'
import { useUiStore } from '../../store/ui.store'

interface NavItem {
  /** i18n key under `layout.nav`. */
  labelKey: string
  path: string
  icon: LucideIcon
  end?: boolean
}

const superadminItems: NavItem[] = [
  { labelKey: 'layout.nav.home', path: '/admin', icon: Home, end: true },
  { labelKey: 'layout.nav.allTasks', path: '/tasks', icon: ListChecks },
  { labelKey: 'layout.nav.sohalar', path: '/sohalar', icon: Building2 },
  { labelKey: 'layout.nav.nazoratHuquqlari', path: '/nazorat-huquqlari', icon: ShieldCheck },
]

const bajaruvchiItems: NavItem[] = [
  { labelKey: 'layout.nav.home', path: '/bajaruvchi', icon: Home, end: true },
  { labelKey: 'layout.nav.myTasks', path: '/tasks', icon: ListChecks },
]

const nazoratItems: NavItem[] = [
  { labelKey: 'layout.nav.home', path: '/nazorat', icon: Home, end: true },
  { labelKey: 'layout.nav.allTasks', path: '/tasks', icon: ListChecks },
  { labelKey: 'layout.nav.newTask', path: '/tasks/yangi', icon: Plus },
]

const navItemsByRole: Record<string, NavItem[]> = {
  SUPERADMIN: superadminItems,
  BAJARUVCHI: bajaruvchiItems,
  NAZORAT: nazoratItems,
}

export default function Sidebar() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const collapsed = useUiStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUiStore((state) => state.toggleSidebar)

  const items = user ? (navItemsByRole[user.rol] ?? bajaruvchiItems) : bajaruvchiItems

  return (
    <aside
      className="flex h-full flex-col bg-blue transition-[width] duration-200"
      style={{ width: collapsed ? 68 : 260 }}
    >
      <div className="flex items-center px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-sm font-bold text-blue">
          JK
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {items.map(({ labelKey, path, icon: Icon, end }) => {
          const label = t(labelKey)
          return (
            <NavLink
              key={path}
              to={path}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white transition-colors ${
                  isActive ? 'bg-white/15' : 'hover:bg-white/10'
                }`
              }
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-lg py-2 text-white hover:bg-white/10"
          aria-label={collapsed ? t('layout.sidebar.expand') : t('layout.sidebar.collapse')}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  )
}
