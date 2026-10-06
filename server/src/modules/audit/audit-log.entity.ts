import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

/**
 * Audit jurnali yozuvi — o'zgarmas (append-only), hech qachon yangilanmaydi
 * yoki o'chirilmaydi. Faqat `AuditService.create()` orqali yaratiladi.
 */
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ type: 'varchar' })
  harakat: string;

  @Column({ type: 'varchar' })
  obyektTuri: string;

  @Column({ type: 'uuid', nullable: true })
  obyektId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  eskiQiymat: unknown;

  @Column({ type: 'jsonb', nullable: true })
  yangiQiymat: unknown;

  @CreateDateColumn()
  createdAt: Date;
}
