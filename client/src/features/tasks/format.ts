import type { UserRef } from './types'

const LOCALE = 'uz-UZ'

export function formatDate(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(value: string | null | undefined): string | null {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toLocaleString(LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Full display name of an embedded user, falling back to the raw id when the
 * relation was not loaded.
 */
export function getUserDisplayName(
  user: UserRef | null | undefined,
  fallbackId?: string | null,
): string {
  const name = user?.ismFamiliya
  if (name && name.trim().length > 0) {
    return name
  }
  return user?.id ?? fallbackId ?? '—'
}

/**
 * Given name for greetings. `ismFamiliya` is stored as "Familiya Ism
 * Otasining ismi", so the given name is the second word; a single-word value
 * is returned as is.
 */
export function getGivenName(ismFamiliya: string | null | undefined): string {
  const parts = (ismFamiliya ?? '').trim().split(/\s+/).filter(Boolean)
  return parts[1] ?? parts[0] ?? ''
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Tasks have no human-readable "topshiriq kodi" in the data model — only a
 * uuid. Show a short prefix of it so the page still has a referencable code.
 */
export function getShortTaskCode(id: string): string {
  return id.split('-')[0]?.toUpperCase() ?? id
}
