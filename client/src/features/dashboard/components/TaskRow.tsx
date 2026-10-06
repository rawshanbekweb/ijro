import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Task } from '../types'
import ProgressBar from './ProgressBar'
import StatusBadge from './StatusBadge'

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

interface TaskRowProps {
  task: Task
}

export default function TaskRow({ task }: TaskRowProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const done = task.subtasklar.filter((subtask) => subtask.bajarildi).length
  const total = task.subtasklar.length

  return (
    <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-medium text-ink">{task.sarlavha}</div>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <ProgressBar done={done} total={total} />
          <span className="text-sm text-muted">{formatDate(task.muddat)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge color={task.hisoblanganStatus} />
        <button
          type="button"
          onClick={() => navigate(`/tasks/${task.id}`)}
          className="rounded-lg border border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue/10"
        >
          {t('dashboard.taskRow.open')}
        </button>
      </div>
    </li>
  )
}
