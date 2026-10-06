import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UserHolat } from '../../common/enums/user-holat.enum';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<TokenPair> {
    const user = await this.usersService.findByLogin(loginDto.login);

    if (!user) {
      throw new UnauthorizedException('Login yoki parol noto‘g‘ri');
    }

    const parolMosligi = await bcrypt.compare(loginDto.parol, user.parolHash);
    if (!parolMosligi) {
      throw new UnauthorizedException('Login yoki parol noto‘g‘ri');
    }

    if (user.holat === UserHolat.NOFAOL) {
      throw new UnauthorizedException('Foydalanuvchi faol emas');
    }

    return this.generateTokens(user);
  }

  async refresh(userId: string): Promise<TokenPair> {
    const user = await this.usersService.findOne(userId).catch(() => null);

    if (!user) {
      throw new UnauthorizedException('Foydalanuvchi topilmadi');
    }

    if (user.holat === UserHolat.NOFAOL) {
      throw new UnauthorizedException('Foydalanuvchi faol emas');
    }

    return this.generateTokens(user);
  }

  me(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  private generateTokens(user: User): TokenPair {
    const payload: JwtPayload = {
      sub: user.id,
      rol: user.rol,
      sohaId: user.sohaId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      expiresIn: this.configService.getOrThrow<string>(
        'jwt.accessExpires',
      ) as StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      expiresIn: this.configService.getOrThrow<string>(
        'jwt.refreshExpires',
      ) as StringValue,
    });

    return { accessToken, refreshToken };
  }
}
