import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DelegationHolat } from '../../common/enums/delegation-holat.enum';
import { Delegation } from './delegation.entity';
import { CreateDelegationDto } from './dto/create-delegation.dto';

@Injectable()
export class DelegationService {
  constructor(
    @InjectRepository(Delegation)
    private readonly delegationRepository: Repository<Delegation>,
  ) {}

  async create(dto: CreateDelegationDto): Promise<Delegation> {
    const mavjudFaolDelegatsiya = await this.delegationRepository.findOne({
      where: { nazoratId: dto.nazoratId, holat: DelegationHolat.FAOL },
    });

    if (mavjudFaolDelegatsiya) {
      mavjudFaolDelegatsiya.holat = DelegationHolat.BEKOR_QILINGAN;
      await this.delegationRepository.save(mavjudFaolDelegatsiya);
    }

    const delegatsiya = this.delegationRepository.create(dto);
    return this.delegationRepository.save(delegatsiya);
  }

  async findFaolByNazoratId(nazoratId: string): Promise<Delegation> {
    const delegatsiya = await this.findFaolRawByNazoratId(nazoratId);
    if (!delegatsiya) {
      throw new NotFoundException(
        'Ushbu foydalanuvchi uchun faol delegatsiya topilmadi',
      );
    }
    return delegatsiya;
  }

  /**
   * `findFaolByNazoratId`dan farqli ravishda topilmasa `null` qaytaradi —
   * `TasksService.create()` bu holatni o'zi ForbiddenException'ga aylantiradi.
   */
  findFaolRawByNazoratId(nazoratId: string): Promise<Delegation | null> {
    return this.delegationRepository.findOne({
      where: { nazoratId, holat: DelegationHolat.FAOL },
    });
  }

  async bekorQilish(id: string): Promise<Delegation> {
    const delegatsiya = await this.delegationRepository.findOne({
      where: { id },
    });
    if (!delegatsiya) {
      throw new NotFoundException('Delegatsiya topilmadi');
    }

    delegatsiya.holat = DelegationHolat.BEKOR_QILINGAN;
    return this.delegationRepository.save(delegatsiya);
  }
}
