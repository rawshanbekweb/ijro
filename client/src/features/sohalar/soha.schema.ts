import { z } from 'zod'

// Messages are i18n keys, translated where the errors are rendered.
export const sohaFormSchema = z.object({
  nomi: z.string().trim().min(1, 'sohalar.sohaForm.validation.nomiRequired'),
  kodi: z.string().trim().min(1, 'sohalar.sohaForm.validation.kodiRequired'),
})

export type SohaFormValues = z.infer<typeof sohaFormSchema>
