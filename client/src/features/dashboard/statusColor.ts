import type { TaskStatusColor } from './types'

interface StatusColorClasses {
  border: string
  text: string
  bg: string
  dot: string
}

const statusColorMap: Record<TaskStatusColor, StatusColorClasses> = {
  YASHIL: { border: 'border-green', text: 'text-green', bg: 'bg-green/10', dot: 'bg-green' },
  SARIQ: { border: 'border-amber', text: 'text-amber', bg: 'bg-amber/10', dot: 'bg-amber' },
  QIZIL: { border: 'border-red', text: 'text-red', bg: 'bg-red/10', dot: 'bg-red' },
  KOK: { border: 'border-blue', text: 'text-blue', bg: 'bg-blue/10', dot: 'bg-blue' },
  KULRANG: { border: 'border-muted', text: 'text-muted', bg: 'bg-muted/10', dot: 'bg-muted' },
}

export function getStatusColorClasses(color: TaskStatusColor): StatusColorClasses {
  return statusColorMap[color]
}

const statusLabelKeyMap: Record<TaskStatusColor, string> = {
  YASHIL: 'dashboard.status.YASHIL',
  SARIQ: 'dashboard.status.SARIQ',
  QIZIL: 'dashboard.status.QIZIL',
  KOK: 'dashboard.status.KOK',
  KULRANG: 'dashboard.status.KULRANG',
}

/** Returns an i18n key — pass it through `t()` at the call site to get the label. */
export function getStatusColorLabelKey(color: TaskStatusColor): string {
  return statusLabelKeyMap[color]
}
