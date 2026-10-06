import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import type { User, UserPayload } from '../types'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UserPayload) =>
      axiosInstance.post<User>('/users', payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      // Per-soha employee counts are derived from the user list, so the
      // sohalar view has to refresh too.
      void queryClient.invalidateQueries({ queryKey: ['sohalar'] })
    },
  })
}
