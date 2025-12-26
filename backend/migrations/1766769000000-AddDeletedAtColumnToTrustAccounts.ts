import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeletedAtColumnToTrustAccounts1766769000000 implements MigrationInterface {
    name = 'AddDeletedAtColumnToTrustAccounts1766769000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add deletedAt column to trust_accounts table
        await queryRunner.query(`
            ALTER TABLE "trust_accounts" 
            ADD COLUMN "deletedAt" TIMESTAMP NULL
        `);
        
        // Create index on deletedAt for better query performance
        await queryRunner.query(`
            CREATE INDEX "IDX_trust_accounts_deleted_at" 
            ON "trust_accounts" ("deletedAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`
            DROP INDEX "IDX_trust_accounts_deleted_at"
        `);
        
        // Drop deletedAt column
        await queryRunner.query(`
            ALTER TABLE "trust_accounts" 
            DROP COLUMN "deletedAt"
        `);
    }
}
