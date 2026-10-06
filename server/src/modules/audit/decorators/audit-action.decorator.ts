import { SetMetadata } from '@nestjs/common';

export const AUDIT_ACTION_KEY = 'auditAction';

/**
 * Route handlerga audit harakat nomini metadata sifatida biriktiradi.
 *
 * `AuditInterceptor` (global `APP_INTERCEPTOR` sifatida ro'yxatdan
 * o'tkazilgan) muvaffaqiyatli POST/PATCH/DELETE so'rovlardan so'ng shu
 * metadata mavjud bo'lsa audit jurnaliga yozuv qo'shadi. Metadata
 * bo'lmagan (masalan, GET) endpointlar hech qachon audit qilinmaydi.
 */
export const AuditAction = (harakat: string) =>
  SetMetadata(AUDIT_ACTION_KEY, harakat);
