import { useEffect, useMemo, useRef } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import Combobox from './Combobox'
import type { ComboboxOption } from './Combobox'
import { useSohalar } from '../../features/sohalar/hooks/queries/useSohalar'
import { useUsers } from '../../features/sohalar/hooks/queries/useUsers'

interface SohaBajaruvchiSelectProps<T extends FieldValues> {
  control: Control<T>
  sohaFieldName: Path<T>
  bajaruvchiFieldName: Path<T>
  /**
   * When provided (e.g. a NAZORAT's `delegation.ruxsatEtilganSohalar`), only
   * these soha ids are offered in the soha picker.
   */
  allowedSohaIds?: string[]
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

interface BajaruvchiFieldProps {
  sohaId: string
  value: string
  onChange: (value: string) => void
  hasError: boolean
}

/**
 * Rendered unconditionally (even with no soha picked) so its effects can keep
 * the bajaruvchi field in sync with the soha field — it returns `null` until a
 * soha is selected instead of being conditionally mounted.
 */
function BajaruvchiField({ sohaId, value, onChange, hasError }: BajaruvchiFieldProps) {
  const { t } = useTranslation()
  const { data: bajaruvchilar, isLoading } = useUsers(
    { sohaId, rol: 'BAJARUVCHI' },
    { enabled: Boolean(sohaId) },
  )

  // Keep the latest onChange in a ref: react-hook-form hands back a fresh
  // function identity on each render, which would otherwise re-fire the
  // effects below on every keystroke elsewhere in the form.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  const previousSohaIdRef = useRef(sohaId)

  useEffect(() => {
    if (previousSohaIdRef.current !== sohaId) {
      previousSohaIdRef.current = sohaId
      onChangeRef.current('')
    }
  }, [sohaId])

  const options = useMemo<ComboboxOption[]>(
    () =>
      (bajaruvchilar ?? []).map((user) => ({
        value: user.id,
        label: user.ismFamiliya,
        keywords: user.lavozim ?? '',
        hint:
          user.faolTopshiriqlarSoni === 0 ? (
            <span className="shrink-0 text-xs font-medium text-green">{t('tasks.select.free')}</span>
          ) : (
            <span className="shrink-0 text-xs text-muted">
              {t('tasks.select.activeCount', { count: user.faolTopshiriqlarSoni })}
            </span>
          ),
      })),
    [bajaruvchilar, t],
  )

  // Only one candidate in this soha — pick them automatically.
  useEffect(() => {
    if (!value && bajaruvchilar?.length === 1) {
      onChangeRef.current(bajaruvchilar[0].id)
    }
  }, [bajaruvchilar, value])

  if (!sohaId) {
    return null
  }

  return (
    <div>
      <label htmlFor="bajaruvchi-select" className="mb-1.5 block text-sm font-medium text-ink">
        {t('tasks.list.bajaruvchiLabel')}
      </label>
      <Combobox
        id="bajaruvchi-select"
        options={options}
        value={value}
        onChange={onChange}
        isLoading={isLoading}
        placeholder={t('tasks.select.xodimPlaceholder')}
        emptyText={t('tasks.select.noBajaruvchi')}
        hasError={hasError}
      />
    </div>
  )
}

/**
 * Cascading soha → bajaruvchi picker for react-hook-form. Both fields are
 * driven through `Controller` (rather than `register`) because the second
 * field's options and value depend on the first one.
 */
export default function SohaBajaruvchiSelect<T extends FieldValues>({
  control,
  sohaFieldName,
  bajaruvchiFieldName,
  allowedSohaIds,
}: SohaBajaruvchiSelectProps<T>) {
  const { t } = useTranslation()
  const { data: sohalar, isLoading } = useSohalar()
  const selectedSohaId = asString(useWatch({ control, name: sohaFieldName }))

  const sohaOptions = useMemo<ComboboxOption[]>(
    () =>
      (sohalar ?? [])
        .filter((soha) => !allowedSohaIds || allowedSohaIds.includes(soha.id))
        .map((soha) => ({
          value: soha.id,
          label: soha.nomi,
          keywords: soha.kodi,
          hint: <span className="shrink-0 text-xs text-muted">{soha.kodi}</span>,
        })),
    [sohalar, allowedSohaIds],
  )

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="soha-select" className="mb-1.5 block text-sm font-medium text-ink">
          {t('tasks.list.sohaLabel')}
        </label>
        <Controller
          control={control}
          name={sohaFieldName}
          render={({ field, fieldState }) => (
            <>
              <Combobox
                id="soha-select"
                options={sohaOptions}
                value={asString(field.value)}
                onChange={field.onChange}
                isLoading={isLoading}
                placeholder={t('tasks.select.sohaPlaceholder')}
                emptyText={t('tasks.select.sohaEmpty')}
                hasError={Boolean(fieldState.error)}
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-red">{t(fieldState.error.message ?? '')}</p>
              )}
            </>
          )}
        />
      </div>

      <Controller
        control={control}
        name={bajaruvchiFieldName}
        render={({ field, fieldState }) => (
          <div>
            <BajaruvchiField
              sohaId={selectedSohaId}
              value={asString(field.value)}
              onChange={field.onChange}
              hasError={Boolean(fieldState.error)}
            />
            {selectedSohaId && fieldState.error && (
              <p className="mt-1 text-xs text-red">{t(fieldState.error.message ?? '')}</p>
            )}
          </div>
        )}
      />
    </div>
  )
}
