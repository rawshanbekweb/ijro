import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { NotificationTuri } from '../../common/enums/notification-turi.enum';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { FindNotificationsQueryDto } from './dto/find-notifications-query.dto';
import { Notification } from './notification.entity';

export interface CreateNotificationParams {
  userId: string;
  taskId: string | null;
  turi: NotificationTuri;
  matn: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(params: CreateNotificationParams): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId: params.userId,
      taskId: params.taskId,
      turi: params.turi,
      matn: params.matn,
    });
    return this.notificationRepository.save(notification);
  }

  async findAll(
    filter: FindNotificationsQueryDto,
    user: AuthenticatedUser,
  ): Promise<Notification[]> {
    const where: FindOptionsWhere<Notification> = { userId: user.userId };
    if (filter.oqildimi !== undefined) {
      where.oqildimi = filter.oqildimi;
    }

    return this.notificationRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, user: AuthenticatedUser): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException('Bildirishnoma topilmadi');
    }
    if (notification.userId !== user.userId) {
      throw new ForbiddenException('Ushbu bildirishnoma sizga tegishli emas');
    }

    notification.oqildimi = true;
    return this.notificationRepository.save(notification);
  }

  async existsForTask(
    taskId: string,
    turi: NotificationTuri,
  ): Promise<boolean> {
    const count = await this.notificationRepository.count({
      where: { taskId, turi },
    });
    return count > 0;
  }
}
