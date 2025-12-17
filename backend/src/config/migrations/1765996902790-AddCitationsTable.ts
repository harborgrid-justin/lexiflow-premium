import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCitationsTable1765996902790 implements MigrationInterface {
    name = 'AddCitationsTable1765996902790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "citations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "citation" character varying NOT NULL, "court" character varying NOT NULL, "year" integer NOT NULL, "title" character varying, "caseId" character varying, "documentId" character varying, "status" character varying NOT NULL DEFAULT 'Valid', "shepards" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3ac0e933616c270f79f04cfc9fc" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "citations"`);
    }

}
