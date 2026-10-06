import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTasks } from '../hooks/queries/useTasks'
import { useSohalar } from '../../sohalar/hooks/queries/useSohalar'
import { buildSohaRatings, formatPercent } from '../stats'
import Skeleton from './Skeleton'

function ratingColor(reyting: number | null): string {
  if (reyting === null) return 'text-muted'
  if (reyting >= 80) return 'text-green'
  if (reyting >= 60) return 'text-amber'
  return 'text-red'
}

export default function SohaRatingTable() {
  const { t } = useTranslation()
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: sohalar, isLoading: sohalarLoading } = useSohalar()

  const rows = useMemo(() => buildSohaRatings(tasks ?? [], sohalar ?? []), [tasks, sohalar])
  const isLoading = tasksLoading || sohalarLoading

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-base font-semibold text-ink">{t('dashboard.sohaRating.title')}</h2>

      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <p className="py-4 text-center text-base text-muted">{t('dashboard.sohaRating.empty')}</p>
      )}

      {!isLoading && rows.length > 0 && (
        <ul className="divide-y divide-ink/10">
          {rows.map((row) => (
            <li key={row.sohaId} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-base font-medium text-ink">{row.nomi}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {t('dashboard.sohaRating.bajarilganCount', { count: row.bajarilgan })} ·{' '}
                  {t('dashboard.sohaRating.kechiktirilganCount', { count: row.kechiktirilgan })}
                </p>
              </div>
              <span className={`shrink-0 text-lg font-semibold ${ratingColor(row.reyting)}`}>
                {formatPercent(row.reyting)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
