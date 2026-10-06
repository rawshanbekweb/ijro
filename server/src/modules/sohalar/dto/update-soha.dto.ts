import { PartialType } from '@nestjs/swagger';
import { CreateSohaDto } from './create-soha.dto';

export class UpdateSohaDto extends PartialType(CreateSohaDto) {}
