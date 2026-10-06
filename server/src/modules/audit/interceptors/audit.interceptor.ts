import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { AuditService } from '../audit.service';
import { AUDIT_ACTION_KEY } from '../decorators/audit-action.decorator';

interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const YOZUVCHI_METODLAR = new Set(['POST', 'PATCH', 'DELETE']);

/**
 * `@AuditAction()` bilan belgilangan yozuvchi (POST/PATCH/DELETE)
 * endpointlar uchun so'rov muvaffaqiyatli yakunlangandan so'ng (RxJS
 * `tap()` orqali — xatolik holatida hech narsa yozilmaydi) audit
 * jurnaliga yozuv qo'shadi.
 *
 * CHEKLOV: bu interceptor umumiy (generic) bo'lgani uchun "eski qiymat"ni
 * (obyektning o'zgarishdan oldingi holati) generik tarzda DB'dan olib
 * kelish doirasi tashqarisida qoldirilgan — shuning uchun `eskiQiymat`
 * har doim `null` sifatida yoziladi. `yangiQiymat` sifatida esa
 * so'rovdan qaytgan javob tanasi (response body) saqlanadi.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!YOZUVCHI_METODLAR.has(request.method)) {
      return next.handle();
    }

    const harakat = this.reflector.getAllAndOverride<string | undefined>(
      AUDIT_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!harakat) {
      return next.handle();
    }

    const obyektTuri = context.getClass().name.replace(/Controller$/, '');
    const userId = request.user?.userId ?? null;
    const paramId =
      typeof request.params?.id === 'string' ? request.params.id : undefined;

    return next.handle().pipe(
      tap((javobTanasi: unknown) => {
        const obyektId = paramId ?? this.extractIdFromBody(javobTanasi) ?? null;

        this.auditService
          .create({
            userId,
            harakat,
            obyektTuri,
            obyektId,
            eskiQiymat: null,
            yangiQiymat: javobTanasi,
          })
          .catch((xato: unknown) => {
            this.logger.error('Audit jurnaliga yozib bo‘lmadi', xato);
          });
      }),
    );
  }

  private extractIdFromBody(body: unknown): string | undefined {
    if (
      body &&
      typeof body === 'object' &&
      'id' in body &&
      typeof body.id === 'string'
    ) {
      return (body as { id: string }).id;
    }
    return undefined;
  }
}
