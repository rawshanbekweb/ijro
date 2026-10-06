import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSohaDto {
  @ApiProperty({ example: 'Moliya bo‘limi', description: 'Soha nomi' })
  @IsString()
  @IsNotEmpty()
  nomi: string;

  @ApiProperty({ example: 'MB-01', description: 'Soha kodi (unique)' })
  @IsString()
  @IsNotEmpty()
  kodi: string;
}
