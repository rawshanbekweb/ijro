import { useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../../api/axios-instance'
import { taskHistoryQueryKey, taskQueryKey } from '../queryKeys'
import type { Subtask, Task } from '../types'

interface ToggleSubtaskVars {
  subId: string
  bajarildi: boolean
}

interface ToggleSubtaskContext {
  previousTask: Task | undefined
}

/**
 * Toggling a checklist item should feel instant, so the cached task is patched
 * optimistically and rolled back if the request fails.
 */
export function useToggleSubtask(taskId: string) {
  const queryClient = useQueryClient()
  const queryKey = taskQueryKey(taskId)

  return useMutation<Subtask, unknown, ToggleSubtaskVars, ToggleSubtaskContext>({
    mutationFn: ({ subId, bajarildi }) =>
      axiosInstance
        .patch<Subtask>(`/tasks/${taskId}/subtasks/${subId}`, { bajarildi })
        .then((res) => res.data),

    onMutate: async ({ subId, bajarildi }) => {
      await queryClient.cancelQueries({ queryKey })
      const previousTask = queryClient.getQueryData<Task>(queryKey)

      if (previousTask) {
        queryClient.setQueryData<Task>(queryKey, {
          ...previousTask,
          subtasklar: previousTask.subtasklar.map((subtask) =>
            subtask.id === subId ? { ...subtask, bajarildi } : subtask,
          ),
        })
      }

      return { previousTask }
    },

    onError: (_error, _vars, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(queryKey, context.previousTask)
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
      void queryClient.invalidateQueries({ queryKey: taskHistoryQueryKey(taskId) })
    },
  })
}
