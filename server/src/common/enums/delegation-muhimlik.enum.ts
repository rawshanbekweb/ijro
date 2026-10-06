/**
 * Delegatsiya orqali NAZORAT foydalanuvchisi yarata oladigan topshiriqning
 * ruxsat etilgan maksimal muhimlik darajasi. `TaskMuhimlik`dagi qiymat
 * nomlari bilan mos keladi, lekin SHOSHILINCH bu yerda yo'q — NAZORAT hech
 * qachon SHOSHILINCH topshiriq yarata olmaydi (delegatsiya qiymatidan
 * qat'iy nazar).
 */
export enum DelegationMuhimlik {
  ODDIY = 'ODDIY',
  MUHIM = 'MUHIM',
}
