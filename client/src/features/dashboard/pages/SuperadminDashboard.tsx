import { CheckCircle2, Clock, TrendingUp, TriangleAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTasks } from '../hooks/queries/useTasks'
import StatCard from '../components/StatCard'
import Skeleton from '../components/Skeleton'
import PendingApprovalList from '../components/PendingApprovalList'
import OverdueList from '../components/OverdueList'
import SohaRatingTable from '../components/SohaRatingTable'
import { TERMINAL_STATUSES, formatPercent, onTimeCompletionPercent } from '../stats'

function isToday(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default function SuperadminDashboard() {
  const { t } = useTranslation()
  const { data: tasks, isLoading, isError } = useTasks()

  const list = tasks ?? []
  const pendingApproval = list.filter((task) => task.status === 'TASDIQ_KUTILMOQDA')
  // Accepted-late tasks are also QIZIL, but there is nothing left to chase on them.
  const open = list.filter((task) => !TERMINAL_STATUSES.has(task.status))
  const overdue = open.filter((task) => task.hisoblanganStatus === 'QIZIL')
  const dueToday = open.filter((task) => isToday(task.muddat))
  const onTimeCompletion = formatPercent(onTimeCompletionPercent(list))

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">{t('dashboard.title')}</h1>

      {isError && (
        <div className="mb-6 rounded-lg bg-red/10 px-4 py-3 text-base text-red">
          {t('dashboard.loadError')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <StatCard
              label={t('dashboard.stats.pendingApproval')}
              value={pendingApproval.length}
              icon={Clock}
              accent="blue"
            />
            <StatCard
              label={t('dashboard.stats.overdue')}
              value={overdue.length}
              icon={TriangleAlert}
              accent="red"
            />
            <StatCard
              label={t('dashboard.stats.dueToday')}
              value={dueToday.length}
              icon={CheckCircle2}
              accent="amber"
            />
            <StatCard
              label={t('dashboard.stats.onTimeCompletion')}
              value={onTimeCompletion}
              icon={TrendingUp}
              accent="green"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PendingApprovalList tasks={pendingApproval} isLoading={isLoading} />
          <OverdueList tasks={overdue} isLoading={isLoading} />
        </div>
        <div>
          <SohaRatingTable />
        </div>
      </div>
    </div>
  )
}
