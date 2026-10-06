import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class FindUsersDto {
  @ApiPropertyOptional({ description: 'Soha bo‘yicha filtr' })
  @IsOptional()
  @IsUUID()
  sohaId?: string;

  @ApiPropertyOptional({ enum: Role, description: 'Rol bo‘yicha filtr' })
  @IsOptional()
  @IsEnum(Role)
  rol?: Role;
}
