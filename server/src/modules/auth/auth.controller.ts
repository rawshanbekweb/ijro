import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/user.entity';
import { AuthService, TokenPair } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login va parol orqali tizimga kirish' })
  @ApiResponse({
    status: 200,
    description: 'Access va refresh tokenlar qaytariladi',
  })
  login(@Body() loginDto: LoginDto): Promise<TokenPair> {
    return this.authService.login(loginDto);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh token orqali yangi tokenlar olish' })
  @ApiResponse({
    status: 200,
    description: 'Yangi access va refresh tokenlar qaytariladi',
  })
  refresh(
    @Body() _refreshDto: RefreshDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TokenPair> {
    return this.authService.refresh(user.userId);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Joriy autentifikatsiya qilingan foydalanuvchi' })
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi ma’lumotlari',
    type: User,
  })
  me(@CurrentUser() user: AuthenticatedUser): Promise<User> {
    return this.authService.me(user.userId);
  }
}
