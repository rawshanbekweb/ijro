import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Task } from '../types'
import { useApproveTask } from '../hooks/useApproveTask'
import RejectTaskModal from './RejectTaskModal'
import Skeleton from './Skeleton'
import { getUserDisplayName } from '../../tasks/format'

interface PendingApprovalListProps {
  tasks: Task[]
  isLoading?: boolean
}

export default function PendingApprovalList({ tasks, isLoading }: PendingApprovalListProps) {
  const { t } = useTranslation()
  const approveTask = useApproveTask()
  const [rejectTaskId, setRejectTaskId] = useState<string | null>(null)

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-ink">
        {t('dashboard.pendingApprovalList.title')}
      </h2>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <p className="py-4 text-center text-base text-muted">
          {t('dashboard.pendingApprovalList.empty')}
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
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => approveTask.mutate(task.id)}
                  disabled={approveTask.isPending}
                  className="rounded-lg bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green/90 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {t('dashboard.pendingApprovalList.approve')}
                </button>
                <button
                  type="button"
                  onClick={() => setRejectTaskId(task.id)}
                  className="rounded-lg border border-red px-4 py-2 text-sm font-semibold text-red hover:bg-red/10"
                >
                  {t('dashboard.pendingApprovalList.reject')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rejectTaskId && (
        <RejectTaskModal taskId={rejectTaskId} onClose={() => setRejectTaskId(null)} />
      )}
    </div>
  )
}
