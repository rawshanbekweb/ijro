import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import { taskHistoryQueryKey, taskQueryKey } from '../queryKeys'
import type { Task } from '../types'

export function useMarkDone(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      axiosInstance.post<Task>(`/tasks/${taskId}/bajarildi`).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskQueryKey(taskId) })
      void queryClient.invalidateQueries({ queryKey: taskHistoryQueryKey(taskId) })
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
