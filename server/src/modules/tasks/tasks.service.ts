import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import {
  ALLOWED_TRANSITIONS,
  TaskStatus,
} from '../../common/enums/task-status.enum';
import { NotificationTuri } from '../../common/enums/notification-turi.enum';
import { Role } from '../../common/enums/role.enum';
import { TaskMuhimlik } from '../../common/enums/task-muhimlik.enum';
import { UserHolat } from '../../common/enums/user-holat.enum';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { DelegationService } from '../delegation/delegation.service';
import { NotificationsService } from '../notifications/notifications.service';
import { User } from '../users/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { EskalatsiyaDto } from './dto/eskalatsiya.dto';
import { FindTasksQueryDto } from './dto/find-tasks-query.dto';
import { QaytarishDto } from './dto/qaytarish.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { Subtask } from './subtask.entity';
import { Task } from './task.entity';
import {
  calculateTaskStatusColor,
  TaskStatusColor,
} from './utils/task-status-color.util';

/**
 * Ro'yxat va bitta topshiriq javoblarida klientga kerak bo'ladigan bog'liq
 * obyektlar (soha nomi, bajaruvchi/muallif/yaratuvchi ismi) — klient ularni
 * ID orqali alohida so'rab o'tirmasligi uchun birga yuklanadi. `User.parolHash`
 * `@Exclude()` tufayli javobga tushmaydi.
 */
const TASK_RELATIONS = {
  subtasklar: true,
  soha: true,
  bajaruvchi: true,
  muallif: true,
  yaratuvchi: true,
} as const;

export interface TaskWithHisoblanganStatus extends Task {
  hisoblanganStatus: TaskStatusColor;
}

/**
 * Muhimlik darajalarining son bilan ifodalangan tartibi (ODDIY < MUHIM <
 * SHOSHILINCH) — delegatsiyaning `maksimalMuhimlik`sini `body.muhimlik`
 * bilan solishtirish uchun kerak. `TaskMuhimlik` va `DelegationMuhimlik`
 * qiymat nomlari mos kelgani uchun bitta umumiy xarita ishlatiladi.
 */
const MUHIMLIK_DARAJASI: Record<string, number> = {
  [TaskMuhimlik.ODDIY]: 0,
  [TaskMuhimlik.MUHIM]: 1,
  [TaskMuhimlik.SHOSHILINCH]: 2,
};

const MILLISEKUND_KUNIDA = 24 * 60 * 60 * 1000;

/** Yakunlangan (boshqa hech qanday amal bajarib bo'lmaydigan) holatlar. */
const YAKUNLANGAN_HOLATLAR: TaskStatus[] = [
  TaskStatus.QABUL_QILINDI,
  TaskStatus.BEKOR_QILINDI,
];

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Subtask)
    private readonly subtaskRepository: Repository<Subtask>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly delegationService: DelegationService,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    user: AuthenticatedUser,
  ): Promise<Task> {
    const { subtasklar, ...rest } = createTaskDto;

    const bajaruvchi = await this.userRepository.findOne({
      where: { id: rest.bajaruvchiId },
    });
    if (!bajaruvchi) {
      throw new BadRequestException('Ko‘rsatilgan bajaruvchi topilmadi');
    }
    if (bajaruvchi.rol !== Role.BAJARUVCHI) {
      throw new BadRequestException(
        'Topshiriqni faqat BAJARUVCHI roldagi foydalanuvchiga berish mumkin',
      );
    }
    if (bajaruvchi.holat !== UserHolat.FAOL) {
      throw new BadRequestException('Ko‘rsatilgan bajaruvchi faol emas');
    }
    if (bajaruvchi.sohaId !== rest.sohaId) {
      throw new BadRequestException(
        'Bajaruvchining sohasi ko‘rsatilgan sohaId bilan mos emas',
      );
    }
    if (new Date(rest.muddat).getTime() <= Date.now()) {
      throw new BadRequestException('Muddat kelajakdagi sana bo‘lishi kerak');
    }

    let yaratuvchiId: string;
    let muallifId: string;

    if (user.rol === Role.NAZORAT) {
      const delegatsiya = await this.delegationService.findFaolRawByNazoratId(
        user.userId,
      );
      if (!delegatsiya) {
        throw new ForbiddenException("Sizda faol huquq yo'q");
      }

      if (!delegatsiya.ruxsatEtilganSohalar.includes(rest.sohaId)) {
        throw new ForbiddenException("Ushbu soha uchun sizda ruxsat yo'q");
      }

      const muhimlik = rest.muhimlik ?? TaskMuhimlik.ODDIY;
      const maksimalMuhimlikDarajasi =
        MUHIMLIK_DARAJASI[delegatsiya.maksimalMuhimlik];
      if (
        muhimlik === TaskMuhimlik.SHOSHILINCH ||
        MUHIMLIK_DARAJASI[muhimlik] > maksimalMuhimlikDarajasi
      ) {
        throw new ForbiddenException(
          "Ushbu muhimlik darajasida topshiriq yaratishga ruxsatingiz yo'q",
        );
      }

      const bugun = new Date();
      const maksimalMuddat = new Date(
        bugun.getTime() + delegatsiya.maksimalMuddatKun * MILLISEKUND_KUNIDA,
      );
      if (new Date(rest.muddat) > maksimalMuddat) {
        throw new BadRequestException(
          `Muddat sizga ruxsat etilgan maksimal ${delegatsiya.maksimalMuddatKun} kundan uzoqroq bo'lishi mumkin emas`,
        );
      }

      yaratuvchiId = user.userId;
      muallifId = delegatsiya.beruvchiId;
    } else {
      yaratuvchiId = user.userId;
      muallifId = user.userId;
    }

    const task = this.taskRepository.create({
      ...rest,
      muallifId,
      yaratuvchiId,
      // create() jo'natishni ham o'z ichiga oladi — alohida "yuborish"
      // endpointi yo'q, shuning uchun topshiriq darhol YUBORILDI holatida yaratiladi.
      status: TaskStatus.YUBORILDI,
      subtasklar: (subtasklar ?? []).map((s) =>
        this.subtaskRepository.create(s),
      ),
    });

    const saqlanganTask = await this.taskRepository.save(task);

    await this.notificationsService.create({
      userId: saqlanganTask.bajaruvchiId,
      taskId: saqlanganTask.id,
      turi: NotificationTuri.YANGI_TOPSHIRIQ,
      matn: `Sizga yangi topshiriq berildi: "${saqlanganTask.sarlavha}"`,
    });

    return saqlanganTask;
  }

  async findAll(
    filter: FindTasksQueryDto,
    user: AuthenticatedUser,
  ): Promise<TaskWithHisoblanganStatus[]> {
    const where: FindOptionsWhere<Task> = {};
    let shartlar: FindOptionsWhere<Task>[];

    if (user.rol === Role.BAJARUVCHI) {
      where.bajaruvchiId = user.userId;
      shartlar = [where];
    } else {
      if (filter.bajaruvchiId) where.bajaruvchiId = filter.bajaruvchiId;
      if (filter.sohaId) where.sohaId = filter.sohaId;
      if (filter.status) where.status = filter.status;
      if (filter.muhimlik) where.muhimlik = filter.muhimlik;
      shartlar =
        user.rol === Role.NAZORAT
          ? await this.nazoratShartlari(where, user.userId)
          : [where];
    }

    if (shartlar.length === 0) {
      return [];
    }

    const tasklar = await this.taskRepository.find({
      where: shartlar,
      relations: TASK_RELATIONS,
      order: { muddat: 'ASC' },
    });

    return tasklar.map((task) => this.withHisoblanganStatus(task));
  }

  async findOne(
    id: string,
    user: AuthenticatedUser,
  ): Promise<TaskWithHisoblanganStatus> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: TASK_RELATIONS,
    });
    if (!task) {
      throw new NotFoundException('Topshiriq topilmadi');
    }
    if (user.rol === Role.BAJARUVCHI) {
      this.assertOwnership(task, user.userId);
    }
    if (user.rol === Role.NAZORAT) {
      await this.assertNazoratDoirasida(task, user.userId);
    }
    return this.withHisoblanganStatus(task);
  }

  /**
   * NAZORAT ko'ra oladigan topshiriqlar: o'zi yaratganlari va faol
   * delegatsiyasidagi sohalarga tegishlilari. `where`dagi filtrlar har ikki
   * shartga qo'llanadi (TypeORM'da massiv `where` — OR).
   */
  private async nazoratShartlari(
    where: FindOptionsWhere<Task>,
    userId: string,
  ): Promise<FindOptionsWhere<Task>[]> {
    const shartlar: FindOptionsWhere<Task>[] = [
      { ...where, yaratuvchiId: userId },
    ];

    const sohalar = await this.nazoratSohalari(userId);
    if (where.sohaId) {
      if (sohalar.includes(where.sohaId as string)) {
        shartlar.push(where);
      }
    } else if (sohalar.length > 0) {
      shartlar.push({ ...where, sohaId: In(sohalar) });
    }

    return shartlar;
  }

  private async nazoratSohalari(userId: string): Promise<string[]> {
    const delegatsiya =
      await this.delegationService.findFaolRawByNazoratId(userId);
    return delegatsiya?.ruxsatEtilganSohalar ?? [];
  }

  private async assertNazoratDoirasida(
    task: Task,
    userId: string,
  ): Promise<void> {
    if (task.yaratuvchiId === userId) {
      return;
    }
    const sohalar = await this.nazoratSohalari(userId);
    if (!sohalar.includes(task.sohaId)) {
      throw new ForbiddenException('Ushbu topshiriq sizning doirangizda emas');
    }
  }

  /**
   * `muddat`/`status`/`tanishildiAt` asosida so'rov vaqtida hisoblanadigan
   * "hisoblanganStatus" (rang) maydonini javobga qo'shadi. Bu maydon
   * bazaga saqlanmaydi — faqat javob shakllantirishda hosil qilinadi.
   */
  private withHisoblanganStatus(task: Task): TaskWithHisoblanganStatus {
    return {
      ...task,
      hisoblanganStatus: calculateTaskStatusColor(
        task.muddat,
        task.status,
        task.tanishildiAt,
        task.bajarildiAt,
      ),
    };
  }

  async tanishish(id: string, userId: string): Promise<Task> {
    const task = await this.findRaw(id);
    this.assertOwnership(task, userId);

    let target: TaskStatus;
    if (task.status === TaskStatus.YUBORILDI) {
      target = TaskStatus.TANISHILDI;
    } else if (task.status === TaskStatus.TANISHILDI) {
      target = TaskStatus.JARAYONDA;
    } else {
      throw new ConflictException(
        `"${task.status}" holatida tanishish amalini bajarib bo‘lmaydi`,
      );
    }
    this.assertTransition(task.status, target);

    task.status = target;
    task.tanishildiAt ??= new Date();

    return this.taskRepository.save(task);
  }

  async updateSubtask(
    taskId: string,
    subId: string,
    dto: UpdateSubtaskDto,
    userId: string,
  ): Promise<Subtask> {
    const task = await this.findRaw(taskId);
    this.assertOwnership(task, userId);

    const subtask = await this.subtaskRepository.findOne({
      where: { id: subId, taskId },
    });
    if (!subtask) {
      throw new NotFoundException('Kichik vazifa topilmadi');
    }

    subtask.bajarildi = dto.bajarildi;
    return this.subtaskRepository.save(subtask);
  }

  async bajarildi(id: string, userId: string): Promise<Task> {
    const task = await this.findRaw(id);
    this.assertOwnership(task, userId);
    this.assertTransition(task.status, TaskStatus.TASDIQ_KUTILMOQDA);

    task.status = TaskStatus.TASDIQ_KUTILMOQDA;
    task.bajarildiAt = new Date();
    return this.taskRepository.save(task);
  }

  async tasdiqlash(id: string, user: AuthenticatedUser): Promise<Task> {
    const task = await this.findRaw(id);

    if (user.rol === Role.NAZORAT && task.yaratuvchiId !== user.userId) {
      throw new ForbiddenException(
        'Bu topshiriqni faqat superadmin tasdiqlay oladi',
      );
    }

    this.assertTransition(task.status, TaskStatus.QABUL_QILINDI);

    task.status = TaskStatus.QABUL_QILINDI;
    const saqlanganTask = await this.taskRepository.save(task);

    await this.notificationsService.create({
      userId: saqlanganTask.bajaruvchiId,
      taskId: saqlanganTask.id,
      turi: NotificationTuri.TASDIQLANDI,
      matn: `"${saqlanganTask.sarlavha}" topshirig‘ingiz tasdiqlandi`,
    });

    return saqlanganTask;
  }

  async qaytarish(
    id: string,
    dto: QaytarishDto,
    user: AuthenticatedUser,
  ): Promise<Task> {
    const task = await this.findRaw(id);

    if (user.rol === Role.NAZORAT && task.yaratuvchiId !== user.userId) {
      throw new ForbiddenException(
        'Bu topshiriqni faqat superadmin qaytara oladi',
      );
    }

    // Faqat TASDIQ_KUTILMOQDA'dan qaytarish mumkin. Umumiy ALLOWED_TRANSITIONS
    // xaritasida JARAYONDA TANISHILDI'dan ham erishiladigan holat (tanishish
    // amalining ikkinchi bosqichi), shuning uchun bu yerda manba holatini
    // aniq tekshirib, ikki amal bir-birining o'rnini bosishining oldini olamiz.
    if (task.status !== TaskStatus.TASDIQ_KUTILMOQDA) {
      throw new ConflictException(
        `"${task.status}" holatida qaytarish amalini bajarib bo‘lmaydi`,
      );
    }
    this.assertTransition(task.status, TaskStatus.JARAYONDA);

    task.status = TaskStatus.JARAYONDA;
    task.qaytarishSababi = dto.sabab;
    const saqlanganTask = await this.taskRepository.save(task);

    await this.notificationsService.create({
      userId: saqlanganTask.bajaruvchiId,
      taskId: saqlanganTask.id,
      turi: NotificationTuri.QAYTARILDI,
      matn: `"${saqlanganTask.sarlavha}" topshirig‘ingiz qaytarildi: ${dto.sabab}`,
    });

    return saqlanganTask;
  }

  async eskalatsiya(
    id: string,
    dto: EskalatsiyaDto,
    user: AuthenticatedUser,
  ): Promise<Task> {
    const task = await this.findRaw(id);
    await this.assertNazoratDoirasida(task, user.userId);

    if (task.muallifId === user.userId) {
      throw new ForbiddenException('Bu topshiriqni eskalatsiya qila olmaysiz');
    }
    if (YAKUNLANGAN_HOLATLAR.includes(task.status)) {
      throw new ConflictException(
        `"${task.status}" holatidagi topshiriqni eskalatsiya qilib bo‘lmaydi`,
      );
    }

    await this.notificationsService.create({
      userId: task.muallifId,
      taskId: task.id,
      turi: NotificationTuri.ESKALATSIYA,
      matn: `"${task.sarlavha}" topshirig‘i eskalatsiya qilindi: ${dto.izoh}`,
    });

    return task;
  }

  async bekorQilish(id: string): Promise<Task> {
    const task = await this.findRaw(id);
    this.assertTransition(task.status, TaskStatus.BEKOR_QILINDI);

    task.status = TaskStatus.BEKOR_QILINDI;
    return this.taskRepository.save(task);
  }

  private async findRaw(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException('Topshiriq topilmadi');
    }
    return task;
  }

  private assertOwnership(task: Task, userId: string): void {
    if (task.bajaruvchiId !== userId) {
      throw new ForbiddenException('Ushbu topshiriq sizga tegishli emas');
    }
  }

  private assertTransition(current: TaskStatus, target: TaskStatus): void {
    if (!ALLOWED_TRANSITIONS[current].includes(target)) {
      throw new ConflictException(
        `"${current}" holatidan "${target}" holatiga o‘tish mumkin emas`,
      );
    }
  }
}
