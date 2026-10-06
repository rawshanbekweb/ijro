import { useTranslation } from 'react-i18next'
import type { Task } from '../types'
import Skeleton from './Skeleton'
import { getUserDisplayName } from '../../tasks/format'

interface OverdueListProps {
  tasks: Task[]
  isLoading?: boolean
}

export default function OverdueList({ tasks, isLoading }: OverdueListProps) {
  const { t } = useTranslation()

  const handleRemind = (taskId: string) => {
    // TODO: backend endpoint for sending a reminder notification doesn't exist yet — wire this up once available.
    console.log('Eslatma yuborildi:', taskId)
  }

  return (
    <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-ink">{t('dashboard.overdueList.title')}</h2>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <p className="py-4 text-center text-base text-muted">
          {t('dashboard.overdueList.empty')}
        </p>
      )}

      {!isLoading && tasks.length > 0 && (
        <ul className="divide-y divide-ink/10">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="truncate text-base font-medium text-ink">{task.sarlavha}</div>
                <div className="mt-0.5 truncate text-sm text-muted">
                  {task.soha?.nomi ?? '—'} · {getUserDisplayName(task.bajaruvchi, task.bajaruvchiId)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemind(task.id)}
                className="shrink-0 rounded-lg border border-amber px-4 py-2 text-sm font-semibold text-amber hover:bg-amber/10"
              >
                {t('dashboard.overdueList.remind')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
