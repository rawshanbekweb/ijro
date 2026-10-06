import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../../../api/axios-instance'
import { taskQueryKey } from '../../queryKeys'
import type { Task } from '../../types'

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: taskQueryKey(id ?? ''),
    queryFn: () => axiosInstance.get<Task>(`/tasks/${id ?? ''}`).then((res) => res.data),
    enabled: Boolean(id),
    // 403/404 are permanent for this id — retrying just delays the error state.
    retry: false,
  })
}
