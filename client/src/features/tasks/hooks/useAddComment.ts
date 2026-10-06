import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import { taskCommentsQueryKey } from '../queryKeys'
import type { Comment } from '../types'

export function useAddComment(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (matn: string) =>
      axiosInstance.post<Comment>(`/tasks/${taskId}/izohlar`, { matn }).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskCommentsQueryKey(taskId) })
    },
  })
}
