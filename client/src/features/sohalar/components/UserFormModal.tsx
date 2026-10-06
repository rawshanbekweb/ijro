import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from '../../dashboard/components/Modal'
import { createUserFormSchema, type UserFormValues } from '../user.schema'
import { useSohalar } from '../hooks/queries/useSohalar'
import { useCreateUser } from '../hooks/useCreateUser'
import { useUpdateUser } from '../hooks/useUpdateUser'
import { getApiErrorMessage } from '../apiError'
import type { User, UserPayload } from '../types'

interface UserFormModalProps {
  /** When provided the modal edits this user; otherwise it creates a new one. */
  user?: User
  /** Pre-selects a soha when creating a user from a selected soha card. */
  defaultSohaId?: string | null
  onClose: () => void
}

const inputClass =
  'w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20'

export default function UserFormModal({ user, defaultSohaId, onClose }: UserFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(user)
  const { data: sohalar } = useSohalar()
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const [formError, setFormError] = useState<string | null>(null)

  const schema = useMemo(() => createUserFormSchema(isEdit), [isEdit])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ismFamiliya: user?.ismFamiliya ?? '',
      login: user?.login ?? '',
      parol: '',
      rol: user?.rol ?? 'BAJARUVCHI',
      sohaId: user?.sohaId ?? defaultSohaId ?? '',
      lavozim: user?.lavozim ?? '',
      holat: user?.holat ?? 'FAOL',
    },
  })

  const rol = useWatch({ control, name: 'rol' })

  const onSubmit = async (values: UserFormValues) => {
    setFormError(null)

    const lavozim = values.lavozim.trim()
    const payload: Partial<UserPayload> = {
      ismFamiliya: values.ismFamiliya.trim(),
      login: values.login.trim(),
      rol: values.rol,
      holat: values.holat,
      // `sohaId` must be omitted entirely for SUPERADMIN — the backend rejects
      // the request outright when it is present.
      ...(values.rol === 'BAJARUVCHI' ? { sohaId: values.sohaId } : {}),
      // On create an empty lavozim is omitted; on edit an empty value is sent
      // through so it can actually be cleared.
      ...(lavozim === '' && !isEdit ? {} : { lavozim }),
      // An absent `parol` on PATCH leaves the stored hash untouched.
      ...(values.parol === '' ? {} : { parol: values.parol }),
    }

    try {
      if (user) {
        await updateUser.mutateAsync({ id: user.id, payload })
      } else {
        await createUser.mutateAsync(payload as UserPayload)
      }
      onClose()
    } catch (error) {
      setFormError(getApiErrorMessage(error, t('sohalar.userForm.error')))
    }
  }

  return (
    <Modal title={isEdit ? t('sohalar.userForm.titleEdit') : t('sohalar.userForm.titleCreate')} onClose={onClose}>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        {formError && (
          <div className="mb-4 rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{formError}</div>
        )}

        <div className="mb-4">
          <label htmlFor="user-ismFamiliya" className="mb-1.5 block text-sm font-medium text-ink">
            {t('sohalar.userForm.ismFamiliya')}
          </label>
          <input id="user-ismFamiliya" type="text" className={inputClass} {...register('ismFamiliya')} />
          {errors.ismFamiliya && (
            <p className="mt-1 text-xs text-red">{t(errors.ismFamiliya.message ?? '')}</p>
          )}
        </div>

        <div className="mb-4">
          <label htmlFor="user-login" className="mb-1.5 block text-sm font-medium text-ink">
            {t('sohalar.userForm.login')}
          </label>
          <input
            id="user-login"
            type="text"
            autoComplete="off"
            className={inputClass}
            {...register('login')}
          />
          {errors.login && <p className="mt-1 text-xs text-red">{t(errors.login.message ?? '')}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="user-parol" className="mb-1.5 block text-sm font-medium text-ink">
            {t('sohalar.userForm.parol')}
          </label>
          <input
            id="user-parol"
            type="password"
            autoComplete="new-password"
            placeholder={isEdit ? t('sohalar.userForm.parolKeep') : ''}
            className={inputClass}
            {...register('parol')}
          />
          {errors.parol && <p className="mt-1 text-xs text-red">{t(errors.parol.message ?? '')}</p>}
        </div>

        <div className="mb-4">
          <label htmlFor="user-rol" className="mb-1.5 block text-sm font-medium text-ink">
            {t('sohalar.userForm.rol')}
          </label>
          <select id="user-rol" className={inputClass} {...register('rol')}>
            <option value="BAJARUVCHI">{t('roles.BAJARUVCHI')}</option>
            <option value="NAZORAT">{t('roles.NAZORAT')}</option>
            <option value="SUPERADMIN">{t('roles.SUPERADMIN')}</option>
          </select>
          {errors.rol && <p className="mt-1 text-xs text-red">{t(errors.rol.message ?? '')}</p>}
        </div>

        {rol === 'BAJARUVCHI' && (
          <div className="mb-4">
            <label htmlFor="user-sohaId" className="mb-1.5 block text-sm font-medium text-ink">
              {t('sohalar.userForm.soha')}
            </label>
            <select id="user-sohaId" className={inputClass} {...register('sohaId')}>
              <option value="">{t('sohalar.userForm.selectSoha')}</option>
              {(sohalar ?? []).map((soha) => (
                <option key={soha.id} value={soha.id}>
                  {soha.nomi}
                </option>
              ))}
            </select>
            {errors.sohaId && <p className="mt-1 text-xs text-red">{t(errors.sohaId.message ?? '')}</p>}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="user-lavozim" className="mb-1.5 block text-sm font-medium text-ink">
            {t('sohalar.userForm.lavozim')}
          </label>
          <input
            id="user-lavozim"
            type="text"
            placeholder={t('sohalar.userForm.lavozimPlaceholder')}
            className={inputClass}
            {...register('lavozim')}
          />
          {errors.lavozim && <p className="mt-1 text-xs text-red">{t(errors.lavozim.message ?? '')}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="user-holat" className="mb-1.5 block text-sm font-medium text-ink">
            {t('sohalar.userForm.holat')}
          </label>
          <select id="user-holat" className={inputClass} {...register('holat')}>
            <option value="FAOL">{t('sohalar.holat.FAOL')}</option>
            <option value="NOFAOL">{t('sohalar.holat.NOFAOL')}</option>
          </select>
          {errors.holat && <p className="mt-1 text-xs text-red">{t(errors.holat.message ?? '')}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-ink/5"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {t('common.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
