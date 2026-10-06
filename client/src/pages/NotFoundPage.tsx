import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/auth.store'
import { dashboardPathByRole } from '../routes/dashboard-paths'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const homePath = user ? dashboardPathByRole[user.rol] : '/login'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <p className="text-6xl font-bold text-blue">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">{t('notFound.title')}</h1>
      <p className="mt-2 max-w-md text-base text-muted">{t('notFound.description')}</p>
      <Link
        to={homePath}
        className="mt-6 rounded-lg bg-blue px-5 py-3 text-base font-semibold text-white hover:bg-blue-deep"
      >
        {t('notFound.home')}
      </Link>
    </div>
  )
}
