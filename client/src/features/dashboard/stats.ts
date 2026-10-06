import type { Task } from './types'

/**
 * Dashboard metrics derived client-side from `GET /tasks`, which returns every
 * task the caller may see (all of them for SUPERADMIN, own ones for
 * BAJARUVCHI). "On time" follows the backend's `hisoblanganStatus`: a
 * QABUL_QILINDI task is YASHIL when it was handled before its deadline and
 * QIZIL otherwise.
 */

export const TERMINAL_STATUSES: ReadonlySet<Task['status']> = new Set([
  'QABUL_QILINDI',
  'BEKOR_QILINDI',
])

function percent(part: number, total: number): number | null {
  return total === 0 ? null : Math.round((part / total) * 100)
}

/** Share of accepted tasks completed on time, or `null` when none are accepted yet. */
export function onTimeCompletionPercent(tasks: Task[]): number | null {
  const accepted = tasks.filter((task) => task.status === 'QABUL_QILINDI')
  const onTime = accepted.filter((task) => task.hisoblanganStatus === 'YASHIL')
  return percent(onTime.length, accepted.length)
}

/** Whether `dateString` falls in the same calendar month as `now`. */
export function isInCurrentMonth(dateString: string, now: Date = new Date()): boolean {
  const date = new Date(dateString)
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}

export interface SohaRatingRow {
  sohaId: string
  nomi: string
  /** Accepted (QABUL_QILINDI) tasks. */
  bajarilgan: number
  /** Overdue open tasks plus tasks accepted after their deadline. */
  kechiktirilgan: number
  /** Share of non-cancelled tasks that are not late; `null` when the soha has none. */
  reyting: number | null
}

export function buildSohaRatings(
  tasks: Task[],
  sohalar: { id: string; nomi: string }[],
): SohaRatingRow[] {
  const rows = sohalar.map<SohaRatingRow>((soha) => {
    const sohaTasks = tasks.filter(
      (task) => task.sohaId === soha.id && task.status !== 'BEKOR_QILINDI',
    )
    const bajarilgan = sohaTasks.filter((task) => task.status === 'QABUL_QILINDI').length
    const kechiktirilgan = sohaTasks.filter((task) => task.hisoblanganStatus === 'QIZIL').length

    return {
      sohaId: soha.id,
      nomi: soha.nomi,
      bajarilgan,
      kechiktirilgan,
      reyting: percent(sohaTasks.length - kechiktirilgan, sohaTasks.length),
    }
  })

  // Best first; sohas without any tasks go last.
  return rows.sort((a, b) => (b.reyting ?? -1) - (a.reyting ?? -1))
}

export function formatPercent(value: number | null): string {
  return value === null ? '—' : `${value}%`
}
