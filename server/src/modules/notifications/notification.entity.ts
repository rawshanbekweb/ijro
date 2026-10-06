import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationTuri } from '../../common/enums/notification-turi.enum';
import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  taskId: string | null;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task: Task | null;

  @Column({ type: 'enum', enum: NotificationTuri })
  turi: NotificationTuri;

  @Column({ type: 'varchar' })
  matn: string;

  @Column({ type: 'boolean', default: false })
  oqildimi: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
