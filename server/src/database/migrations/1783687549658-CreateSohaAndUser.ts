import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSohaAndUser1783687549658 implements MigrationInterface {
  name = 'CreateSohaAndUser1783687549658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_rol_enum" AS ENUM('SUPERADMIN', 'BAJARUVCHI')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_holat_enum" AS ENUM('FAOL', 'NOFAOL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ismFamiliya" character varying NOT NULL, "login" character varying NOT NULL, "parolHash" character varying NOT NULL, "rol" "public"."users_rol_enum" NOT NULL, "sohaId" uuid, "lavozim" character varying, "holat" "public"."users_holat_enum" NOT NULL DEFAULT 'FAOL', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sohalar" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nomi" character varying NOT NULL, "kodi" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_452057136d898ca1bbf18eee453" UNIQUE ("kodi"), CONSTRAINT "PK_99509cbda15a08b8d0b0e2d7d16" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_1ac001f0b6055a6a210c219cbb1" FOREIGN KEY ("sohaId") REFERENCES "sohalar"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_1ac001f0b6055a6a210c219cbb1"`,
    );
    await queryRunner.query(`DROP TABLE "sohalar"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_holat_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_rol_enum"`);
  }
}
