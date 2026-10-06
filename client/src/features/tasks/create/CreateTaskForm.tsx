import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2, ShieldAlert } from 'lucide-react'
import SohaBajaruvchiSelect from '../../../components/shared/SohaBajaruvchiSelect'
import { createTaskFormSchema, type CreateTaskFormValues } from './create-task.schema'
import PrioritySelector from './PrioritySelector'
import SubtaskListInput from './SubtaskListInput'
import { useCreateTask } from '../hooks/useCreateTask'
import { getApiErrorMessage } from '../../sohalar/apiError'
import { useAuthStore } from '../../../store/auth.store'
import { useDelegation } from '../../delegation/hooks/queries/useDelegation'
import { getUserDisplayName } from '../format'
import type { TaskMuhimlik } from '../types'

const inputClass =
  'w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20'
const labelClass = 'mb-1.5 block text-sm font-medium text-ink'

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDaysIsoDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function CreateTaskForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createTask = useCreateTask()
  const [formError, setFormError] = useState<string | null>(null)

  const currentUser = useAuthStore((state) => state.user)
  const isNazorat = currentUser?.rol === 'NAZORAT'
  const { data: delegation } = useDelegation(isNazorat ? currentUser?.id : undefined)

  const allowedSohaIds = isNazorat ? (delegation?.ruxsatEtilganSohalar ?? []) : undefined
  // A NAZORAT can never issue SHOSHILINCH regardless of delegation settings; MUHIM is
  // additionally locked when the delegation caps them at ODDIY.
  const disabledMuhimlikOptions: TaskMuhimlik[] = isNazorat
    ? delegation?.maksimalMuhimlik === 'ODDIY'
      ? ['MUHIM', 'SHOSHILINCH']
      : ['SHOSHILINCH']
    : []
  const maxDate = isNazorat && delegation ? addDaysIsoDate(delegation.maksimalMuddatKun) : undefined
  const beruvchiName =
    isNazorat && delegation
      ? getUserDisplayName(delegation.beruvchi, delegation.beruvchiId)
      : null

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      sarlavha: '',
      tavsif: '',
      sohaId: '',
      bajaruvchiId: '',
      muddatSana: todayIsoDate(),
      muddatVaqt: '18:00',
      muhimlik: 'ODDIY',
      subtasklar: [],
    },
  })

  const onSubmit = async (values: CreateTaskFormValues) => {
    setFormError(null)

    const subtasklar = (values.subtasklar ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0)

    try {
      await createTask.mutateAsync({
        sarlavha: values.sarlavha.trim(),
        tavsif: values.tavsif?.trim() || undefined,
        sohaId: values.sohaId,
        bajaruvchiId: values.bajaruvchiId,
        muddat: new Date(`${values.muddatSana}T${values.muddatVaqt}:00`).toISOString(),
        muhimlik: values.muhimlik,
        subtasklar,
      })
      // TODO: navigate to `/tasks` once the task list page exists.
      navigate('/dashboard')
    } catch (error) {
      setFormError(getApiErrorMessage(error, t('tasks.create.error')))
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      {formError && (
        <div className="mb-4 rounded-lg bg-red/10 px-4 py-3 text-sm text-red">{formError}</div>
      )}

      {beruvchiName && (
        <div className="mb-4 flex items-center gap-2.5 rounded-lg bg-purple/10 px-4 py-3 text-sm text-purple">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{t('nazorat.createTaskAlert', { name: beruvchiName })}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SohaBajaruvchiSelect
            control={control}
            sohaFieldName="sohaId"
            bajaruvchiFieldName="bajaruvchiId"
            allowedSohaIds={allowedSohaIds}
          />

          <div>
            <label htmlFor="task-sarlavha" className={labelClass}>
              {t('tasks.create.sarlavha')}
            </label>
            <input
              id="task-sarlavha"
              type="text"
              placeholder={t('tasks.create.sarlavhaPlaceholder')}
              className={inputClass}
              {...register('sarlavha')}
            />
            {errors.sarlavha && <p className="mt-1 text-xs text-red">{t(errors.sarlavha.message ?? '')}</p>}
          </div>

          <div>
            <label htmlFor="task-tavsif" className={labelClass}>
              {t('tasks.create.tavsif')}
            </label>
            <textarea
              id="task-tavsif"
              rows={4}
              placeholder={t('tasks.create.tavsifPlaceholder')}
              className={inputClass}
              {...register('tavsif')}
            />
            {errors.tavsif && <p className="mt-1 text-xs text-red">{t(errors.tavsif.message ?? '')}</p>}
          </div>

          <SubtaskListInput control={control} register={register} />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="task-muddatSana" className={labelClass}>
                {t('tasks.create.muddatSana')}
              </label>
              <input
                id="task-muddatSana"
                type="date"
                max={maxDate}
                className={inputClass}
                {...register('muddatSana')}
              />
              {errors.muddatSana && (
                <p className="mt-1 text-xs text-red">{t(errors.muddatSana.message ?? '')}</p>
              )}
            </div>

            <div>
              <label htmlFor="task-muddatVaqt" className={labelClass}>
                {t('tasks.create.muddatVaqt')}
              </label>
              <input
                id="task-muddatVaqt"
                type="time"
                className={inputClass}
                {...register('muddatVaqt')}
              />
              {errors.muddatVaqt && (
                <p className="mt-1 text-xs text-red">{t(errors.muddatVaqt.message ?? '')}</p>
              )}
            </div>
          </div>

          <PrioritySelector control={control} name="muhimlik" disabledOptions={disabledMuhimlikOptions} />

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              disabled
              title={t('common.comingSoon')}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('tasks.create.saveDraft')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || createTask.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-70"
            >
              {(isSubmitting || createTask.isPending) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {t('tasks.create.submit')}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
