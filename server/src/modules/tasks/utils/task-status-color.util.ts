import { addDays, format, isWeekend, startOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { TaskStatus } from '../../../common/enums/task-status.enum';
import { UZ_HOLIDAYS_2026 } from '../holidays/uz-holidays';

export type TaskStatusColor = 'YASHIL' | 'SARIQ' | 'QIZIL' | 'KOK' | 'KULRANG';

const TASHKENT_TZ = 'Asia/Tashkent';

/**
 * "Yetarlicha vaqt bor" chegarasi: agar muddatgacha 2 yoki undan ko'p ish
 * kuni qolgan bo'lsa, topshiriq shoshilinch emas deb hisoblanadi.
 * 1 yoki 0 ish kuni qolganda muddat yaqinlashgan hisoblanadi (SARIQ).
 */
const YETARLI_ISH_KUNI = 2;

/**
 * `from` (chiqarib tashlangan) bilan `to` (kiritilgan) orasidagi Toshkent
 * vaqti bo'yicha ish kunlari sonini hisoblaydi — dam olish kunlari (shanba,
 * yakshanba) va `UZ_HOLIDAYS_2026` ro'yxatidagi bayram kunlari hisobga
 * kiritilmaydi. Agar `to` `from`dan oldin yoki teng bo'lsa — 0 qaytaradi.
 */
function ishKunlariSoni(from: Date, to: Date): number {
  const boshlanishi = startOfDay(toZonedTime(from, TASHKENT_TZ));
  const tugashi = startOfDay(toZonedTime(to, TASHKENT_TZ));

  if (tugashi <= boshlanishi) {
    return 0;
  }

  let soni = 0;
  let kursor = addDays(boshlanishi, 1);
  while (kursor <= tugashi) {
    const isoSana = format(kursor, 'yyyy-MM-dd');
    if (!isWeekend(kursor) && !UZ_HOLIDAYS_2026.includes(isoSana)) {
      soni += 1;
    }
    kursor = addDays(kursor, 1);
  }
  return soni;
}

/**
 * Topshiriqning ro'yxat/kartochkada ko'rsatiladigan "hisoblangan holat rangi"ni
 * aniqlaydi. Bu qiymat hech qachon bazaga saqlanmaydi — har bir so'rovda
 * `muddat`, `status` va `tanishildiAt` asosida qayta hisoblanadi.
 *
 * Qoidalar (Toshkent vaqti, ish kunlari hisobida):
 * - BEKOR_QILINDI -> KULRANG (bekor qilingan, faol emas).
 * - QABUL_QILINDI -> agar bajaruvchi topshiriqni muddatidan oldin
 *   topshirgan bo'lsa (bajarildiAt <= muddat) -> YASHIL ("o'z vaqtida
 *   bajarildi"), aks holda (bajarildiAt muddatdan kech yoki umuman
 *   yo'q) -> QIZIL ("kech bajarildi" — e'tibor talab qiladi).
 * - Boshqa (faol) holatlar uchun muddatgacha qolgan ish kunlari soni
 *   asosida:
 *     - muddat allaqachon o'tib ketgan (va hali yakunlanmagan) -> QIZIL;
 *     - muddatgacha 0 yoki 1 ish kuni qolgan -> SARIQ (muddat yaqinlashdi);
 *     - muddatgacha 2+ ish kuni bor va bajaruvchi allaqachon tanishib,
 *       ishni boshlagan (tanishildiAt !== null) -> KOK (jarayonda va
 *       muddatga ulguradi — "yaxshi holatda");
 *     - muddatgacha 2+ ish kuni bor, lekin hali tanishilmagan -> YASHIL
 *       (hali yetarli vaqt bor).
 *
 * @param muddat Topshiriq muddati.
 * @param status Topshiriqning joriy holati.
 * @param tanishildiAt Bajaruvchi topshiriq bilan tanishgan vaqt (yoki null).
 * @param bajarildiAt Bajaruvchi topshiriqni oxirgi marta "bajarildi" deb
 *   topshirgan vaqt (yoki null).
 * @param now Hisoblash uchun "hozirgi vaqt" — sinovlar uchun in'ektsiya
 *   qilinishi mumkin, standart holatda `new Date()`.
 */
export function calculateTaskStatusColor(
  muddat: Date,
  status: TaskStatus,
  tanishildiAt: Date | null,
  bajarildiAt: Date | null,
  now: Date = new Date(),
): TaskStatusColor {
  if (status === TaskStatus.BEKOR_QILINDI) {
    return 'KULRANG';
  }

  if (status === TaskStatus.QABUL_QILINDI) {
    if (bajarildiAt !== null && bajarildiAt.getTime() <= muddat.getTime()) {
      return 'YASHIL';
    }
    return 'QIZIL';
  }

  if (now.getTime() > muddat.getTime()) {
    return 'QIZIL';
  }

  const qolganIshKunlari = ishKunlariSoni(now, muddat);

  if (qolganIshKunlari < YETARLI_ISH_KUNI) {
    return 'SARIQ';
  }

  return tanishildiAt !== null ? 'KOK' : 'YASHIL';
}
