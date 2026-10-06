import { useTranslation } from 'react-i18next'
import type { TaskStatusColor } from '../types'
import { getStatusColorClasses, getStatusColorLabelKey } from '../statusColor'

interface StatusBadgeProps {
  color: TaskStatusColor
  label?: string
}

export default function StatusBadge({ color, label }: StatusBadgeProps) {
  const { t } = useTranslation()
  const classes = getStatusColorClasses(color)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${classes.bg} ${classes.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${classes.dot}`} />
      {label ?? t(getStatusColorLabelKey(color))}
    </span>
  )
}
