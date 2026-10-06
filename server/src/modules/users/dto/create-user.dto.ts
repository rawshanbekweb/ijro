import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';
import { UserHolat } from '../../../common/enums/user-holat.enum';
import { SohaIdRolgaMos } from '../../../common/validators/soha-id-rolga-mos.validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Aliyev Vali Aliyevich' })
  @IsString()
  @IsNotEmpty()
  ismFamiliya: string;

  @ApiProperty({ example: 'valiyev.a' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({ example: 'StrongPass123', minLength: 6 })
  @IsString()
  @MinLength(6)
  parol: string;

  @ApiProperty({ enum: Role, example: Role.BAJARUVCHI })
  @IsEnum(Role)
  rol: Role;

  @ApiPropertyOptional({
    description:
      'rol=BAJARUVCHI bo‘lsa majburiy, rol=SUPERADMIN bo‘lsa berilmasligi kerak',
  })
  @SohaIdRolgaMos()
  sohaId?: string;

  @ApiPropertyOptional({ example: 'Bosh mutaxassis' })
  @IsOptional()
  @IsString()
  lavozim?: string;

  @ApiPropertyOptional({ enum: UserHolat, default: UserHolat.FAOL })
  @IsOptional()
  @IsEnum(UserHolat)
  holat?: UserHolat;
}
