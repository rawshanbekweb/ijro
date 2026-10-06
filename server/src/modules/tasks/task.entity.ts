import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskMuhimlik } from '../../common/enums/task-muhimlik.enum';
import { TaskStatus } from '../../common/enums/task-status.enum';
import { Soha } from '../sohalar/soha.entity';
import { User } from '../users/user.entity';
import { Subtask } from './subtask.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  sarlavha: string;

  @Column({ type: 'text', nullable: true })
  tavsif: string | null;

  @Column({ type: 'uuid' })
  muallifId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'muallifId' })
  muallif: User;

  @Column({ type: 'uuid' })
  yaratuvchiId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'yaratuvchiId' })
  yaratuvchi: User;

  @Column({ type: 'uuid' })
  bajaruvchiId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'bajaruvchiId' })
  bajaruvchi: User;

  @Column({ type: 'uuid' })
  sohaId: string;

  @ManyToOne(() => Soha)
  @JoinColumn({ name: 'sohaId' })
  soha: Soha;

  @Column({ type: 'enum', enum: TaskMuhimlik, default: TaskMuhimlik.ODDIY })
  muhimlik: TaskMuhimlik;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.YARATILDI })
  status: TaskStatus;

  @Column({ type: 'timestamp' })
  muddat: Date;

  @Column({ type: 'timestamp', nullable: true })
  tanishildiAt: Date | null;

  @Column({ type: 'text', nullable: true })
  qaytarishSababi: string | null;

  /**
   * Bajaruvchi topshiriqni oxirgi marta "bajarildi" deb topshirgan vaqt —
   * "o'z vaqtida qabul qilindi"ni aniqlash uchun ishlatiladi.
   */
  @Column({ type: 'timestamp', nullable: true })
  bajarildiAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Subtask, (subtask) => subtask.task, {
    cascade: ['insert'],
  })
  subtasklar: Subtask[];
}
