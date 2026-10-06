import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEskalatsiyaToNotificationTuri1785850700607 implements MigrationInterface {
  name = 'AddEskalatsiyaToNotificationTuri1785850700607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_turi_enum" ADD VALUE 'ESKALATSIYA'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_turi_enum_old" AS ENUM('YANGI_TOPSHIRIQ', 'MUDDAT_3_KUN', 'MUDDAT_1_KUN', 'MUDDAT_2_SOAT', 'MUDDAT_OTDI', 'QAYTARILDI', 'TASDIQLANDI')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "turi" TYPE "public"."notifications_turi_enum_old" USING "turi"::"text"::"public"."notifications_turi_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_turi_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_turi_enum_old" RENAME TO "notifications_turi_enum"`,
    );
  }
}
