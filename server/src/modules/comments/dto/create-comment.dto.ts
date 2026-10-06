import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Ushbu topshiriq bo‘yicha savolim bor edi' })
  @IsString()
  @IsNotEmpty()
  matn: string;
}
