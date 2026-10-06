import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DelegationHolat } from '../../common/enums/delegation-holat.enum';
import { DelegationMuhimlik } from '../../common/enums/delegation-muhimlik.enum';
import { User } from '../users/user.entity';

@Entity('delegations')
export class Delegation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  nazoratId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'nazoratId' })
  nazorat: User;

  @Column({ type: 'uuid' })
  beruvchiId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'beruvchiId' })
  beruvchi: User;

  @Column({ type: 'uuid', array: true })
  ruxsatEtilganSohalar: string[];

  @Column({
    type: 'enum',
    enum: DelegationMuhimlik,
    default: DelegationMuhimlik.ODDIY,
  })
  maksimalMuhimlik: DelegationMuhimlik;

  @Column({ type: 'int' })
  maksimalMuddatKun: number;

  @Column({ type: 'boolean', default: false })
  obyektTopshiriqRuxsat: boolean;

  @Column({
    type: 'enum',
    enum: DelegationHolat,
    default: DelegationHolat.FAOL,
  })
  holat: DelegationHolat;

  @CreateDateColumn()
  createdAt: Date;
}
