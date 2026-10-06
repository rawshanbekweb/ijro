import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../../../api/axios-instance'
import { taskHistoryQueryKey } from '../../queryKeys'
import type { AuditLog } from '../../types'

export function useTaskHistory(id: string | undefined) {
  return useQuery({
    queryKey: taskHistoryQueryKey(id ?? ''),
    queryFn: () => axiosInstance.get<AuditLog[]>(`/tasks/${id ?? ''}/tarix`).then((res) => res.data),
    enabled: Boolean(id),
    retry: false,
  })
}
