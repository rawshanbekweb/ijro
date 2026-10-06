import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Skeleton from '../../dashboard/components/Skeleton'
import UserHolatBadge from './UserHolatBadge'
import { useDeleteSoha } from '../hooks/useDeleteSoha'
import { getApiErrorMessage } from '../apiError'
import type { Soha, User } from '../types'

interface SohaDetailPanelProps {
  soha: Soha | null
  xodimlar: User[]
  isLoading: boolean
  onEditSoha: (soha: Soha) => void
  onEditUser: (user: User) => void
  onSohaDeleted: () => void
}

export default function SohaDetailPanel({
  soha,
  xodimlar,
  isLoading,
  onEditSoha,
  onEditUser,
  onSohaDeleted,
}: SohaDetailPanelProps) {
  const { t } = useTranslation()
  const deleteSoha = useDeleteSoha()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (!soha) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p className="text-center text-sm text-muted">
          {t('sohalar.detail.selectHint')}
        </p>
      </div>
    )
  }

  const handleDelete = () => {
    setDeleteError(null)
    const confirmed = window.confirm(t('sohalar.detail.deleteConfirm', { nomi: soha.nomi }))
    if (!confirmed) {
      return
    }
    deleteSoha.mutate(soha.id, {
      onSuccess: () => onSohaDeleted(),
      // The backend refuses to delete a soha that still has FAOL employees —
      // show that message verbatim.
      onError: (error) =>
        setDeleteError(getApiErrorMessage(error, t('sohalar.detail.deleteError'))),
    })
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-ink">{soha.nomi}</h2>
          <p className="mt-0.5 text-xs text-muted">{soha.kodi}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onEditSoha(soha)}
            title={t('sohalar.detail.editSoha')}
            aria-label={t('sohalar.detail.editSoha')}
            className="rounded-lg p-2 text-muted hover:bg-ink/5 hover:text-ink"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteSoha.isPending}
            title={t('sohalar.detail.deleteSoha')}
            aria-label={t('sohalar.detail.deleteSoha')}
            className="rounded-lg p-2 text-muted hover:bg-red/10 hover:text-red disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {deleteError && (
        <div className="mb-4 rounded-lg bg-red/10 px-3 py-2 text-sm text-red">{deleteError}</div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : xodimlar.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          {t('sohalar.detail.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="pb-2 font-medium">{t('sohalar.detail.xodim')}</th>
                <th className="pb-2 font-medium">{t('sohalar.detail.lavozim')}</th>
                <th className="pb-2 font-medium">{t('sohalar.detail.faolTopshiriqlar')}</th>
                <th className="pb-2 font-medium">{t('sohalar.detail.holat')}</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {xodimlar.map((xodim) => (
                <tr key={xodim.id}>
                  <td className="py-2.5 pr-3 text-ink">{xodim.ismFamiliya}</td>
                  <td className="py-2.5 pr-3 text-muted">{xodim.lavozim ?? '—'}</td>
                  <td className="py-2.5 pr-3 text-ink">{xodim.faolTopshiriqlarSoni}</td>
                  <td className="py-2.5 pr-3">
                    <UserHolatBadge holat={xodim.holat} />
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onEditUser(xodim)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-blue hover:bg-blue/10"
                    >
                      {t('common.edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
