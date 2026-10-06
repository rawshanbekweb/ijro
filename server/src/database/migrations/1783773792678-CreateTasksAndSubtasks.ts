import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksAndSubtasks1783773792678 implements MigrationInterface {
  name = 'CreateTasksAndSubtasks1783773792678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_muhimlik_enum" AS ENUM('ODDIY', 'MUHIM', 'SHOSHILINCH')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('YARATILDI', 'YUBORILDI', 'TANISHILDI', 'JARAYONDA', 'TASDIQ_KUTILMOQDA', 'QAYTARILDI', 'QABUL_QILINDI', 'BEKOR_QILINDI')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sarlavha" character varying NOT NULL, "tavsif" text, "muallifId" uuid NOT NULL, "bajaruvchiId" uuid NOT NULL, "sohaId" uuid NOT NULL, "muhimlik" "public"."tasks_muhimlik_enum" NOT NULL DEFAULT 'ODDIY', "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'YARATILDI', "muddat" TIMESTAMP NOT NULL, "tanishildiAt" TIMESTAMP, "qaytarishSababi" text, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "subtasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "taskId" uuid NOT NULL, "matn" character varying NOT NULL, "bajarildi" boolean NOT NULL DEFAULT false, "tartib" integer NOT NULL, CONSTRAINT "PK_035c1c153f0239ecc95be448d96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_adb6222fe8da8a09cfad8034f7a" FOREIGN KEY ("muallifId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_ac9fe56d23e5be34080109d6973" FOREIGN KEY ("bajaruvchiId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_d67644d13600cd043824d4fb3ac" FOREIGN KEY ("sohaId") REFERENCES "sohalar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "subtasks" ADD CONSTRAINT "FK_bde15cf8f7b07bb4ccad8ef6fa3" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subtasks" DROP CONSTRAINT "FK_bde15cf8f7b07bb4ccad8ef6fa3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_d67644d13600cd043824d4fb3ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_ac9fe56d23e5be34080109d6973"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_adb6222fe8da8a09cfad8034f7a"`,
    );
    await queryRunner.query(`DROP TABLE "subtasks"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_muhimlik_enum"`);
  }
}
