import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import type { User, UserPayload } from '../types'

interface UpdateUserVariables {
  id: string
  payload: Partial<UserPayload>
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateUserVariables) =>
      axiosInstance.patch<User>(`/users/${id}`, payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['sohalar'] })
    },
  })
}
