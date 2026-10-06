import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../../../api/axios-instance'
import type { Soha } from '../../types'

export function useSohalar() {
  return useQuery({
    queryKey: ['sohalar'],
    queryFn: () => axiosInstance.get<Soha[]>('/sohalar').then((res) => res.data),
  })
}
