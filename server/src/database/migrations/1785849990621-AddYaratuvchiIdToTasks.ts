import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddYaratuvchiIdToTasks1785849990621 implements MigrationInterface {
  name = 'AddYaratuvchiIdToTasks1785849990621';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ustun avval nullable qo'shiladi, so'ng mavjud qatorlar uchun
    // yaratuvchiId = muallifId qilib to'ldiriladi (bu o'zgarishgacha
    // topshiriqni yaratgan va muallif sifatida ko'rsatilgan foydalanuvchi
    // bir xil edi), va shundan keyingina NOT NULL qilib belgilanadi.
    await queryRunner.query(`ALTER TABLE "tasks" ADD "yaratuvchiId" uuid`);
    await queryRunner.query(
      `UPDATE "tasks" SET "yaratuvchiId" = "muallifId" WHERE "yaratuvchiId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "yaratuvchiId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_825627fd7b074e3eb0193acf1eb" FOREIGN KEY ("yaratuvchiId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_825627fd7b074e3eb0193acf1eb"`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "yaratuvchiId"`);
  }
}
