import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from './Modal'
import { useRejectTask } from '../hooks/useRejectTask'

interface RejectTaskModalProps {
  taskId: string
  onClose: () => void
}

export default function RejectTaskModal({ taskId, onClose }: RejectTaskModalProps) {
  const { t } = useTranslation()
  const [sabab, setSabab] = useState('')
  const [touched, setTouched] = useState(false)
  const rejectTask = useRejectTask()

  const trimmed = sabab.trim()
  const hasError = touched && trimmed.length === 0

  const handleSubmit = () => {
    setTouched(true)
    if (trimmed.length === 0) {
      return
    }
    rejectTask.mutate(
      { id: taskId, sabab: trimmed },
      {
        onSuccess: onClose,
      },
    )
  }

  return (
    <Modal title={t('dashboard.rejectModal.title')} onClose={onClose}>
      <div>
        <label htmlFor="sabab" className="mb-1.5 block text-base font-medium text-ink">
          {t('dashboard.rejectModal.reasonLabel')}
        </label>
        <textarea
          id="sabab"
          value={sabab}
          onChange={(e) => setSabab(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={4}
          placeholder={t('dashboard.rejectModal.reasonPlaceholder')}
          className="w-full rounded-lg border border-muted/30 px-3 py-3 text-base text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        />
        {hasError && (
          <p className="mt-1 text-sm text-red">{t('dashboard.rejectModal.reasonRequired')}</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-base font-medium text-muted hover:bg-ink/5"
          >
            {t('dashboard.rejectModal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={rejectTask.isPending}
            className="rounded-lg bg-red px-5 py-2.5 text-base font-semibold text-white hover:bg-red/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {rejectTask.isPending
              ? t('dashboard.rejectModal.submitting')
              : t('dashboard.rejectModal.submit')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
