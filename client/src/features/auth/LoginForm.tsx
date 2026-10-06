import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import type { AxiosError } from 'axios'
import axiosInstance from '../../api/axios-instance'
import { useAuthStore, type AuthUser } from '../../store/auth.store'
import { loginSchema, type LoginFormValues } from './login.schema'

interface LoginResponse {
  accessToken: string
  refreshToken: string
}

interface ErrorResponseBody {
  statusCode?: number
  message?: string
  reason?: string
  code?: string
}

export default function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null)
    try {
      const { data } = await axiosInstance.post<LoginResponse>('/auth/login', values)
      // /auth/login only returns tokens; attach the access token first so the
      // request interceptor can authenticate the follow-up /auth/me call.
      useAuthStore.getState().setTokens(data.accessToken, data.refreshToken)
      const { data: user } = await axiosInstance.get<AuthUser>('/auth/me')
      login(user, data.accessToken, data.refreshToken)
      navigate('/dashboard')
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponseBody>
      const status = axiosError.response?.status
      const reasonOrCode = axiosError.response?.data?.reason ?? axiosError.response?.data?.code

      if (status === 401) {
        setFormError(t('auth.login.errorInvalid'))
      } else if (status === 403 && reasonOrCode === 'NOFAOL') {
        setFormError(t('auth.login.errorInactive'))
      } else {
        setFormError(t('auth.login.errorGeneric'))
      }
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate className="w-full">
      {formError && (
        <div className="mb-4 rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{formError}</div>
      )}

      <div className="mb-4">
        <label htmlFor="login" className="mb-1.5 block text-sm font-medium text-ink">
          {t('auth.login.loginLabel')}
        </label>
        <input
          id="login"
          type="text"
          autoComplete="username"
          placeholder={t('auth.login.loginPlaceholder')}
          className="w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
          {...register('login')}
        />
        {errors.login && (
          <p className="mt-1 text-xs text-red">{t(errors.login.message ?? '')}</p>
        )}
      </div>

      <div className="mb-6">
        <label htmlFor="parol" className="mb-1.5 block text-sm font-medium text-ink">
          {t('auth.login.parolLabel')}
        </label>
        <div className="relative">
          <input
            id="parol"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder={t('auth.login.parolPlaceholder')}
            className="w-full rounded-lg border border-muted/30 px-3 py-2.5 pr-10 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            {...register('parol')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.parol && (
          <p className="mt-1 text-xs text-red">{t(errors.parol.message ?? '')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && <Loader2 size={18} className="animate-spin" />}
        {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
      </button>
    </form>
  )
}
