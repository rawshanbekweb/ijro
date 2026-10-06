import { useTranslation } from 'react-i18next'
import type { UserHolat } from '../types'

interface UserHolatBadgeProps {
  holat: UserHolat
}

const holatStyles: Record<UserHolat, { bg: string; text: string; dot: string }> = {
  FAOL: { bg: 'bg-green/10', text: 'text-green', dot: 'bg-green' },
  NOFAOL: { bg: 'bg-muted/10', text: 'text-muted', dot: 'bg-muted' },
}

/**
 * Employee-status pill. Mirrors the markup of the task-specific `StatusBadge`
 * in `features/dashboard`, but keyed on `UserHolat` instead of task colors.
 */
export default function UserHolatBadge({ holat }: UserHolatBadgeProps) {
  const { t } = useTranslation()
  const style = holatStyles[holat]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {t(`sohalar.holat.${holat}`)}
    </span>
  )
}
