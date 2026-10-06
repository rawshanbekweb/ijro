import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../../../api/axios-instance'
import { useAuthStore } from '../../../../store/auth.store'
import type { Task } from '../../types'
import { TERMINAL_STATUSES } from '../../stats'

/**
 * Tasks a NAZORAT is supervising (`yaratuvchiId === self`, `muallifId` is the
 * delegating superadmin — the NAZORAT issued them on the superadmin's behalf)
 * that are overdue (`hisoblanganStatus === 'QIZIL'`) and still active, so the
 * NAZORAT can escalate them back to that superadmin.
 *
 * `GET /tasks` has no `yaratuvchiId`/`hisoblanganStatus` query params (see
 * `FindTasksQueryDto` on the backend) — for SUPERADMIN/NAZORAT callers it
 * returns the full task list unfiltered by ownership, so the ownership +
 * overdue filtering happens client-side here rather than via request params.
 */
export function useOverdueSupervised() {
  const userId = useAuthStore((state) => state.user?.id)

  return useQuery({
    queryKey: ['tasks', 'overdue-supervised', userId],
    queryFn: () => axiosInstance.get<Task[]>('/tasks').then((res) => res.data),
    enabled: Boolean(userId),
    select: (tasks) =>
      tasks.filter(
        (task) =>
          task.yaratuvchiId === userId &&
          task.muallifId !== userId &&
          task.hisoblanganStatus === 'QIZIL' &&
          !TERMINAL_STATUSES.has(task.status),
      ),
  })
}
