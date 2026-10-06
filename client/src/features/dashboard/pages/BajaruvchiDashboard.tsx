import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/auth.store'
import { useTasks } from '../hooks/queries/useTasks'
import TaskGroup from '../components/TaskGroup'
import PerformanceBanner from '../components/PerformanceBanner'
import { TERMINAL_STATUSES } from '../stats'
import { getGivenName } from '../../tasks/format'

export default function BajaruvchiDashboard() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const { data: tasks, isLoading, isError } = useTasks()

  const list = tasks ?? []
  // Accepted/cancelled tasks are done; everything else is open for the bajaruvchi.
  const openTasks = list.filter((task) => !TERMINAL_STATUSES.has(task.status))
  const pendingApproval = openTasks.filter((task) => task.status === 'TASDIQ_KUTILMOQDA')
  // Tasks awaiting approval are listed in their own group only, so each open
  // task shows up exactly once on the page.
  const inWork = openTasks.filter((task) => task.status !== 'TASDIQ_KUTILMOQDA')
  const needsAttention = inWork.filter(
    (task) => task.hisoblanganStatus === 'QIZIL' || task.hisoblanganStatus === 'SARIQ',
  )
  // YASHIL (not yet acknowledged) and KOK (acknowledged, in progress) both have time left.
  const onTrack = inWork.filter(
    (task) => task.hisoblanganStatus === 'YASHIL' || task.hisoblanganStatus === 'KOK',
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">
        {t('dashboard.greeting', { name: getGivenName(user?.ismFamiliya) })}
      </h1>
      <p className="mt-1 text-base text-muted">
        {t('dashboard.openTasksCount', { count: openTasks.length })}
      </p>

      {isError && (
        <div className="mt-4 rounded-lg bg-red/10 px-4 py-3 text-base text-red">
          {t('dashboard.loadError')}
        </div>
      )}

      <div className="mt-6 space-y-6">
        <TaskGroup
          title={t('dashboard.needsAttention')}
          tasks={needsAttention}
          isLoading={isLoading}
          emptyMessage={t('dashboard.needsAttentionEmpty')}
        />
        <TaskGroup
          title={t('dashboard.onTrack')}
          tasks={onTrack}
          isLoading={isLoading}
          emptyMessage={t('dashboard.onTrackEmpty')}
        />
        <TaskGroup
          title={t('dashboard.pendingApproval')}
          tasks={pendingApproval}
          isLoading={isLoading}
          emptyMessage={t('dashboard.pendingApprovalEmpty')}
        />
      </div>

      <PerformanceBanner tasks={list} />
    </div>
  )
}
