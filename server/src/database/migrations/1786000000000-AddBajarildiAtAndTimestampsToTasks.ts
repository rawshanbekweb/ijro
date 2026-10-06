import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBajarildiAtAndTimestampsToTasks1786000000000 implements MigrationInterface {
  name = 'AddBajarildiAtAndTimestampsToTasks1786000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" ADD "bajarildiAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    // Mavjud qatorlar uchun qiymatlar audit jurnalidan tiklanadi:
    // bajarildiAt — oxirgi TASK_BAJARILDI yozuvi, createdAt — TASK_CREATED.
    await queryRunner.query(`
      UPDATE "tasks" t SET "bajarildiAt" = a."vaqt"
      FROM (
        SELECT "obyektId", MAX("createdAt") AS "vaqt"
        FROM "audit_logs"
        WHERE "obyektTuri" = 'Tasks' AND "harakat" = 'TASK_BAJARILDI'
        GROUP BY "obyektId"
      ) a
      WHERE a."obyektId" = t."id"
        AND t."status" IN ('TASDIQ_KUTILMOQDA', 'QABUL_QILINDI')
    `);
    await queryRunner.query(`
      UPDATE "tasks" t SET "createdAt" = a."vaqt", "updatedAt" = a."vaqt"
      FROM (
        SELECT "obyektId", MIN("createdAt") AS "vaqt"
        FROM "audit_logs"
        WHERE "obyektTuri" = 'Tasks' AND "harakat" = 'TASK_CREATED'
        GROUP BY "obyektId"
      ) a
      WHERE a."obyektId" = t."id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "createdAt"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "bajarildiAt"`);
  }
}
