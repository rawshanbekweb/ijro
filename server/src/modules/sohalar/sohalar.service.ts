import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserHolat } from '../../common/enums/user-holat.enum';
import { User } from '../users/user.entity';
import { CreateSohaDto } from './dto/create-soha.dto';
import { UpdateSohaDto } from './dto/update-soha.dto';
import { Soha } from './soha.entity';

@Injectable()
export class SohalarService {
  constructor(
    @InjectRepository(Soha)
    private readonly sohaRepository: Repository<Soha>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createSohaDto: CreateSohaDto): Promise<Soha> {
    const existing = await this.sohaRepository.findOne({
      where: { kodi: createSohaDto.kodi },
    });
    if (existing) {
      throw new ConflictException('Bu kodga ega soha allaqachon mavjud');
    }

    const soha = this.sohaRepository.create(createSohaDto);
    return this.sohaRepository.save(soha);
  }

  findAll(): Promise<Soha[]> {
    return this.sohaRepository.find();
  }

  async findOne(id: string): Promise<Soha> {
    const soha = await this.sohaRepository.findOne({ where: { id } });
    if (!soha) {
      throw new NotFoundException('Soha topilmadi');
    }
    return soha;
  }

  async update(id: string, updateSohaDto: UpdateSohaDto): Promise<Soha> {
    const soha = await this.findOne(id);

    if (updateSohaDto.kodi && updateSohaDto.kodi !== soha.kodi) {
      const existing = await this.sohaRepository.findOne({
        where: { kodi: updateSohaDto.kodi },
      });
      if (existing) {
        throw new ConflictException('Bu kodga ega soha allaqachon mavjud');
      }
    }

    Object.assign(soha, updateSohaDto);
    return this.sohaRepository.save(soha);
  }

  async remove(id: string): Promise<void> {
    const soha = await this.findOne(id);

    const faolXodimlarSoni = await this.userRepository.count({
      where: { sohaId: soha.id, holat: UserHolat.FAOL },
    });

    if (faolXodimlarSoni > 0) {
      throw new ConflictException(
        'Sohada faol xodimlar mavjud, avval ularni boshqa sohaga o‘tkazing yoki nofaol qiling',
      );
    }

    await this.sohaRepository.remove(soha);
  }
}
