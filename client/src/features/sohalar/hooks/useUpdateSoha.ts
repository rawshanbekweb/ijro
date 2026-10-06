import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import type { Soha, SohaPayload } from '../types'

interface UpdateSohaVariables {
  id: string
  payload: Partial<SohaPayload>
}

export function useUpdateSoha() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: UpdateSohaVariables) =>
      axiosInstance.patch<Soha>(`/sohalar/${id}`, payload).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['sohalar'] })
    },
  })
}
