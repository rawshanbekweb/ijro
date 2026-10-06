import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Skeleton from '../../dashboard/components/Skeleton'
import type { Soha } from '../types'

interface SohaGridProps {
  sohalar: Soha[]
  /** Employee count per soha id, derived once from the full user list. */
  xodimSoniBySohaId: Record<string, number>
  selectedSohaId: string | null
  onSelect: (sohaId: string) => void
  isLoading: boolean
}

export default function SohaGrid({
  sohalar,
  xodimSoniBySohaId,
  selectedSohaId,
  onSelect,
  isLoading,
}: SohaGridProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) {
      return sohalar
    }
    return sohalar.filter(
      (soha) =>
        soha.nomi.toLowerCase().includes(needle) || soha.kodi.toLowerCase().includes(needle),
    )
  }, [sohalar, search])

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('sohalar.grid.searchPlaceholder')}
          className="w-full rounded-lg border border-muted/30 py-2.5 pl-9 pr-3 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          {sohalar.length === 0 ? t('sohalar.grid.empty') : t('sohalar.grid.notFound')}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((soha) => {
            const xodimSoni = xodimSoniBySohaId[soha.id] ?? 0
            const isSelected = soha.id === selectedSohaId

            return (
              <button
                key={soha.id}
                type="button"
                onClick={() => onSelect(soha.id)}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-blue bg-blue/5'
                    : 'border-muted/20 hover:border-blue/40 hover:bg-blue/5'
                }`}
              >
                <p className="truncate text-sm font-semibold text-ink">{soha.nomi}</p>
                <p className="mt-0.5 text-xs text-muted">{soha.kodi}</p>
                <p
                  className={`mt-3 text-xs font-medium ${
                    xodimSoni === 0 ? 'text-red' : 'text-muted'
                  }`}
                >
                  {t('sohalar.grid.xodimCount', { count: xodimSoni })}
                </p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
