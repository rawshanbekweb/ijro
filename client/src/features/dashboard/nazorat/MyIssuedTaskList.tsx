import { useTasks } from '../hooks/queries/useTasks'
import { useAuthStore } from '../../../store/auth.store'
import PendingApprovalList from '../components/PendingApprovalList'

/**
 * Tasks the NAZORAT created themself (`yaratuvchiId === self`, i.e. not
 * issued directly by a superadmin) that are awaiting the NAZORAT's own
 * approval. Reuses `PendingApprovalList` as-is (it already just renders
 * whatever `tasks` it's given) rather than duplicating the approve/reject UI.
 */
export default function MyIssuedTaskList() {
  const userId = useAuthStore((state) => state.user?.id)
  const { data: tasks, isLoading } = useTasks()

  const list = (tasks ?? []).filter(
    (task) => task.yaratuvchiId === userId && task.status === 'TASDIQ_KUTILMOQDA',
  )

  return <PendingApprovalList tasks={list} isLoading={isLoading} />
}
