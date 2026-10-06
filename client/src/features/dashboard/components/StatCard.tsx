import type { LucideIcon } from 'lucide-react'

type StatCardAccent = 'blue' | 'red' | 'amber' | 'green'

const accentBorderClass: Record<StatCardAccent, string> = {
  blue: 'border-blue',
  red: 'border-red',
  amber: 'border-amber',
  green: 'border-green',
}

const accentTextClass: Record<StatCardAccent, string> = {
  blue: 'text-blue',
  red: 'text-red',
  amber: 'text-amber',
  green: 'text-green',
}

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent: StatCardAccent
}

export default function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border-l-4 bg-white p-5 shadow-sm ${accentBorderClass[accent]}`}
    >
      <div>
        <div className="text-sm font-medium text-muted">{label}</div>
        <div className="mt-1 text-3xl font-bold text-ink">{value}</div>
      </div>
      <Icon size={32} className={accentTextClass[accent]} />
    </div>
  )
}
