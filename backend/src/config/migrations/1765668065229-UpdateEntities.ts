import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEntities1765668065229 implements MigrationInterface {
    name = 'UpdateEntities1765668065229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "organization"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "counsel"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "filedDate"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "filedBy"`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "primaryContactName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "primaryContactEmail" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "primaryContactPhone" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "attorneyName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "attorneyBarNumber" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "attorneyFirm" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "attorneyPhone" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "attorneyEmail" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "filingDate" date`);
        await queryRunner.query(`ALTER TABLE "docket_entries" ADD "docketNumber" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "docket_entries" ADD "dateFiled" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "docket_entries" ADD "documentTitle" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "docket_entries" ADD "documentUrl" character varying(2048)`);
        await queryRunner.query(`ALTER TYPE "public"."parties_role_enum" RENAME TO "parties_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."parties_role_enum" AS ENUM('plaintiff', 'defendant', 'petitioner', 'respondent', 'appellant', 'appellee', 'third_party', 'intervenor', 'witness', 'expert')`);
        await queryRunner.query(`ALTER TABLE "parties" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "parties" ALTER COLUMN "role" TYPE "public"."parties_role_enum" USING "role"::"text"::"public"."parties_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."parties_role_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."parties_type_enum" RENAME TO "parties_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."parties_type_enum" AS ENUM('individual', 'corporation', 'government', 'organization', 'other')`);
        await queryRunner.query(`ALTER TABLE "parties" ALTER COLUMN "type" TYPE "public"."parties_type_enum" USING "type"::"text"::"public"."parties_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."parties_type_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_05d4416c8118cf287db96bbf75" ON "parties" ("role") `);
        await queryRunner.query(`CREATE INDEX "IDX_d97ebd075d322f1596ebdf07e1" ON "parties" ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_13222b1c10303a190d5112c1fb" ON "parties" ("caseId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_13222b1c10303a190d5112c1fb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d97ebd075d322f1596ebdf07e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_05d4416c8118cf287db96bbf75"`);
        await queryRunner.query(`CREATE TYPE "public"."parties_type_enum_old" AS ENUM('individual', 'corporation', 'government', 'organization', 'other')`);
        await queryRunner.query(`ALTER TABLE "parties" ALTER COLUMN "type" TYPE "public"."parties_type_enum_old" USING "type"::"text"::"public"."parties_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."parties_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."parties_type_enum_old" RENAME TO "parties_type_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."parties_role_enum_old" AS ENUM('plaintiff', 'defendant', 'petitioner', 'respondent', 'appellant', 'appellee', 'third_party', 'intervenor', 'witness', 'expert')`);
        await queryRunner.query(`ALTER TABLE "parties" ALTER COLUMN "role" TYPE "public"."parties_role_enum_old" USING "role"::"text"::"public"."parties_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "parties" ALTER COLUMN "role" SET DEFAULT 'plaintiff'`);
        await queryRunner.query(`DROP TYPE "public"."parties_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."parties_role_enum_old" RENAME TO "parties_role_enum"`);
        await queryRunner.query(`ALTER TABLE "docket_entries" DROP COLUMN "documentUrl"`);
        await queryRunner.query(`ALTER TABLE "docket_entries" DROP COLUMN "documentTitle"`);
        await queryRunner.query(`ALTER TABLE "docket_entries" DROP COLUMN "dateFiled"`);
        await queryRunner.query(`ALTER TABLE "docket_entries" DROP COLUMN "docketNumber"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "filingDate"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "attorneyEmail"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "attorneyPhone"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "attorneyFirm"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "attorneyBarNumber"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "attorneyName"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "primaryContactPhone"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "primaryContactEmail"`);
        await queryRunner.query(`ALTER TABLE "parties" DROP COLUMN "primaryContactName"`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "filedBy" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "filedDate" date`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "counsel" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "parties" ADD "organization" character varying(255)`);
    }

}
