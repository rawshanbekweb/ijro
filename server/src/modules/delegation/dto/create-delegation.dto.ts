import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { DelegationMuhimlik } from '../../../common/enums/delegation-muhimlik.enum';

export class CreateDelegationDto {
  @ApiProperty({ description: 'NAZORAT foydalanuvchi ID' })
  @IsUUID()
  nazoratId: string;

  @ApiProperty({ description: 'Huquq beruvchi (beruvchi) foydalanuvchi ID' })
  @IsUUID()
  beruvchiId: string;

  @ApiProperty({
    description: 'Ruxsat etilgan sohalar ID ro‘yxati',
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ruxsatEtilganSohalar: string[];

  @ApiPropertyOptional({
    enum: DelegationMuhimlik,
    default: DelegationMuhimlik.ODDIY,
  })
  @IsOptional()
  @IsEnum(DelegationMuhimlik)
  maksimalMuhimlik?: DelegationMuhimlik;

  @ApiProperty({ description: 'Maksimal muddat (kunlarda)', example: 7 })
  @IsInt()
  @Min(1)
  maksimalMuddatKun: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  obyektTopshiriqRuxsat?: boolean;
}
