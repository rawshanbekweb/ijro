import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from '../../dashboard/components/Modal'
import { sohaFormSchema, type SohaFormValues } from '../soha.schema'
import { useCreateSoha } from '../hooks/useCreateSoha'
import { useUpdateSoha } from '../hooks/useUpdateSoha'
import { getApiErrorMessage } from '../apiError'
import type { Soha } from '../types'

interface SohaFormModalProps {
  /** When provided the modal edits this soha; otherwise it creates a new one. */
  soha?: Soha
  onClose: () => void
}

export default function SohaFormModal({ soha, onClose }: SohaFormModalProps) {
  const { t } = useTranslation()
  const isEdit = Boolean(soha)
  const createSoha = useCreateSoha()
  const updateSoha = useUpdateSoha()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SohaFormValues>({
    resolver: zodResolver(sohaFormSchema),
    defaultValues: {
      nomi: soha?.nomi ?? '',
      kodi: soha?.kodi ?? '',
    },
  })

  const onSubmit = async (values: SohaFormValues) => {
    setFormError(null)
    try {
      if (soha) {
        await updateSoha.mutateAsync({ id: soha.id, payload: values })
      } else {
        await createSoha.mutateAsync(values)
      }
      onClose()
    } catch (error) {
      setFormError(getApiErrorMessage(error, t('sohalar.sohaForm.error')))
    }
  }

  return (
    <Modal title={isEdit ? t('sohalar.sohaForm.titleEdit') : t('sohalar.sohaForm.titleCreate')} onClose={onClose}>
      <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        {formError && (
          <div className="mb-4 rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{formError}</div>
        )}

        <div className="mb-4">
          <label htmlFor="soha-nomi" className="mb-1.5 block text-sm font-medium text-ink">
            {t('sohalar.sohaForm.nomi')}
          </label>
          <input
            id="soha-nomi"
            type="text"
            placeholder={t('sohalar.sohaForm.nomiPlaceholder')}
            className="w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            {...register('nomi')}
          />
          {errors.nomi && <p className="mt-1 text-xs text-red">{t(errors.nomi.message ?? '')}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="soha-kodi" className="mb-1.5 block text-sm font-medium text-ink">
            {t('sohalar.sohaForm.kodi')}
          </label>
          <input
            id="soha-kodi"
            type="text"
            placeholder={t('sohalar.sohaForm.kodiPlaceholder')}
            className="w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
            {...register('kodi')}
          />
          {errors.kodi && <p className="mt-1 text-xs text-red">{t(errors.kodi.message ?? '')}</p>}
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
