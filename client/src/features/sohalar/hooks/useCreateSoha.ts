import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import type { Soha, SohaPayload } from '../types'

export function useCreateSoha() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SohaPayload) =>
      axiosInstance.post<Soha>('/sohalar', payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sohalar'] })
    },
  })
}
