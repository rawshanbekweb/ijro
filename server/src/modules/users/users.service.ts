import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { Task } from '../tasks/task.entity';
import { Soha } from '../sohalar/soha.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

const SALT_ROUNDS = 10;

/** PostgreSQL: foreign key cheklovi buzildi (boshqa jadvallar bog'langan). */
const PG_FOREIGN_KEY_VIOLATION = '23503';

const FAOL_TOPSHIRIQ_HOLATDAN_TASHQARI: TaskStatus[] = [
  TaskStatus.QABUL_QILINDI,
  TaskStatus.BEKOR_QILINDI,
];

export type UserWithFaolTopshiriqlarSoni = User & {
  faolTopshiriqlarSoni: number;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Soha)
    private readonly sohaRepository: Repository<Soha>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { parol, sohaId, ...rest } = createUserDto;

    const existing = await this.userRepository.findOne({
      where: { login: rest.login },
    });
    if (existing) {
      throw new ConflictException('Bu login band');
    }

    if (rest.rol === Role.BAJARUVCHI && sohaId) {
      const soha = await this.sohaRepository.findOne({
        where: { id: sohaId },
      });
      if (!soha) {
        throw new BadRequestException('Ko‘rsatilgan soha topilmadi');
      }
    }

    const parolHash = await bcrypt.hash(parol, SALT_ROUNDS);

    const user = this.userRepository.create({
      ...rest,
      sohaId: rest.rol === Role.SUPERADMIN ? null : (sohaId ?? null),
      parolHash,
    });

    return this.userRepository.save(user);
  }

  async findAll(
    filter: FindUsersDto = {},
  ): Promise<UserWithFaolTopshiriqlarSoni[]> {
    const { sohaId, rol } = filter;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)', 'count')
          .from(Task, 'task')
          .where('task.bajaruvchiId = user.id')
          .andWhere('task.status NOT IN (:...faolTopshiriqHolatdanTashqari)', {
            faolTopshiriqHolatdanTashqari: FAOL_TOPSHIRIQ_HOLATDAN_TASHQARI,
          });
      }, 'faolTopshiriqlarSoni');

    if (sohaId) {
      queryBuilder.andWhere('user.sohaId = :sohaId', { sohaId });
    }

    if (rol) {
      queryBuilder.andWhere('user.rol = :rol', { rol });
    }

    const { entities, raw } = await queryBuilder.getRawAndEntities();

    const rawRows = raw as { faolTopshiriqlarSoni: string | null }[];

    return entities.map((entity, index) => {
      const faolTopshiriqlarSoni = Number(
        rawRows[index]?.faolTopshiriqlarSoni ?? 0,
      );
      return Object.assign(entity, { faolTopshiriqlarSoni });
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Foydalanuvchi topilmadi');
    }
    return user;
  }

  /**
   * Looks up a user by login, including `parolHash`, for use in
   * authentication flows (password comparison). The global
   * `ClassSerializerInterceptor` only strips `@Exclude()`d fields from HTTP
   * responses, not from values returned internally between services.
   */
  findByLogin(login: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { login } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    const { parol, sohaId, ...rest } = updateUserDto;

    if (rest.login && rest.login !== user.login) {
      const existing = await this.userRepository.findOne({
        where: { login: rest.login },
      });
      if (existing) {
        throw new ConflictException('Bu login band');
      }
    }

    const rol = rest.rol ?? user.rol;

    if (rol === Role.BAJARUVCHI) {
      const targetSohaId = sohaId ?? user.sohaId;
      if (!targetSohaId) {
        throw new BadRequestException(
          'rol=BAJARUVCHI bo‘lganda sohaId majburiy',
        );
      }
      const soha = await this.sohaRepository.findOne({
        where: { id: targetSohaId },
      });
      if (!soha) {
        throw new BadRequestException('Ko‘rsatilgan soha topilmadi');
      }
      user.sohaId = targetSohaId;
    }

    if (rol === Role.SUPERADMIN) {
      if (sohaId) {
        throw new BadRequestException(
          'rol=SUPERADMIN bo‘lganda sohaId berilmasligi kerak',
        );
      }
      user.sohaId = null;
    }

    Object.assign(user, rest);

    if (parol) {
      user.parolHash = await bcrypt.hash(parol, SALT_ROUNDS);
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    try {
      await this.userRepository.remove(user);
    } catch (xato: unknown) {
      if (
        xato instanceof QueryFailedError &&
        (xato.driverError as { code?: string } | undefined)?.code ===
          PG_FOREIGN_KEY_VIOLATION
      ) {
        throw new ConflictException(
          'Foydalanuvchiga topshiriq yoki boshqa yozuvlar bog‘langan — o‘chirish o‘rniga nofaol qiling',
        );
      }
      throw xato;
    }
  }
}
