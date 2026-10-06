import type { Role } from '../../store/auth.store'

export type UserHolat = 'FAOL' | 'NOFAOL'

/**
 * Mirrors the backend `Soha` entity.
 *
 * NOTE: `GET /sohalar` currently calls `sohaRepository.find()` without any
 * relations, so `xodimlar` is *not* embedded in list responses — employee
 * counts have to be derived client-side from `GET /users` (see
 * `SohalarPage`, which loads the full user list once and groups by `sohaId`
 * rather than firing one query per card). The field is kept optional here in
 * case the endpoint starts eager-loading the relation later.
 */
export interface Soha {
  id: string
  nomi: string
  kodi: string
  xodimlar?: User[]
  createdAt: string
  updatedAt: string
}

/**
 * Full user shape as returned by `GET /users` (the superadmin CRUD endpoint).
 *
 * This is deliberately richer than `UserRef` in `features/dashboard/types` (a
 * minimal embedded shape) and `AuthUser` in `store/auth.store` (only what
 * `/auth/me` returns). `parolHash` is `@Exclude()`d server-side and never
 * reaches the client.
 */
export interface User {
  id: string
  ismFamiliya: string
  login: string
  rol: Role
  sohaId: string | null
  soha?: Soha | null
  lavozim: string | null
  holat: UserHolat
  /** Count of the user's non-terminal tasks; added by `GET /users` only. */
  faolTopshiriqlarSoni: number
  createdAt: string
  updatedAt: string
}

export interface SohaPayload {
  nomi: string
  kodi: string
}

export interface UserPayload {
  ismFamiliya: string
  login: string
  parol?: string
  rol: Role
  sohaId?: string
  lavozim?: string
  holat?: UserHolat
}
