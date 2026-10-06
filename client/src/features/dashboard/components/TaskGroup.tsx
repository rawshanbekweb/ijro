import { useTranslation } from 'react-i18next'
import type { Task } from '../types'
import TaskRow from './TaskRow'
import Skeleton from './Skeleton'

interface TaskGroupProps {
  title: string
  tasks: Task[]
  isLoading?: boolean
  emptyMessage?: string
}

export default function TaskGroup({ title, tasks, isLoading, emptyMessage }: TaskGroupProps) {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-ink">{title}</h2>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <p className="py-4 text-center text-base text-muted">
          {emptyMessage ?? t('dashboard.taskGroup.empty')}
        </p>
      )}

      {!isLoading && tasks.length > 0 && (
        <ul className="divide-y divide-ink/10">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  )
}
