import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

function toStartOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

// Messages are i18n keys, translated where the errors are rendered.
export const createTaskFormSchema = z.object({
  sarlavha: z.string().trim().min(5, 'tasks.create.validation.sarlavhaMin'),
  tavsif: z.string().trim().optional(),
  sohaId: z.string().min(1, 'tasks.create.validation.sohaRequired').uuid('tasks.create.validation.sohaInvalid'),
  bajaruvchiId: z.string().min(1, 'tasks.create.validation.bajaruvchiRequired')
    .uuid('tasks.create.validation.bajaruvchiInvalid'),
  muddatSana: z
    .string()
    .min(1, 'tasks.create.validation.muddatRequired')
    .refine((value) => {
      const selected = new Date(value)
      if (Number.isNaN(selected.getTime())) {
        return false
      }
      return toStartOfDay(selected).getTime() >= toStartOfDay(new Date()).getTime()
    }, 'tasks.create.validation.muddatPast'),
  muddatVaqt: z.string().regex(timeRegex, 'tasks.create.validation.vaqtFormat'),
  muhimlik: z.enum(['ODDIY', 'MUHIM', 'SHOSHILINCH']),
  subtasklar: z.array(z.string()).optional(),
})

export type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>
