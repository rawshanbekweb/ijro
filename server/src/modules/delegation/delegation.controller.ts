import {
  Body,
  Controller,
  ForbiddenException,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { DelegationService } from './delegation.service';
import { Delegation } from './delegation.entity';
import { CreateDelegationDto } from './dto/create-delegation.dto';

@ApiTags('Delegation')
@ApiBearerAuth()
@Controller('delegation')
export class DelegationController {
  constructor(private readonly delegationService: DelegationService) {}

  @Post()
  @Roles(Role.SUPERADMIN)
  @ApiOperation({
    summary: 'NAZORAT foydalanuvchisiga yangi delegatsiya (huquq) berish',
    description:
      'Agar shu nazoratId uchun avvaldan FAOL delegatsiya mavjud bo‘lsa, ' +
      'u avtomatik ravishda BEKOR_QILINGAN holatiga o‘tkaziladi, so‘ng yangisi yaratiladi.',
  })
  @ApiResponse({
    status: 201,
    description: 'Delegatsiya yaratildi',
    type: Delegation,
  })
  create(@Body() dto: CreateDelegationDto): Promise<Delegation> {
    return this.delegationService.create(dto);
  }

  @Get(':nazoratId')
  @ApiOperation({
    summary: 'Nazoratchi uchun joriy FAOL delegatsiyani olish',
    description:
      'SUPERADMIN istalgan nazoratId uchun so‘rashi mumkin. NAZORAT faqat ' +
      'o‘zining nazoratId’sini so‘rashi mumkin.',
  })
  @ApiResponse({
    status: 200,
    description: 'Faol delegatsiya',
    type: Delegation,
  })
  findFaol(
    @Param('nazoratId', ParseUUIDPipe) nazoratId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Delegation> {
    const ozinikiniSoramoqda =
      user.rol === Role.NAZORAT && user.userId === nazoratId;

    if (user.rol !== Role.SUPERADMIN && !ozinikiniSoramoqda) {
      throw new ForbiddenException(
        'Ushbu amalni bajarish uchun ruxsatingiz yo‘q',
      );
    }

    return this.delegationService.findFaolByNazoratId(nazoratId);
  }

  @Patch(':id/bekor-qilish')
  @Roles(Role.SUPERADMIN)
  @ApiOperation({ summary: 'Delegatsiyani bekor qilish' })
  @ApiResponse({
    status: 200,
    description: 'Delegatsiya bekor qilindi',
    type: Delegation,
  })
  bekorQilish(@Param('id', ParseUUIDPipe) id: string): Promise<Delegation> {
    return this.delegationService.bekorQilish(id);
  }
}
