import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EskalatsiyaDto {
  @ApiProperty({
    example: 'Bajaruvchi muddatga ulgurmaydi, superadmin e’tiboriga',
  })
  @IsString()
  @IsNotEmpty()
  izoh: string;
}
