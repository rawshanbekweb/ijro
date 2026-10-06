import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { AuditLog } from '../audit/audit-log.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../audit/decorators/audit-action.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { EskalatsiyaDto } from './dto/eskalatsiya.dto';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto';
import { QaytarishDto } from './dto/qaytarish.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Subtask } from './subtask.entity';
import { Task } from './task.entity';
import { TasksService, TaskWithHisoblanganStatus } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly auditService: AuditService,
  ) {}

  @Post()
  @Roles(Role.SUPERADMIN, Role.NAZORAT)
  @AuditAction('TASK_CREATED')
  @ApiOperation({ summary: 'Yangi topshiriq yaratish' })
  @ApiResponse({ status: 201, description: 'Topshiriq yaratildi', type: Task })
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Topshiriqlar ro‘yxati',
    description:
      'SUPERADMIN filtrlar bilan barcha topshiriqlarni ko‘radi. BAJARUVCHI uchun faqat o‘ziga tegishli topshiriqlar qaytariladi, client filtridan qat’iy nazar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Topshiriqlar ro‘yxati',
    type: [Task],
  })
  findAll(
    @Query() query: FindTasksQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskWithHisoblanganStatus[]> {
    return this.tasksService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta topshiriqni olish' })
  @ApiResponse({ status: 200, description: 'Topshiriq topildi', type: Task })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TaskWithHisoblanganStatus> {
    return this.tasksService.findOne(id, user);
  }

  @Get(':id/tarix')
  @ApiOperation({ summary: 'Topshiriq tarixi (audit jurnali yozuvlari)' })
  @ApiResponse({
    status: 200,
    description: 'Topshiriqqa oid audit jurnali yozuvlari (eng yangisidan)',
    type: [AuditLog],
  })
  async tarix(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuditLog[]> {
    // `findOne` mavjud bo'lmasa 404, BAJARUVCHI o'ziniki bo'lmagan
    // topshiriqni so'rasa 403 tashlaydi (SUPERADMIN cheklovsiz).
    await this.tasksService.findOne(id, user);
    return this.auditService.findByObject('Tasks', id);
  }

  @Post(':id/tanishish')
  @Roles(Role.BAJARUVCHI)
  @AuditAction('TASK_TANISHILDI')
  @ApiOperation({ summary: 'Topshiriq bilan tanishish / jarayonni boshlash' })
  @ApiResponse({ status: 200, description: 'Holat yangilandi', type: Task })
  tanishish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.tanishish(id, user.userId);
  }

  @Patch(':id/subtasks/:subId')
  @Roles(Role.BAJARUVCHI)
  @AuditAction('TASK_SUBTASK_UPDATED')
  @ApiOperation({ summary: 'Kichik vazifa holatini yangilash' })
  @ApiResponse({
    status: 200,
    description: 'Kichik vazifa yangilandi',
    type: Subtask,
  })
  updateSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('subId', ParseUUIDPipe) subId: string,
    @Body() updateSubtaskDto: UpdateSubtaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Subtask> {
    return this.tasksService.updateSubtask(
      id,
      subId,
      updateSubtaskDto,
      user.userId,
    );
  }

  @Post(':id/bajarildi')
  @Roles(Role.BAJARUVCHI)
  @AuditAction('TASK_BAJARILDI')
  @ApiOperation({ summary: 'Topshiriqni bajarildi deb belgilash' })
  @ApiResponse({
    status: 200,
    description: 'Topshiriq tasdiq kutilmoqda holatiga o‘tkazildi',
    type: Task,
  })
  bajarildi(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.bajarildi(id, user.userId);
  }

  @Post(':id/tasdiqlash')
  @Roles(Role.SUPERADMIN, Role.NAZORAT)
  @AuditAction('TASK_TASDIQLANDI')
  @ApiOperation({ summary: 'Topshiriqni tasdiqlash' })
  @ApiResponse({
    status: 200,
    description: 'Topshiriq qabul qilindi',
    type: Task,
  })
  tasdiqlash(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.tasdiqlash(id, user);
  }

  @Post(':id/qaytarish')
  @Roles(Role.SUPERADMIN, Role.NAZORAT)
  @AuditAction('TASK_QAYTARILDI')
  @ApiOperation({ summary: 'Topshiriqni sabab bilan qaytarish' })
  @ApiResponse({
    status: 200,
    description: 'Topshiriq jarayonga qaytarildi',
    type: Task,
  })
  qaytarish(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() qaytarishDto: QaytarishDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.qaytarish(id, qaytarishDto, user);
  }

  @Post(':id/eskalatsiya')
  @Roles(Role.NAZORAT)
  @AuditAction('TASK_ESCALATED')
  @ApiOperation({ summary: 'Topshiriqni superadminga eskalatsiya qilish' })
  @ApiResponse({
    status: 200,
    description: 'Topshiriq eskalatsiya qilindi',
    type: Task,
  })
  eskalatsiya(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() eskalatsiyaDto: EskalatsiyaDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Task> {
    return this.tasksService.eskalatsiya(id, eskalatsiyaDto, user);
  }

  @Post(':id/bekor-qilish')
  @Roles(Role.SUPERADMIN)
  @AuditAction('TASK_BEKOR_QILINDI')
  @ApiOperation({ summary: 'Topshiriqni bekor qilish' })
  @ApiResponse({
    status: 200,
    description: 'Topshiriq bekor qilindi',
    type: Task,
  })
  bekorQilish(@Param('id', ParseUUIDPipe) id: string): Promise<Task> {
    return this.tasksService.bekorQilish(id);
  }
}
