import { useQuery } from '@tanstack/react-query'
import axiosInstance from '../../../../api/axios-instance'
import type { Task, TaskMuhimlik, TaskStatus } from '../../types'

export interface TaskFilters {
  status?: TaskStatus
  muhimlik?: TaskMuhimlik
  sohaId?: string
  bajaruvchiId?: string
}

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => axiosInstance.get<Task[]>('/tasks', { params: filters }).then((res) => res.data),
  })
}
