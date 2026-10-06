import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateSubtaskDto {
  @ApiProperty({ example: true, description: 'Kichik vazifa bajarildimi' })
  @IsBoolean()
  bajarildi: boolean;
}
