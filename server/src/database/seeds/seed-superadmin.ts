import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Role } from '../../common/enums/role.enum';
import { UsersService } from '../../modules/users/users.service';

/**
 * One-off bootstrap seed: creates the initial SUPERADMIN user if none
 * exists yet for the given login. Safe to re-run — it's a no-op once
 * that login is taken (idempotent), since UsersService.create() rejects
 * duplicate logins.
 *
 * Usage: npm run seed:superadmin
 * Reads SUPERADMIN_LOGIN / SUPERADMIN_PASSWORD / SUPERADMIN_ISM_FAMILIYA
 * from .env (see .env.example).
 */
async function bootstrap() {
  const login = process.env.SUPERADMIN_LOGIN;
  const parol = process.env.SUPERADMIN_PASSWORD;
  const ismFamiliya = process.env.SUPERADMIN_ISM_FAMILIYA ?? 'Super Admin';

  if (!login || !parol) {
    throw new Error(
      'SUPERADMIN_LOGIN va SUPERADMIN_PASSWORD .env faylida ko‘rsatilishi shart',
    );
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    const usersService = app.get(UsersService);

    const existing = await usersService.findByLogin(login);
    if (existing) {
      console.log(
        `Superadmin "${login}" allaqachon mavjud, o'tkazib yuborildi.`,
      );
      return;
    }

    await usersService.create({
      ismFamiliya,
      login,
      parol,
      rol: Role.SUPERADMIN,
    });

    console.log(`Superadmin "${login}" muvaffaqiyatli yaratildi.`);
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  console.error('Superadmin seed xatolik bilan tugadi:', error);
  process.exitCode = 1;
});
