import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../../../api/axios-instance'
import type { Role } from '../../../../store/auth.store'
import type { User } from '../../types'

export interface UserFilters {
  sohaId?: string
  rol?: Role
}

interface UseUsersOptions {
  enabled?: boolean
}

/**
 * `GET /users` (SUPERADMIN only). `sohaId` and `rol` are combined with AND
 * server-side. Each user comes back with `faolTopshiriqlarSoni`.
 *
 * Shared between the sohalar admin page and the reusable
 * `SohaBajaruvchiSelect` component — keep it as the single call site for this
 * endpoint.
 */
export function useUsers(filters: UserFilters = {}, options: UseUsersOptions = {}) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () =>
      axiosInstance.get<User[]>('/users', { params: filters }).then((res) => res.data),
    enabled: options.enabled ?? true,
  })
}
