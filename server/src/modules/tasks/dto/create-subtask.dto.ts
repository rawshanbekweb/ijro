import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateSubtaskDto {
  @ApiProperty({ example: 'Ma’lumotlarni yig‘ish' })
  @IsString()
  @IsNotEmpty()
  matn: string;

  @ApiProperty({ example: 1, description: 'Tartib raqami' })
  @IsInt()
  @Min(0)
  tartib: number;
}
