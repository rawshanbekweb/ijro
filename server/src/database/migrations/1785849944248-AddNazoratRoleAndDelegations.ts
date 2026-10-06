import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNazoratRoleAndDelegations1785849944248 implements MigrationInterface {
  name = 'AddNazoratRoleAndDelegations1785849944248';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."delegations_maksimalmuhimlik_enum" AS ENUM('ODDIY', 'MUHIM')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."delegations_holat_enum" AS ENUM('FAOL', 'BEKOR_QILINGAN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "delegations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nazoratId" uuid NOT NULL, "beruvchiId" uuid NOT NULL, "ruxsatEtilganSohalar" uuid array NOT NULL, "maksimalMuhimlik" "public"."delegations_maksimalmuhimlik_enum" NOT NULL DEFAULT 'ODDIY', "maksimalMuddatKun" integer NOT NULL, "obyektTopshiriqRuxsat" boolean NOT NULL DEFAULT false, "holat" "public"."delegations_holat_enum" NOT NULL DEFAULT 'FAOL', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_01f9fbbc9b3bf52236a4e951b19" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_rol_enum" ADD VALUE 'NAZORAT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "delegations" ADD CONSTRAINT "FK_e65e2bcbd04c6c88a2828125af9" FOREIGN KEY ("nazoratId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "delegations" ADD CONSTRAINT "FK_46f249a36745e670c35c19da231" FOREIGN KEY ("beruvchiId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "delegations" DROP CONSTRAINT "FK_46f249a36745e670c35c19da231"`,
    );
    await queryRunner.query(
      `ALTER TABLE "delegations" DROP CONSTRAINT "FK_e65e2bcbd04c6c88a2828125af9"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_rol_enum_old" AS ENUM('SUPERADMIN', 'BAJARUVCHI')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "rol" TYPE "public"."users_rol_enum_old" USING "rol"::"text"::"public"."users_rol_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_rol_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_rol_enum_old" RENAME TO "users_rol_enum"`,
    );
    await queryRunner.query(`DROP TABLE "delegations"`);
    await queryRunner.query(`DROP TYPE "public"."delegations_holat_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."delegations_maksimalmuhimlik_enum"`,
    );
  }
}
