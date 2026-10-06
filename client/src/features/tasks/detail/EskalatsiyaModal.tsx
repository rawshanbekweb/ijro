import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../dashboard/components/Modal'
import { useEskalatsiya } from '../hooks/useEskalatsiya'

interface EskalatsiyaModalProps {
  taskId: string
  onClose: () => void
}

/**
 * Shared between `SupervisedOverdueList` (nazorat dashboard) and
 * `TaskActions` (task detail page) — both need the same
 * `POST /tasks/:id/eskalatsiya` flow with an `izoh` (comment) field.
 */
export default function EskalatsiyaModal({ taskId, onClose }: EskalatsiyaModalProps) {
  const { t } = useTranslation()
  const [izoh, setIzoh] = useState('')
  const [touched, setTouched] = useState(false)
  const eskalatsiya = useEskalatsiya()

  const trimmed = izoh.trim()
  const hasError = touched && trimmed.length === 0

  const handleSubmit = () => {
    setTouched(true)
    if (trimmed.length === 0) {
      return
    }
    eskalatsiya.mutate(
      { id: taskId, izoh: trimmed },
      {
        onSuccess: onClose,
      },
    )
  }

  return (
    <Modal title={t('nazorat.eskalatsiyaModal.title')} onClose={onClose}>
      <div>
        <label htmlFor="izoh" className="mb-1.5 block text-base font-medium text-ink">
          {t('nazorat.eskalatsiyaModal.izohLabel')}
        </label>
        <textarea
          id="izoh"
          value={izoh}
          onChange={(e) => setIzoh(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={4}
          placeholder={t('nazorat.eskalatsiyaModal.izohPlaceholder')}
          className="w-full rounded-lg border border-muted/30 px-3 py-3 text-base text-ink outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
        />
        {hasError && (
          <p className="mt-1 text-sm text-red">{t('nazorat.eskalatsiyaModal.izohRequired')}</p>
        )}

        {eskalatsiya.isError && (
          <p className="mt-2 text-sm text-red">{t('nazorat.eskalatsiyaModal.error')}</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-base font-medium text-muted hover:bg-ink/5"
          >
            {t('nazorat.eskalatsiyaModal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={eskalatsiya.isPending}
            className="rounded-lg bg-purple px-5 py-2.5 text-base font-semibold text-white hover:bg-purple/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {eskalatsiya.isPending
              ? t('nazorat.eskalatsiyaModal.submitting')
              : t('nazorat.eskalatsiyaModal.submit')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
