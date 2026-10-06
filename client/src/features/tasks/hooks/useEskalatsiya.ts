import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import { taskHistoryQueryKey, taskQueryKey } from '../queryKeys'
import type { Task } from '../types'

interface EskalatsiyaPayload {
  id: string
  izoh: string
}

/** `POST /tasks/:id/eskalatsiya` (NAZORAT only). */
export function useEskalatsiya() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, izoh }: EskalatsiyaPayload) =>
      axiosInstance.post<Task>(`/tasks/${id}/eskalatsiya`, { izoh }).then((res) => res.data),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      void queryClient.invalidateQueries({ queryKey: taskQueryKey(id) })
      void queryClient.invalidateQueries({ queryKey: taskHistoryQueryKey(id) })
    },
  })
}
