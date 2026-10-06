import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import { delegationQueryKey } from './queries/useDelegation'
import type { CreateDelegationPayload, Delegation } from '../types'

/**
 * `POST /delegation` (SUPERADMIN only). Creating a delegation auto-cancels
 * any prior FAOL delegation for the same `nazoratId` server-side, so it's
 * enough to invalidate that nazoratId's delegation query on success.
 */
export function useCreateDelegation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateDelegationPayload) =>
      axiosInstance.post<Delegation>('/delegation', payload).then((res) => res.data),
    onSuccess: (_data, payload) => {
      void queryClient.invalidateQueries({ queryKey: delegationQueryKey(payload.nazoratId) })
    },
  })
}
