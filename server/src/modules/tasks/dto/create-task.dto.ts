import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { TaskMuhimlik } from '../../../common/enums/task-muhimlik.enum';
import { CreateSubtaskDto } from './create-subtask.dto';

export class CreateTaskDto {
  @ApiProperty({ example: 'Oylik hisobotni tayyorlash' })
  @IsString()
  @IsNotEmpty()
  sarlavha: string;

  @ApiPropertyOptional({ example: 'Moliyaviy oylik hisobotni tayyorlash' })
  @IsOptional()
  @IsString()
  tavsif?: string;

  @ApiProperty({ description: 'Bajaruvchi foydalanuvchi ID' })
  @IsUUID()
  bajaruvchiId: string;

  @ApiProperty({
    description: 'Soha ID (bajaruvchining sohasiga mos bo‘lishi kerak)',
  })
  @IsUUID()
  sohaId: string;

  @ApiPropertyOptional({ enum: TaskMuhimlik, default: TaskMuhimlik.ODDIY })
  @IsOptional()
  @IsEnum(TaskMuhimlik)
  muhimlik?: TaskMuhimlik;

  @ApiProperty({
    example: '2026-08-01T00:00:00.000Z',
    description: 'Bajarish muddati',
  })
  @IsDateString()
  muddat: string;

  @ApiPropertyOptional({ type: [CreateSubtaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  subtasklar?: CreateSubtaskDto[];
}
