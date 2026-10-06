import { useParams } from 'react-router-dom'
import { isAxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import Skeleton from '../../dashboard/components/Skeleton'
import { useAuthStore } from '../../../store/auth.store'
import { useTask } from '../hooks/queries/useTask'
import CommentSection from './CommentSection'
import SubtaskChecklist from './SubtaskChecklist'
import TaskActions from './TaskActions'
import TaskHeader from './TaskHeader'
import TaskHistory from './TaskHistory'

/** i18n key describing why the task could not be loaded. */
function getErrorMessageKey(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 403) {
      return 'tasks.detail.forbidden'
    }
    if (error.response?.status === 404) {
      return 'tasks.detail.notFound'
    }
  }
  return 'tasks.detail.loadError'
}

function TaskDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
      <div className="space-y-4 lg:col-span-1">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function TaskDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const currentUser = useAuthStore((state) => state.user)
  const { data: task, isLoading, isError, error } = useTask(id)

  if (!id) {
    return <p className="text-sm text-red">{t('tasks.detail.notFound')}</p>
  }

  if (isLoading) {
    return <TaskDetailSkeleton />
  }

  if (isError || !task) {
    return (
      <div className="rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{t(getErrorMessageKey(error))}</div>
    )
  }

  const canEditSubtasks = currentUser?.id === task.bajaruvchiId

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <TaskHeader task={task} />
        <SubtaskChecklist task={task} canEdit={canEditSubtasks} />
        <CommentSection taskId={task.id} />
      </div>

      <div className="space-y-4 lg:col-span-1">
        <TaskActions task={task} />
        <TaskHistory taskId={task.id} />
      </div>
    </div>
  )
}
