import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import { taskHistoryQueryKey, taskQueryKey } from '../../tasks/queryKeys'

interface RejectTaskPayload {
  id: string
  sabab: string
}

export function useRejectTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, sabab }: RejectTaskPayload) =>
      axiosInstance.post(`/tasks/${id}/qaytarish`, { sabab }),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
      // Keep the task detail page in sync when rejecting from there.
      void queryClient.invalidateQueries({ queryKey: taskQueryKey(id) })
      void queryClient.invalidateQueries({ queryKey: taskHistoryQueryKey(id) })
    },
  })
}
