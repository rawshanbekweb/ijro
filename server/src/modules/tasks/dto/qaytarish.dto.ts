import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class QaytarishDto {
  @ApiProperty({ example: 'Hisobotda xatoliklar bor, qayta ishlang' })
  @IsString()
  @IsNotEmpty()
  sabab: string;
}
