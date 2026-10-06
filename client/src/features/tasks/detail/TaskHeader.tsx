import { useTranslation } from 'react-i18next'
import StatusBadge from '../../dashboard/components/StatusBadge'
import { formatDate, formatDateTime, getShortTaskCode, getUserDisplayName } from '../format'
import type { Task } from '../types'

interface TaskHeaderProps {
  task: Task
}

export default function TaskHeader({ task }: TaskHeaderProps) {
  const { t } = useTranslation()
  const muallif = getUserDisplayName(task.muallif, task.muallifId)
  const yaratuvchi = getUserDisplayName(task.yaratuvchi, task.yaratuvchiId)
  const isDelegated = task.yaratuvchiId !== task.muallifId
  const muddat = formatDate(task.muddat) ?? '—'
  const tanishildi = formatDateTime(task.tanishildiAt) ?? t('tasks.detail.notTanishilgan')

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge color={task.hisoblanganStatus} />
        <span className="rounded-md bg-ink/5 px-2 py-0.5 font-mono text-xs text-muted">
          #{getShortTaskCode(task.id)}
        </span>
        {task.soha?.nomi && <span className="text-xs text-muted">{task.soha.nomi}</span>}
      </div>

      <h1 className="mt-3 text-xl font-bold text-ink">{task.sarlavha}</h1>

      <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
        <div className="flex gap-1.5">
          <dt>{t('tasks.detail.muallif')}:</dt>
          <dd className="font-medium text-ink/70">{muallif}</dd>
        </div>
        {isDelegated && (
          <div className="flex gap-1.5">
            <dt>{t('nazorat.taskHeader.yaratuvchi')}:</dt>
            <dd className="font-medium text-ink/70">{yaratuvchi}</dd>
          </div>
        )}
        <div className="flex gap-1.5">
          <dt>{t('tasks.detail.muddat')}:</dt>
          <dd className="font-medium text-ink/70">{muddat}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>{t('tasks.detail.tanishilgan')}:</dt>
          <dd className="font-medium text-ink/70">{tanishildi}</dd>
        </div>
      </dl>

      {task.tavsif && (
        <p className="mt-4 whitespace-pre-line border-t border-muted/20 pt-4 text-sm text-ink/80">
          {task.tavsif}
        </p>
      )}

      {task.qaytarishSababi && (
        <div className="mt-4 rounded-lg bg-red/10 px-3 py-2.5 text-sm text-red">
          <span className="font-semibold">{t('tasks.detail.qaytarishSababi')}: </span>
          {task.qaytarishSababi}
        </div>
      )}
    </div>
  )
}
