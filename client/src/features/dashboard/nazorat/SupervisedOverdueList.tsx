import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOverdueSupervised } from '../hooks/queries/useOverdueSupervised'
import Skeleton from '../components/Skeleton'
import EskalatsiyaModal from '../../tasks/detail/EskalatsiyaModal'
import { getUserDisplayName } from '../../tasks/format'

export default function SupervisedOverdueList() {
  const { t } = useTranslation()
  const { data: tasks, isLoading } = useOverdueSupervised()
  const [eskalatsiyaTaskId, setEskalatsiyaTaskId] = useState<string | null>(null)

  const list = tasks ?? []

  const handleRemind = (taskId: string) => {
    // TODO: backend endpoint for sending a reminder notification doesn't exist yet — wire this up once available.
    console.log('Eslatma yuborildi:', taskId)
  }

  return (
    <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-ink">
        {t('nazorat.supervisedOverdueList.title')}
      </h2>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <p className="py-4 text-center text-base text-muted">
          {t('nazorat.supervisedOverdueList.empty')}
        </p>
      )}

      {!isLoading && list.length > 0 && (
        <ul className="divide-y divide-ink/10">
          {list.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="truncate text-base font-medium text-ink">{task.sarlavha}</div>
                <div className="mt-0.5 truncate text-sm text-muted">
                  {task.soha?.nomi ?? '—'} · {getUserDisplayName(task.bajaruvchi, task.bajaruvchiId)}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleRemind(task.id)}
                  className="rounded-lg border border-amber px-4 py-2 text-sm font-semibold text-amber hover:bg-amber/10"
                >
                  {t('nazorat.supervisedOverdueList.remind')}
                </button>
                <button
                  type="button"
                  onClick={() => setEskalatsiyaTaskId(task.id)}
                  className="rounded-lg border border-purple px-4 py-2 text-sm font-semibold text-purple hover:bg-purple/10"
                >
                  {t('nazorat.supervisedOverdueList.escalate')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {eskalatsiyaTaskId && (
        <EskalatsiyaModal taskId={eskalatsiyaTaskId} onClose={() => setEskalatsiyaTaskId(null)} />
      )}
    </div>
  )
}
