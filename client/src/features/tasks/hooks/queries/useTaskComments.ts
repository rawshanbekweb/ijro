import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../../../api/axios-instance'
import { taskCommentsQueryKey } from '../../queryKeys'
import type { Comment } from '../../types'

export function useTaskComments(id: string | undefined) {
  return useQuery({
    queryKey: taskCommentsQueryKey(id ?? ''),
    queryFn: () =>
      axiosInstance.get<Comment[]>(`/tasks/${id ?? ''}/izohlar`).then((res) => res.data),
    enabled: Boolean(id),
    retry: false,
  })
}
