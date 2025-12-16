import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFiledByToMotions1765907927846 implements MigrationInterface {
    name = 'AddFiledByToMotions1765907927846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "motions" ADD "filedBy" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "filedDate" date`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "responseDeadline" date`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "rulingDate" date`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "ruling" jsonb`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "supportingDocs" jsonb`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "attachments" jsonb`);
        await queryRunner.query(`ALTER TABLE "motions" ADD "opposingPartyResponse" jsonb`);
        await queryRunner.query(`ALTER TABLE "trial_exhibits" ADD CONSTRAINT "FK_a6ad2431edacef83e3e0d63d235" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "witnesses" ADD CONSTRAINT "FK_4a997d81bd1e781e25cd33ed1d8" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "witnesses" DROP CONSTRAINT "FK_4a997d81bd1e781e25cd33ed1d8"`);
        await queryRunner.query(`ALTER TABLE "trial_exhibits" DROP CONSTRAINT "FK_a6ad2431edacef83e3e0d63d235"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "opposingPartyResponse"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "attachments"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "supportingDocs"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "ruling"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "rulingDate"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "responseDeadline"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "filedDate"`);
        await queryRunner.query(`ALTER TABLE "motions" DROP COLUMN "filedBy"`);
    }

}
