import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../../../api/axios-instance'
import type { Delegation } from '../../types'

export const delegationQueryKey = (nazoratId: string) => ['delegation', nazoratId] as const

interface UseDelegationOptions {
  enabled?: boolean
}

/**
 * `GET /delegation/:nazoratId` — current FAOL delegation for a NAZORAT user.
 * SUPERADMIN may query any `nazoratId`; a NAZORAT may only query their own.
 */
export function useDelegation(nazoratId: string | undefined, options: UseDelegationOptions = {}) {
  return useQuery({
    queryKey: delegationQueryKey(nazoratId ?? ''),
    queryFn: () =>
      axiosInstance.get<Delegation>(`/delegation/${nazoratId ?? ''}`).then((res) => res.data),
    enabled: Boolean(nazoratId) && (options.enabled ?? true),
    // A missing FAOL delegation is a permanent 404 for this id right now — no point retrying.
    retry: false,
  })
}
