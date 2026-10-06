import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationTuri } from '../../common/enums/notification-turi.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { Task } from '../tasks/task.entity';
import { NotificationsService } from './notifications.service';

const SOAT_MS = 60 * 60 * 1000;
const KUN_MS = 24 * SOAT_MS;

/**
 * Muddatga oid eslatmalarni hisoblash uchun chegaralar. Har biriga mos
 * `NotificationTuri` biriktirilgan — cron har chaqirilganda joriy vaqtdan
 * muddatgacha qolgan vaqt shu chegaradan kichik yoki teng bo'lsa, va o'sha
 * turdagi bildirishnoma hali mavjud bo'lmasa, yangisi yaratiladi.
 */
const MUDDAT_CHEGARALARI: { turi: NotificationTuri; ms: number }[] = [
  { turi: NotificationTuri.MUDDAT_3_KUN, ms: 3 * KUN_MS },
  { turi: NotificationTuri.MUDDAT_1_KUN, ms: 1 * KUN_MS },
  { turi: NotificationTuri.MUDDAT_2_SOAT, ms: 2 * SOAT_MS },
];

/**
 * Har soatda ishga tushib, YUBORILDI/TANISHILDI/JARAYONDA holatidagi topshiriqlarning
 * muddatini tekshiradi va yaqinlashayotgan/o'tib ketgan muddatlar haqida
 * bajaruvchiga bir martalik eslatma bildirishnomasi yaratadi.
 */
@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('0 * * * *')
  async muddatEslatmalariniTekshirish(): Promise<void> {
    const tasklar = await this.taskRepository.find({
      where: {
        status: In([
          TaskStatus.YUBORILDI,
          TaskStatus.TANISHILDI,
          TaskStatus.JARAYONDA,
        ]),
      },
    });

    const now = Date.now();

    for (const task of tasklar) {
      if (!task.muddat) {
        continue;
      }

      const qolganVaqt = task.muddat.getTime() - now;

      if (qolganVaqt <= 0) {
        await this.eslatmaYaratish(
          task,
          NotificationTuri.MUDDAT_OTDI,
          `"${task.sarlavha}" topshirig‘ining muddati o‘tib ketdi`,
        );
        continue;
      }

      for (const chegara of MUDDAT_CHEGARALARI) {
        if (qolganVaqt <= chegara.ms) {
          await this.eslatmaYaratish(
            task,
            chegara.turi,
            this.chegaraMatni(task, chegara.turi),
          );
        }
      }
    }
  }

  private chegaraMatni(task: Task, turi: NotificationTuri): string {
    switch (turi) {
      case NotificationTuri.MUDDAT_3_KUN:
        return `"${task.sarlavha}" topshirig‘ining muddatiga 3 kun qoldi`;
      case NotificationTuri.MUDDAT_1_KUN:
        return `"${task.sarlavha}" topshirig‘ining muddatiga 1 kun qoldi`;
      case NotificationTuri.MUDDAT_2_SOAT:
        return `"${task.sarlavha}" topshirig‘ining muddatiga 2 soat qoldi`;
      default:
        return `"${task.sarlavha}" topshirig‘i bo‘yicha eslatma`;
    }
  }

  private async eslatmaYaratish(
    task: Task,
    turi: NotificationTuri,
    matn: string,
  ): Promise<void> {
    const mavjud = await this.notificationsService.existsForTask(task.id, turi);
    if (mavjud) {
      return;
    }

    await this.notificationsService.create({
      userId: task.bajaruvchiId,
      taskId: task.id,
      turi,
      matn,
    });
    this.logger.log(`Eslatma yaratildi: ${turi} — topshiriq ${task.id}`);
  }
}
