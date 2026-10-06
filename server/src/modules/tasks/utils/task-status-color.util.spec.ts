import { TaskStatus } from '../../../common/enums/task-status.enum';
import { calculateTaskStatusColor } from './task-status-color.util';

// Barcha sanalar UTC vaqtida yozilgan (Toshkent vaqti bilan solishtirishda
// bevosita vaqt farqi hisobga olinmagan, chunki testlarda faqat kunlar
// darajasidagi farqlar tekshiriladi va bu daraja UTC+5 siljishidan
// ta'sirlanmaydi). 2026-07-13 — dushanba, 2026-07-18/19 — dam olish kunlari.
describe('calculateTaskStatusColor', () => {
  it('yetarlicha vaqt bo‘lsa YASHIL qaytaradi (hali tanishilmagan)', () => {
    const now = new Date('2026-07-13T09:00:00Z');
    const muddat = new Date('2026-07-20T18:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.JARAYONDA,
      null,
      null,
      now,
    );
    expect(rang).toBe('YASHIL');
  });

  it('muddat yaqinlashganda (1 ish kuni qoldi) SARIQ qaytaradi', () => {
    const now = new Date('2026-07-13T09:00:00Z');
    const muddat = new Date('2026-07-14T18:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.JARAYONDA,
      new Date('2026-07-13T09:00:00Z'),
      null,
      now,
    );
    expect(rang).toBe('SARIQ');
  });

  it('muddat o‘tib ketgan (hali yakunlanmagan) bo‘lsa QIZIL qaytaradi', () => {
    const now = new Date('2026-07-15T09:00:00Z');
    const muddat = new Date('2026-07-13T18:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.JARAYONDA,
      new Date('2026-07-13T09:00:00Z'),
      null,
      now,
    );
    expect(rang).toBe('QIZIL');
  });

  it('o‘z vaqtida bajarilgan (QABUL_QILINDI, bajarildiAt <= muddat) YASHIL qaytaradi', () => {
    const muddat = new Date('2026-07-13T18:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.QABUL_QILINDI,
      new Date('2026-07-01T09:00:00Z'),
      new Date('2026-07-12T09:00:00Z'),
    );
    expect(rang).toBe('YASHIL');
  });

  it('erta tanishilgan, lekin kech bajarilgan (bajarildiAt > muddat) QIZIL qaytaradi', () => {
    const muddat = new Date('2026-07-13T18:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.QABUL_QILINDI,
      new Date('2026-07-01T09:00:00Z'),
      new Date('2026-08-15T09:00:00Z'),
    );
    expect(rang).toBe('QIZIL');
  });

  it('bajarilgan vaqti noma’lum (bajarildiAt === null) QABUL_QILINDI QIZIL qaytaradi', () => {
    const muddat = new Date('2026-07-13T18:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.QABUL_QILINDI,
      new Date('2026-07-01T09:00:00Z'),
      null,
    );
    expect(rang).toBe('QIZIL');
  });

  it('bekor qilingan topshiriq har doim KULRANG qaytaradi', () => {
    const muddat = new Date('2026-07-13T18:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.BEKOR_QILINDI,
      null,
      null,
      new Date('2026-07-20T09:00:00Z'),
    );
    expect(rang).toBe('KULRANG');
  });

  it('hali tanishilmagan (tanishildiAt === null) va yetarli vaqt bo‘lsa YASHIL qaytaradi', () => {
    const now = new Date('2026-07-13T09:00:00Z');
    const muddat = new Date('2026-07-17T18:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.YUBORILDI,
      null,
      null,
      now,
    );
    expect(rang).toBe('YASHIL');
  });

  it('tanishilgan va yetarli vaqt bo‘lsa KOK (jarayonda, muddatga ulguradi) qaytaradi', () => {
    const now = new Date('2026-07-13T09:00:00Z');
    const muddat = new Date('2026-07-17T18:00:00Z');
    const tanishildiAt = new Date('2026-07-13T10:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.JARAYONDA,
      tanishildiAt,
      null,
      now,
    );
    expect(rang).toBe('KOK');
  });

  it('chegara holati: muddat aynan hozir bo‘lsa (0 ish kuni qoldi) SARIQ qaytaradi', () => {
    const now = new Date('2026-07-13T12:00:00Z');
    const muddat = new Date('2026-07-13T12:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.JARAYONDA,
      new Date('2026-07-13T09:00:00Z'),
      null,
      now,
    );
    expect(rang).toBe('SARIQ');
  });

  it('dam olish kunlarini o‘tkazib yuboradigan ish kunlari hisobi: payshanbadan keyingi dushanbagacha 2 ish kuni (juma va dushanba)', () => {
    // now: 2026-07-16 (payshanba), muddat: 2026-07-20 (dushanba).
    // Oralig'idagi kunlar: juma (ish kuni), shanba/yakshanba (dam olish,
    // hisobga kirmaydi), dushanba (ish kuni) => 2 ish kuni qoladi => KOK.
    const now = new Date('2026-07-16T09:00:00Z');
    const muddat = new Date('2026-07-20T18:00:00Z');
    const tanishildiAt = new Date('2026-07-14T09:00:00Z');
    const rang = calculateTaskStatusColor(
      muddat,
      TaskStatus.JARAYONDA,
      tanishildiAt,
      null,
      now,
    );
    expect(rang).toBe('KOK');
  });
});
