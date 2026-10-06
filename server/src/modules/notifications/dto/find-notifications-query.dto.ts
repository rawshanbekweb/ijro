import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FindNotificationsQueryDto {
  @ApiPropertyOptional({
    description: 'O‘qilgan/o‘qilmagan bildirishnomalar bo‘yicha filtr',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  oqildimi?: boolean;
}
