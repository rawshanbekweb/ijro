import { useTranslation } from 'react-i18next'
import LoginForm from './LoginForm'
import LanguageSwitcher from '../../components/shared/LanguageSwitcher'

export default function LoginPage() {
  const { t } = useTranslation()

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-linear-to-br from-[#0B5CD6] to-[#12A17B] px-16 text-white lg:flex">
        <h1 className="mb-4 text-3xl font-bold">{t('app.name')}</h1>
        <p className="max-w-md text-base text-white/90">{t('auth.login.description')}</p>
      </div>

      <div className="relative flex flex-col items-center justify-center px-6 py-12">
        <div className="absolute right-6 top-6">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue text-sm font-bold text-white">
              JK
            </div>
            <h2 className="text-xl font-semibold text-ink">{t('auth.login.title')}</h2>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-sm text-muted">{t('auth.login.noAccount')}</p>
        </div>
      </div>
    </div>
  )
}
