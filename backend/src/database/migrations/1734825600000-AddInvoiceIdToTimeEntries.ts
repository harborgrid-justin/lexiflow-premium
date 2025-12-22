import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceIdToTimeEntries1734825600000 implements MigrationInterface {
    name = 'AddInvoiceIdToTimeEntries1734825600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add invoiceId column to time_entries table
        await queryRunner.query(`
            ALTER TABLE "time_entries" 
            ADD COLUMN "invoice_id" uuid NULL
        `);

        // Add index on invoice_id for performance
        await queryRunner.query(`
            CREATE INDEX "IDX_time_entries_invoice_id" 
            ON "time_entries" ("invoice_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index first
        await queryRunner.query(`
            DROP INDEX "IDX_time_entries_invoice_id"
        `);

        // Drop invoiceId column
        await queryRunner.query(`
            ALTER TABLE "time_entries" 
            DROP COLUMN "invoice_id"
        `);
    }
}
