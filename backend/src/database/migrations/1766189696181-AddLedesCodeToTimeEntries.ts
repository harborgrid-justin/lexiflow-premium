import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLedesCodeToTimeEntries1766189696181 implements MigrationInterface {
    name = 'AddLedesCodeToTimeEntries1766189696181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "config"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "performance"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "usage_count"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "last_used"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "configuration"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "provider" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "configuration" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "usage_count" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "last_used" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "config" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "status" character varying(20) NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "performance" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "performance"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "config"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "last_used"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "usage_count"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "active"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "configuration"`);
        await queryRunner.query(`ALTER TABLE "ai_models" DROP COLUMN "provider"`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "provider" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "configuration" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "last_used" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "usage_count" bigint NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "status" character varying(20) NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "performance" jsonb`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "config" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_models" ADD "description" text`);
    }

}
