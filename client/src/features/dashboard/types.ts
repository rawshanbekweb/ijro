export type TaskStatus =
  | 'YARATILDI'
  | 'YUBORILDI'
  | 'TANISHILDI'
  | 'JARAYONDA'
  | 'TASDIQ_KUTILMOQDA'
  | 'QAYTARILDI'
  | 'QABUL_QILINDI'
  | 'BEKOR_QILINDI'

export type TaskMuhimlik = 'ODDIY' | 'MUHIM' | 'SHOSHILINCH'

export type TaskStatusColor = 'YASHIL' | 'SARIQ' | 'QIZIL' | 'KOK' | 'KULRANG'

export interface Subtask {
  id: string
  taskId: string
  matn: string
  bajarildi: boolean
  tartib: number
}

/**
 * Minimal shape of a user as embedded in other payloads. Resolve the name via
 * `getUserDisplayName()` from `features/tasks/format` so a missing relation
 * still renders something sensible.
 */
export interface UserRef {
  id: string
  ismFamiliya?: string
  lavozim?: string | null
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  user?: UserRef | null
  matn: string
  createdAt: string
}

export interface AuditLog {
  id: string
  userId: string | null
  user?: UserRef | null
  harakat: string
  obyektTuri: string
  obyektId: string | null
  eskiQiymat: unknown
  yangiQiymat: unknown
  createdAt: string
}

export interface Task {
  id: string
  sarlavha: string
  tavsif: string | null
  /**
   * Author-of-record — who the task is attributed to. For tasks created by a
   * NAZORAT under delegation, this is the delegating SUPERADMIN
   * (`Delegation.beruvchiId`); otherwise it matches `yaratuvchiId`.
   */
  muallifId: string
  muallif?: UserRef
  /** Who actually submitted the task (may differ from `muallifId` — see above). */
  yaratuvchiId: string
  yaratuvchi?: UserRef
  bajaruvchiId: string
  sohaId: string
  soha?: { id: string; nomi: string; kodi: string }
  bajaruvchi?: UserRef
  muhimlik: TaskMuhimlik
  status: TaskStatus
  muddat: string
  tanishildiAt: string | null
  qaytarishSababi: string | null
  bajarildiAt: string | null
  createdAt: string
  updatedAt: string
  subtasklar: Subtask[]
  hisoblanganStatus: TaskStatusColor
}

export type TaskWithHisoblanganStatus = Task
