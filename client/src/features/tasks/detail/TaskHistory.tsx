import { useTranslation } from 'react-i18next'
import Skeleton from '../../dashboard/components/Skeleton'
import { useTaskHistory } from '../hooks/queries/useTaskHistory'
import { formatDateTime, getUserDisplayName } from '../format'

// Raw audit action codes emitted by the backend `@AuditAction()` decorator;
// each has a label under `tasks.history.actions`.
const KNOWN_HARAKATLAR = new Set([
  'TASK_CREATED',
  'TASK_TANISHILDI',
  'TASK_SUBTASK_UPDATED',
  'TASK_BAJARILDI',
  'TASK_TASDIQLANDI',
  'TASK_QAYTARILDI',
  'TASK_BEKOR_QILINDI',
  'COMMENT_ADDED',
])

interface TaskHistoryProps {
  taskId: string
}

export default function TaskHistory({ taskId }: TaskHistoryProps) {
  const { t } = useTranslation()
  const { data: entries, isLoading, isError } = useTaskHistory(taskId)

  const list = entries ?? []

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold text-ink">{t('tasks.history.title')}</h2>

      {isLoading && (
        <div className="mt-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && <p className="mt-4 text-sm text-red">{t('tasks.history.loadError')}</p>}

      {!isLoading && !isError && list.length === 0 && (
        <p className="py-4 text-center text-sm text-muted">{t('tasks.history.empty')}</p>
      )}

      {!isLoading && !isError && list.length > 0 && (
        <ol className="mt-4 space-y-5 border-l border-muted/30 pl-5">
          {list.map((entry) => {
            const name = getUserDisplayName(entry.user, entry.userId)

            return (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue" />
                <p className="text-sm font-medium text-ink">
                  {KNOWN_HARAKATLAR.has(entry.harakat)
                    ? t(`tasks.history.actions.${entry.harakat}`)
                    : entry.harakat}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {name} · {formatDateTime(entry.createdAt) ?? ''}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
