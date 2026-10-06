import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../../store/auth.store'
import { useTasks } from '../../dashboard/hooks/queries/useTasks'
import type { TaskFilters } from '../../dashboard/hooks/queries/useTasks'
import type { TaskMuhimlik, TaskStatus } from '../../dashboard/types'
import TaskGroup from '../../dashboard/components/TaskGroup'
import Combobox from '../../../components/shared/Combobox'
import type { ComboboxOption } from '../../../components/shared/Combobox'
import { useSohalar } from '../../sohalar/hooks/queries/useSohalar'
import { useUsers } from '../../sohalar/hooks/queries/useUsers'

const STATUSES: TaskStatus[] = [
  'YARATILDI',
  'YUBORILDI',
  'TANISHILDI',
  'JARAYONDA',
  'TASDIQ_KUTILMOQDA',
  'QAYTARILDI',
  'QABUL_QILINDI',
  'BEKOR_QILINDI',
]

const MUHIMLIKLAR: TaskMuhimlik[] = ['ODDIY', 'MUHIM', 'SHOSHILINCH']

interface LocalFilters {
  status: string
  muhimlik: string
  sohaId: string
  bajaruvchiId: string
}

const EMPTY_FILTERS: LocalFilters = {
  status: '',
  muhimlik: '',
  sohaId: '',
  bajaruvchiId: '',
}

export default function TasksPage() {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const isSuperadmin = user?.rol === 'SUPERADMIN'
  const canCreateTask = user?.rol === 'SUPERADMIN' || user?.rol === 'NAZORAT'

  const [filters, setFilters] = useState<LocalFilters>(EMPTY_FILTERS)

  const { data: sohalar, isLoading: isSohalarLoading } = useSohalar()
  const { data: bajaruvchilar, isLoading: isBajaruvchilarLoading } = useUsers(
    { sohaId: filters.sohaId, rol: 'BAJARUVCHI' },
    { enabled: isSuperadmin && Boolean(filters.sohaId) },
  )

  const statusOptions = useMemo<ComboboxOption[]>(
    () => STATUSES.map((value) => ({ value, label: t(`tasks.status.${value}`) })),
    [t],
  )

  const muhimlikOptions = useMemo<ComboboxOption[]>(
    () => MUHIMLIKLAR.map((value) => ({ value, label: t(`tasks.muhimlik.${value}`) })),
    [t],
  )

  const sohaOptions = useMemo<ComboboxOption[]>(
    () =>
      (sohalar ?? []).map((soha) => ({
        value: soha.id,
        label: soha.nomi,
        keywords: soha.kodi,
        hint: <span className="shrink-0 text-xs text-muted">{soha.kodi}</span>,
      })),
    [sohalar],
  )

  const bajaruvchiOptions = useMemo<ComboboxOption[]>(
    () =>
      (bajaruvchilar ?? []).map((bajaruvchi) => ({
        value: bajaruvchi.id,
        label: bajaruvchi.ismFamiliya,
        keywords: bajaruvchi.lavozim ?? '',
      })),
    [bajaruvchilar],
  )

  const appliedFilters = useMemo<TaskFilters>(() => {
    const result: TaskFilters = {}
    if (filters.status) {
      result.status = filters.status as TaskStatus
    }
    if (filters.muhimlik) {
      result.muhimlik = filters.muhimlik as TaskMuhimlik
    }
    if (isSuperadmin) {
      if (filters.sohaId) {
        result.sohaId = filters.sohaId
      }
      if (filters.bajaruvchiId) {
        result.bajaruvchiId = filters.bajaruvchiId
      }
    }
    return result
  }, [filters, isSuperadmin])

  const { data: tasks, isLoading } = useTasks(appliedFilters)

  const hasActiveFilters =
    filters.status !== '' ||
    filters.muhimlik !== '' ||
    filters.sohaId !== '' ||
    filters.bajaruvchiId !== ''

  const handleSohaChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sohaId: value, bajaruvchiId: '' }))
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-ink">{t('tasks.list.title')}</h1>
        {canCreateTask && (
          <Link
            to="/tasks/yangi"
            className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-deep"
          >
            <Plus size={18} />
            {t('layout.nav.newTask')}
          </Link>
        )}
      </div>

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">{t('tasks.list.filters')}</h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setFilters(EMPTY_FILTERS)}
              className="text-sm font-medium text-blue hover:underline"
            >
              {t('tasks.list.clear')}
            </button>
          )}
        </div>

        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
            isSuperadmin ? 'lg:grid-cols-4' : 'lg:grid-cols-2'
          }`}
        >
          <div>
            <label htmlFor="status-filter" className="mb-1.5 block text-sm font-medium text-ink">
              {t('tasks.list.statusLabel')}
            </label>
            <Combobox
              id="status-filter"
              options={statusOptions}
              value={filters.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              placeholder={t('tasks.list.allStatuses')}
              emptyText={t('tasks.list.statusEmpty')}
            />
          </div>

          <div>
            <label
              htmlFor="muhimlik-filter"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              {t('tasks.list.muhimlikLabel')}
            </label>
            <Combobox
              id="muhimlik-filter"
              options={muhimlikOptions}
              value={filters.muhimlik}
              onChange={(value) => setFilters((prev) => ({ ...prev, muhimlik: value }))}
              placeholder={t('tasks.list.allMuhimlik')}
              emptyText={t('tasks.list.muhimlikEmpty')}
            />
          </div>

          {isSuperadmin && (
            <>
              <div>
                <label
                  htmlFor="soha-filter"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  {t('tasks.list.sohaLabel')}
                </label>
                <Combobox
                  id="soha-filter"
                  options={sohaOptions}
                  value={filters.sohaId}
                  onChange={handleSohaChange}
                  placeholder={t('tasks.list.allSohalar')}
                  isLoading={isSohalarLoading}
                  emptyText={t('tasks.select.sohaEmpty')}
                />
              </div>

              <div>
                <label
                  htmlFor="bajaruvchi-filter"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  {t('tasks.list.bajaruvchiLabel')}
                </label>
                <Combobox
                  id="bajaruvchi-filter"
                  options={bajaruvchiOptions}
                  value={filters.bajaruvchiId}
                  onChange={(value) => setFilters((prev) => ({ ...prev, bajaruvchiId: value }))}
                  placeholder={
                    filters.sohaId ? t('tasks.list.selectXodim') : t('tasks.list.selectSohaFirst')
                  }
                  disabled={!filters.sohaId}
                  isLoading={isBajaruvchilarLoading}
                  emptyText={t('tasks.select.noBajaruvchi')}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <TaskGroup
        title={t('tasks.list.allTasks')}
        tasks={tasks ?? []}
        isLoading={isLoading}
        emptyMessage={t('tasks.list.empty')}
      />
    </div>
  )
}
