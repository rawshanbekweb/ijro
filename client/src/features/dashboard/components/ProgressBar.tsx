interface ProgressBarProps {
  done: number
  total: number
}

export default function ProgressBar({ done, total }: ProgressBarProps) {
  if (total === 0) {
    return null
  }

  const percent = Math.round((done / total) * 100)

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full max-w-[140px] overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-blue transition-[width]" style={{ width: `${percent}%` }} />
      </div>
      <span className="shrink-0 text-sm text-muted">{percent}%</span>
    </div>
  )
}
