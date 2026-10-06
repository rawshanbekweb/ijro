import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface CreateAuditLogParams {
  userId: string | null;
  harakat: string;
  obyektTuri: string;
  obyektId: string | null;
  eskiQiymat?: unknown;
  yangiQiymat?: unknown;
}

/**
 * Audit jurnaliga yozuv qo'shish uchun xizmat. Bu jurnal o'zgarmas
 * (append-only) — atayin faqat `create()` metodi mavjud, yangilash yoki
 * o'chirish metodlari yo'q.
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async create(params: CreateAuditLogParams): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      userId: params.userId,
      harakat: params.harakat,
      obyektTuri: params.obyektTuri,
      obyektId: params.obyektId,
      eskiQiymat: params.eskiQiymat ?? null,
      yangiQiymat: params.yangiQiymat ?? null,
    });
    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Berilgan obyekt (masalan, "Tasks" + topshiriq ID) uchun audit jurnali
   * yozuvlarini eng yangisidan boshlab qaytaradi.
   */
  async findByObject(
    obyektTuri: string,
    obyektId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { obyektTuri, obyektId },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }
}
