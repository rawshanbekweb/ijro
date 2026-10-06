import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../common/enums/role.enum';
import { UserHolat } from '../../common/enums/user-holat.enum';
import { Soha } from '../sohalar/soha.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  ismFamiliya: string;

  @Column({ type: 'varchar', unique: true })
  login: string;

  @Exclude()
  @Column({ type: 'varchar' })
  parolHash: string;

  @Column({ type: 'enum', enum: Role })
  rol: Role;

  @Column({ type: 'uuid', nullable: true })
  sohaId: string | null;

  @ManyToOne(() => Soha, (soha) => soha.xodimlar, { nullable: true })
  @JoinColumn({ name: 'sohaId' })
  soha: Soha | null;

  @Column({ type: 'varchar', nullable: true })
  lavozim: string | null;

  @Column({ type: 'enum', enum: UserHolat, default: UserHolat.FAOL })
  holat: UserHolat;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
