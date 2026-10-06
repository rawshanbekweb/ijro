import { ClipboardList, Eye, ListChecks } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTasks } from '../hooks/queries/useTasks'
import { useAuthStore } from '../../../store/auth.store'
import StatCard from '../components/StatCard'
import Skeleton from '../components/Skeleton'
import DelegationSummaryCard from './DelegationSummaryCard'
import SupervisedOverdueList from './SupervisedOverdueList'
import MyIssuedTaskList from './MyIssuedTaskList'

export default function NazoratDashboard() {
  const { t } = useTranslation()
  const userId = useAuthStore((state) => state.user?.id)
  const { data: tasks, isLoading, isError } = useTasks()

  const list = tasks ?? []
  const kuzatuvda = list.filter(
    (task) => task.yaratuvchiId === userId && task.muallifId !== userId,
  )
  const tekshiruvKutmoqda = list.filter(
    (task) => task.yaratuvchiId === userId && task.status === 'TASDIQ_KUTILMOQDA',
  )
  const menBergan = list.filter((task) => task.yaratuvchiId === userId)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-ink">{t('nazorat.dashboard.title')}</h1>

      {isError && (
        <div className="mb-6 rounded-lg bg-red/10 px-4 py-3 text-base text-red">
          {t('dashboard.loadError')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <StatCard
              label={t('nazorat.stats.kuzatuvda')}
              value={kuzatuvda.length}
              icon={Eye}
              accent="blue"
            />
            <StatCard
              label={t('nazorat.stats.tekshiruvKutmoqda')}
              value={tekshiruvKutmoqda.length}
              icon={ClipboardList}
              accent="amber"
            />
            <StatCard
              label={t('nazorat.stats.menBergan')}
              value={menBergan.length}
              icon={ListChecks}
              accent="green"
            />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MyIssuedTaskList />
          <SupervisedOverdueList />
        </div>
        <div>
          <DelegationSummaryCard />
        </div>
      </div>
    </div>
  )
}
