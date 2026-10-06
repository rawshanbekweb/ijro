import { useTranslation } from 'react-i18next'
import { useToggleSubtask } from '../hooks/useToggleSubtask'
import type { Task } from '../types'

interface SubtaskChecklistProps {
  task: Task
  /** Only the assigned bajaruvchi may tick items (enforced by the backend too). */
  canEdit: boolean
}

export default function SubtaskChecklist({ task, canEdit }: SubtaskChecklistProps) {
  const { t } = useTranslation()
  const toggleSubtask = useToggleSubtask(task.id)

  const subtasks = [...task.subtasklar].sort((a, b) => a.tartib - b.tartib)
  const total = subtasks.length
  const done = subtasks.filter((subtask) => subtask.bajarildi).length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{t('tasks.subtasks.title')}</h2>
        <span className="text-xs font-medium text-muted">
          {done}/{total}
        </span>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-blue transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>

      {total === 0 ? (
        <p className="py-4 text-center text-sm text-muted">{t('tasks.subtasks.empty')}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {subtasks.map((subtask) => (
            <li key={subtask.id}>
              <label
                className={`flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm ${
                  canEdit ? 'cursor-pointer hover:bg-ink/5' : 'cursor-default'
                }`}
              >
                <input
                  type="checkbox"
                  checked={subtask.bajarildi}
                  disabled={!canEdit || toggleSubtask.isPending}
                  onChange={(event) =>
                    toggleSubtask.mutate({ subId: subtask.id, bajarildi: event.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 shrink-0 accent-blue disabled:cursor-not-allowed"
                />
                <span className={subtask.bajarildi ? 'text-muted line-through' : 'text-ink'}>
                  {subtask.matn}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}

      {toggleSubtask.isError && (
        <p className="mt-2 text-xs text-red">{t('tasks.subtasks.updateError')}</p>
      )}
    </div>
  )
}
