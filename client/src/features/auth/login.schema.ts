import { z } from 'zod'

export const loginSchema = z.object({
  login: z.string().min(3, 'auth.login.validation.loginMin'),
  parol: z.string().min(6, 'auth.login.validation.parolMin'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
