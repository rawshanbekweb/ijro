import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/auth.store'
import { getGivenName, getInitials } from '../../features/tasks/format'
import LanguageSwitcher from '../shared/LanguageSwitcher'

function NotificationBell({ unreadCount = 0 }: { unreadCount?: number }) {
  const { t } = useTranslation()

  return (
    <button
      type="button"
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-ink/5"
      aria-label={t('layout.topbar.notifications')}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 text-[10px] font-semibold leading-none text-white">
          {unreadCount}
        </span>
      )}
    </button>
  )
}

function UserMenu() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  const givenName = getGivenName(user.ismFamiliya)
  const roleLabel = t(`roles.${user.rol}`)

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('layout.topbar.userMenu')}
        title={user.ismFamiliya}
        className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-full bg-blue px-3 text-sm font-medium text-white sm:px-4"
      >
        {/* Narrow screens only have room for initials. */}
        <span className="sm:hidden">{getInitials(user.ismFamiliya ?? roleLabel)}</span>
        <span className="hidden sm:inline">{givenName}</span>
        <span className="hidden text-white/70 sm:inline">{roleLabel}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-ink/10 bg-white shadow-lg">
            <div className="border-b border-ink/10 px-4 py-2.5 sm:hidden">
              <p className="truncate text-sm font-medium text-ink">{user.ismFamiliya}</p>
              <p className="text-xs text-muted">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="block w-full px-4 py-2.5 text-left text-sm text-ink hover:bg-ink/5"
            >
              {t('layout.topbar.profile')}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full px-4 py-2.5 text-left text-sm text-red hover:bg-ink/5"
            >
              {t('layout.topbar.logout')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Topbar({ unreadCount = 0 }: { unreadCount?: number }) {
  const { t } = useTranslation()

  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b border-ink/10 bg-white px-3 sm:px-6">
      {/* The sidebar already shows the logo; on phones the space goes to the controls. */}
      <div className="hidden min-w-0 text-sm font-bold text-ink sm:block">
        <span className="truncate">{t('app.name')}</span>
      </div>

      <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-4">
        <LanguageSwitcher />
        <NotificationBell unreadCount={unreadCount} />
        <UserMenu />
      </div>
    </header>
  )
}
