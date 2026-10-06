import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuditAction } from '../audit/decorators/audit-action.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { TasksService } from '../tasks/tasks.service';
import { Comment } from './comment.entity';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@ApiBearerAuth()
@Controller('tasks')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly tasksService: TasksService,
  ) {}

  @Get(':id/izohlar')
  @ApiOperation({ summary: 'Topshiriqqa oid izohlar ro‘yxati' })
  @ApiResponse({
    status: 200,
    description: 'Izohlar ro‘yxati (xronologik tartibda)',
    type: [Comment],
  })
  async findAll(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Comment[]> {
    // `findOne` mavjud bo'lmasa 404, BAJARUVCHI o'ziniki bo'lmagan
    // topshiriqni so'rasa 403 tashlaydi (SUPERADMIN cheklovsiz).
    await this.tasksService.findOne(id, user);
    return this.commentsService.findByTask(id);
  }

  @Post(':id/izohlar')
  @AuditAction('COMMENT_ADDED')
  @ApiOperation({ summary: 'Topshiriqqa izoh qoldirish' })
  @ApiResponse({ status: 201, description: 'Izoh qo‘shildi', type: Comment })
  async create(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Comment> {
    await this.tasksService.findOne(id, user);
    return this.commentsService.create(id, dto, user.userId);
  }
}
