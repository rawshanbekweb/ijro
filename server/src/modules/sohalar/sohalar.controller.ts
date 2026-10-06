import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateSohaDto } from './dto/create-soha.dto';
import { UpdateSohaDto } from './dto/update-soha.dto';
import { Soha } from './soha.entity';
import { SohalarService } from './sohalar.service';

@ApiTags('Sohalar')
@ApiBearerAuth()
@Controller('sohalar')
export class SohalarController {
  constructor(private readonly sohalarService: SohalarService) {}

  @Post()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Yangi soha yaratish' })
  @ApiResponse({ status: 201, description: 'Soha yaratildi', type: Soha })
  create(@Body() createSohaDto: CreateSohaDto): Promise<Soha> {
    return this.sohalarService.create(createSohaDto);
  }

  @Get()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Barcha sohalar ro‘yxati' })
  @ApiResponse({ status: 200, description: 'Sohalar ro‘yxati', type: [Soha] })
  findAll(): Promise<Soha[]> {
    return this.sohalarService.findAll();
  }

  @Get(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Bitta sohani olish' })
  @ApiResponse({ status: 200, description: 'Soha topildi', type: Soha })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Soha> {
    return this.sohalarService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Sohani yangilash' })
  @ApiResponse({ status: 200, description: 'Soha yangilandi', type: Soha })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSohaDto: UpdateSohaDto,
  ): Promise<Soha> {
    return this.sohalarService.update(id, updateSohaDto);
  }

  @Delete(':id')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Sohani o‘chirish' })
  @ApiResponse({ status: 200, description: 'Soha o‘chirildi' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.sohalarService.remove(id);
  }
}
