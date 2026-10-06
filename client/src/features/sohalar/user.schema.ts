import { z } from 'zod'

/**
 * `parol` is required when creating a user but optional when editing — an
 * empty value on edit means "leave the password unchanged" and is simply
 * omitted from the PATCH body (the backend DTO is a partial, so an absent
 * `parol` never touches `parolHash`).
 *
 * The soha/rol pairing is also validated server-side by a custom decorator;
 * this check just avoids a pointless round trip for the obvious case.
 *
 * Messages are i18n keys, translated where the errors are rendered.
 */
export function createUserFormSchema(isEdit: boolean) {
  return z
    .object({
      ismFamiliya: z.string().trim().min(1, 'sohalar.userForm.validation.ismFamiliyaRequired'),
      login: z.string().trim().min(1, 'sohalar.userForm.validation.loginRequired'),
      parol: z.string(),
      rol: z.enum(['SUPERADMIN', 'BAJARUVCHI', 'NAZORAT']),
      sohaId: z.string(),
      lavozim: z.string(),
      holat: z.enum(['FAOL', 'NOFAOL']),
    })
    .superRefine((values, ctx) => {
      if (!isEdit && values.parol.length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['parol'],
          message: 'sohalar.userForm.validation.parolMin',
        })
      }

      if (isEdit && values.parol.length > 0 && values.parol.length < 6) {
        ctx.addIssue({
          code: 'custom',
          path: ['parol'],
          message: 'sohalar.userForm.validation.parolMin',
        })
      }

      if (values.rol === 'BAJARUVCHI' && values.sohaId.trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['sohaId'],
          message: 'sohalar.userForm.validation.sohaRequired',
        })
      }
    })
}

export type UserFormValues = z.infer<ReturnType<typeof createUserFormSchema>>
