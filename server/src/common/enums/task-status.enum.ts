export enum TaskStatus {
  YARATILDI = 'YARATILDI',
  YUBORILDI = 'YUBORILDI',
  TANISHILDI = 'TANISHILDI',
  JARAYONDA = 'JARAYONDA',
  TASDIQ_KUTILMOQDA = 'TASDIQ_KUTILMOQDA',
  QAYTARILDI = 'QAYTARILDI',
  QABUL_QILINDI = 'QABUL_QILINDI',
  BEKOR_QILINDI = 'BEKOR_QILINDI',
}

/**
 * Task status state machine, keyed by current status. A transition is only
 * legal if the target appears in the current status's array — enforced by
 * `TasksService`'s `assertTransition()` (throws 409 ConflictException
 * otherwise). Some handlers (tanishish, qaytarish) additionally pin down an
 * exact required source status beyond what this graph alone expresses,
 * since JARAYONDA is a legal target from two different sources (TANISHILDI
 * via tanishish's second call, and TASDIQ_KUTILMOQDA via qaytarish) and
 * those two actions must not be interchangeable.
 */
export const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.YARATILDI]: [TaskStatus.YUBORILDI, TaskStatus.BEKOR_QILINDI],
  [TaskStatus.YUBORILDI]: [TaskStatus.TANISHILDI, TaskStatus.BEKOR_QILINDI],
  [TaskStatus.TANISHILDI]: [TaskStatus.JARAYONDA, TaskStatus.BEKOR_QILINDI],
  [TaskStatus.JARAYONDA]: [
    TaskStatus.TASDIQ_KUTILMOQDA,
    TaskStatus.BEKOR_QILINDI,
  ],
  [TaskStatus.TASDIQ_KUTILMOQDA]: [
    TaskStatus.QABUL_QILINDI,
    TaskStatus.JARAYONDA,
    TaskStatus.BEKOR_QILINDI,
  ],
  [TaskStatus.QAYTARILDI]: [TaskStatus.JARAYONDA, TaskStatus.BEKOR_QILINDI],
  [TaskStatus.QABUL_QILINDI]: [],
  [TaskStatus.BEKOR_QILINDI]: [],
};
