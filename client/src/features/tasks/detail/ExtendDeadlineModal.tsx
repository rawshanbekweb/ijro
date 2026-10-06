import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../../dashboard/components/Modal'

interface ExtendDeadlineModalProps {
  onClose: () => void
}

/**
 * UI only for now — there is no "muddat uzaytirish" endpoint on the backend
 * yet, so submitting just closes the modal. Wire the request up here once the
 * endpoint lands.
 */
export default function ExtendDeadlineModal({ onClose }: ExtendDeadlineModalProps) {
  const { t } = useTranslation()
  const [sabab, setSabab] = useState('')
  const [yangiMuddat, setYangiMuddat] = useState('')

  return (
    <Modal title={t('tasks.extendModal.title')} onClose={onClose}>
      <div>
        <label htmlFor="yangiMuddat" className="mb-1.5 block text-sm font-medium text-ink">
          {t('tasks.extendModal.newMuddat')}
        </label>
        <input
          id="yangiMuddat"
          type="date"
          value={yangiMuddat}
          onChange={(e) => setYangiMuddat(e.target.value)}
          className="w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        />

        <label htmlFor="uzaytirishSababi" className="mb-1.5 mt-4 block text-sm font-medium text-ink">
          {t('tasks.extendModal.sabab')}
        </label>
        <textarea
          id="uzaytirishSababi"
          value={sabab}
          onChange={(e) => setSabab(e.target.value)}
          rows={4}
          placeholder={t('tasks.extendModal.sababPlaceholder')}
          className="w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        />

        <p className="mt-3 rounded-lg bg-amber/10 px-3 py-2 text-xs text-amber">
          {t('tasks.extendModal.notice')}
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-ink/5"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            disabled
            title={t('common.comingSoon')}
            className="rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('tasks.extendModal.submit')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
