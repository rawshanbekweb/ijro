import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TaskMuhimlik } from '../../../common/enums/task-muhimlik.enum';
import { TaskStatus } from '../../../common/enums/task-status.enum';

/**
 * Query filters for GET /tasks. Only honored for SUPERADMIN — for
 * BAJARUVCHI, `TasksService.findAll()` ignores `bajaruvchiId` entirely and
 * forces it to the caller's own id from the JWT.
 */
export class FindTasksQueryDto {
  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ enum: TaskMuhimlik })
  @IsOptional()
  @IsEnum(TaskMuhimlik)
  muhimlik?: TaskMuhimlik;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sohaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bajaruvchiId?: string;
}
