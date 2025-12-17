import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWarRoomTables1765997144258 implements MigrationInterface {
    name = 'AddWarRoomTables1765997144258'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "advisors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying, "firm" character varying, "specialty" character varying, "caseId" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4baf808487b3dcc389087c9cdeb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."experts_experttype_enum" AS ENUM('Technical', 'Medical', 'Financial', 'Forensic', 'Industry', 'Other')`);
        await queryRunner.query(`CREATE TABLE "experts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "expertType" "public"."experts_experttype_enum" NOT NULL DEFAULT 'Other', "email" character varying NOT NULL, "phone" character varying, "hourlyRate" numeric(10,2), "credentials" character varying, "caseId" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8ecb9ec7e8b977b177fde797e6a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "case_strategies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "caseId" character varying NOT NULL, "objective" text, "approach" text, "keyArguments" text, "notes" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_021386ebf669a225fe043ad8070" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "case_strategies"`);
        await queryRunner.query(`DROP TABLE "experts"`);
        await queryRunner.query(`DROP TYPE "public"."experts_experttype_enum"`);
        await queryRunner.query(`DROP TABLE "advisors"`);
    }

}
