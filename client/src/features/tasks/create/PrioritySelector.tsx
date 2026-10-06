import { Controller } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Lock } from 'lucide-react'
import type { TaskMuhimlik } from '../types'

interface PrioritySelectorProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  /**
   * Options that are shown but not selectable — e.g. a NAZORAT's delegation
   * caps them below SHOSHILINCH. Rendered with a lock icon + tooltip.
   */
  disabledOptions?: TaskMuhimlik[]
}

const OPTIONS: { value: TaskMuhimlik; selectedClass: string }[] = [
  { value: 'ODDIY', selectedClass: 'bg-muted text-white' },
  { value: 'MUHIM', selectedClass: 'bg-amber text-white' },
  { value: 'SHOSHILINCH', selectedClass: 'bg-red text-white' },
]

export default function PrioritySelector<T extends FieldValues>({
  control,
  name,
  disabledOptions = [],
}: PrioritySelectorProps<T>) {
  const { t } = useTranslation()
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{t('tasks.create.muhimlik')}</span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <div className="flex gap-2">
            {OPTIONS.map((option) => {
              const isSelected = field.value === option.value
              const isDisabled = disabledOptions.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={isDisabled}
                  title={isDisabled ? t('nazorat.shoshilinchLocked') : undefined}
                  onClick={() => !isDisabled && field.onChange(option.value)}
                  className={
                    isDisabled
                      ? 'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-muted/50 cursor-not-allowed'
                      : isSelected
                        ? `flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold ${option.selectedClass}`
                        : 'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-muted hover:bg-ink/5'
                  }
                >
                  {isDisabled && <Lock size={14} />}
                  {t(`tasks.muhimlik.${option.value}`)}
                </button>
              )
            })}
          </div>
        )}
      />
    </div>
  )
}
