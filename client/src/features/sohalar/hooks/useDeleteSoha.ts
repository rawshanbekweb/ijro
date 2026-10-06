import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'

/**
 * `DELETE /sohalar/:id` is rejected with a 409 when the soha still has active
 * (`FAOL`) employees — callers should surface `error` from this mutation to
 * the user rather than swallowing it (see `getApiErrorMessage`).
 */
export function useDeleteSoha() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/sohalar/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sohalar'] })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
