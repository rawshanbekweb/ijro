import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import { taskHistoryQueryKey, taskQueryKey } from '../../tasks/queryKeys'

export function useApproveTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => axiosInstance.post(`/tasks/${id}/tasdiqlash`),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      // Keep the task detail page in sync when approving from there.
      void queryClient.invalidateQueries({ queryKey: taskQueryKey(id) })
      void queryClient.invalidateQueries({ queryKey: taskHistoryQueryKey(id) })
    },
  })
}
