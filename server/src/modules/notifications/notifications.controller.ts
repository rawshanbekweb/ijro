import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { FindNotificationsQueryDto } from './dto/find-notifications-query.dto';
import { Notification } from './notification.entity';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'O‘z bildirishnomalarim ro‘yxati',
    description:
      'Joriy foydalanuvchining o‘ziga tegishli bildirishnomalari, `oqildimi` bo‘yicha ixtiyoriy filtr bilan.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bildirishnomalar ro‘yxati',
    type: [Notification],
  })
  findAll(
    @Query() query: FindNotificationsQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Notification[]> {
    return this.notificationsService.findAll(query, user);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Bildirishnomani o‘qilgan deb belgilash' })
  @ApiResponse({
    status: 200,
    description: 'Bildirishnoma o‘qilgan deb belgilandi',
    type: Notification,
  })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Notification> {
    return this.notificationsService.markAsRead(id, user);
  }
}
