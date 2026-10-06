import { useEffect, useRef } from 'react'
import { useFieldArray } from 'react-hook-form'
import type { Control, FieldValues, UseFormRegister } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CreateTaskFormValues } from './create-task.schema'

interface SubtaskListInputProps {
  control: Control<CreateTaskFormValues>
  register: UseFormRegister<CreateTaskFormValues>
}

const inputClass =
  'w-full rounded-lg border border-muted/30 px-3 py-2.5 text-sm text-ink outline-none focus:border-blue focus:ring-2 focus:ring-blue/20'

// `subtasklar` is a plain `string[]` in the schema, but react-hook-form's
// `useFieldArray` types are built around arrays of objects — cast to a loose
// `FieldValues` control here and re-narrow the return value manually.
interface SubtaskFieldArray {
  fields: { id: string }[]
  append: (value: string) => void
  remove: (index: number) => void
}

export default function SubtaskListInput({ control, register }: SubtaskListInputProps) {
  const { t } = useTranslation()
  const { fields, append, remove } = useFieldArray({
    control: control as unknown as Control<FieldValues>,
    name: 'subtasklar',
  }) as unknown as SubtaskFieldArray

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const previousLengthRef = useRef(fields.length)

  useEffect(() => {
    if (fields.length > previousLengthRef.current) {
      const lastField = fields[fields.length - 1]
      inputRefs.current[lastField.id]?.focus()
    }
    previousLengthRef.current = fields.length
  }, [fields])

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{t('tasks.create.subtasks')}</span>

      <div className="space-y-2">
        {fields.map((field, index) => {
          const { ref, ...rest } = register(`subtasklar.${index}` as const)
          return (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t('tasks.create.subtaskPlaceholder')}
                className={inputClass}
                ref={(el) => {
                  ref(el)
                  inputRefs.current[field.id] = el
                }}
                {...rest}
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="shrink-0 rounded-lg p-2 text-muted hover:bg-red/10 hover:text-red"
                aria-label={t('tasks.create.removeSubtask')}
              >
                <X size={18} />
              </button>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => append('')}
        className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-blue hover:bg-blue/10"
      >
        <Plus size={16} />
        {t('tasks.create.addSubtask')}
      </button>
    </div>
  )
}
