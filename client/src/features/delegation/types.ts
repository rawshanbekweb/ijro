import type { UserRef } from '../dashboard/types'

/**
 * Mirrors the backend `DelegationMuhimlik` enum. Intentionally excludes
 * `SHOSHILINCH` — a NAZORAT's delegation can never grant that priority.
 */
export type DelegationMuhimlik = 'ODDIY' | 'MUHIM'

export type DelegationHolat = 'FAOL' | 'BEKOR_QILINGAN'

/**
 * Mirrors the backend `Delegation` entity (`server/src/modules/delegation`).
 * A NAZORAT user has at most one FAOL delegation at a time — creating a new
 * one auto-cancels the previous.
 */
export interface Delegation {
  id: string
  nazoratId: string
  nazorat?: UserRef
  beruvchiId: string
  beruvchi?: UserRef
  ruxsatEtilganSohalar: string[]
  maksimalMuhimlik: DelegationMuhimlik
  maksimalMuddatKun: number
  obyektTopshiriqRuxsat: boolean
  holat: DelegationHolat
  createdAt: string
}

export interface CreateDelegationPayload {
  nazoratId: string
  beruvchiId: string
  ruxsatEtilganSohalar: string[]
  maksimalMuhimlik?: DelegationMuhimlik
  maksimalMuddatKun: number
  obyektTopshiriqRuxsat?: boolean
}
