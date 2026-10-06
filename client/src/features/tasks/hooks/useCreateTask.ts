import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import type { Task, TaskMuhimlik } from '../types'

export interface CreateTaskPayload {
  sarlavha: string
  tavsif?: string
  sohaId: string
  bajaruvchiId: string
  /** ISO datetime string combining `muddatSana` + `muddatVaqt`. */
  muddat: string
  muhimlik: TaskMuhimlik
  subtasklar?: string[]
}

interface CreateTaskRequestBody extends Omit<CreateTaskPayload, 'subtasklar'> {
  subtasklar?: { matn: string; tartib: number }[]
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ subtasklar, ...rest }: CreateTaskPayload) => {
      const body: CreateTaskRequestBody = {
        ...rest,
        subtasklar: subtasklar?.map((matn, index) => ({ matn, tartib: index })),
      }
      return axiosInstance.post<Task>('/tasks', body).then((res) => res.data)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
