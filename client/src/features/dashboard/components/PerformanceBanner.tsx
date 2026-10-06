import { useTranslation } from 'react-i18next'
import type { Task } from '../types'
import { formatPercent, isInCurrentMonth, onTimeCompletionPercent } from '../stats'

interface PerformanceBannerProps {
  tasks: Task[]
}

/**
 * On-time completion rate for tasks whose deadline falls in the current month.
 * Hidden until at least one such task has been accepted.
 */
export default function PerformanceBanner({ tasks }: PerformanceBannerProps) {
  const { t } = useTranslation()
  const value = onTimeCompletionPercent(tasks.filter((task) => isInCurrentMonth(task.muddat)))

  if (value === null) {
    return null
  }

  return (
    <div className="mt-6 rounded-xl bg-blue/10 p-5 text-base font-medium text-blue">
      {t('dashboard.performanceBanner', { percent: formatPercent(value) })}
    </div>
  )
}
