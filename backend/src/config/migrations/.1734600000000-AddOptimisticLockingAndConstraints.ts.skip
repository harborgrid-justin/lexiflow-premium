import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOptimisticLockingAndConstraints1734600000000 implements MigrationInterface {
    name = 'AddOptimisticLockingAndConstraints1734600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add version columns for optimistic locking
        await queryRunner.query(`ALTER TABLE "invoices" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "time_entries" ADD "version" integer NOT NULL DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "trust_transactions" ADD "version" integer NOT NULL DEFAULT 1`);

        // Add CHECK constraints for invoices
        await queryRunner.query(`
            ALTER TABLE "invoices" 
            ADD CONSTRAINT "chk_invoice_subtotal_positive" CHECK (subtotal >= 0),
            ADD CONSTRAINT "chk_invoice_tax_rate_valid" CHECK (tax_rate BETWEEN 0 AND 1),
            ADD CONSTRAINT "chk_invoice_total_positive" CHECK (total_amount >= 0),
            ADD CONSTRAINT "chk_invoice_balance_valid" CHECK (balance_due >= 0 AND balance_due <= total_amount)
        `);

        // Add CHECK constraints for user_profiles
        await queryRunner.query(`
            ALTER TABLE "user_profiles"
            ADD CONSTRAINT "chk_graduation_year_valid" CHECK (
                graduation_year IS NULL OR 
                (graduation_year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE) + 4)
            ),
            ADD CONSTRAINT "chk_experience_valid" CHECK (
                years_of_experience >= 0 AND years_of_experience <= 70
            ),
            ADD CONSTRAINT "chk_hourly_rate_positive" CHECK (
                default_hourly_rate IS NULL OR default_hourly_rate > 0
            )
        `);

        // Add CHECK constraints for cases
        await queryRunner.query(`
            ALTER TABLE "cases"
            ADD CONSTRAINT "chk_trial_after_filing" CHECK (
                trial_date IS NULL OR filing_date IS NULL OR trial_date > filing_date
            ),
            ADD CONSTRAINT "chk_close_after_filing" CHECK (
                close_date IS NULL OR filing_date IS NULL OR close_date >= filing_date
            )
        `);

        // Add CHECK constraints for time_entries
        await queryRunner.query(`
            ALTER TABLE "time_entries"
            ADD CONSTRAINT "chk_duration_positive" CHECK (duration > 0),
            ADD CONSTRAINT "chk_rate_positive" CHECK (rate >= 0),
            ADD CONSTRAINT "chk_total_valid" CHECK (total >= 0)
        `);

        // Add CHECK constraints for expenses
        await queryRunner.query(`
            ALTER TABLE "expenses"
            ADD CONSTRAINT "chk_amount_positive" CHECK (amount > 0),
            ADD CONSTRAINT "chk_quantity_positive" CHECK (quantity IS NULL OR quantity > 0),
            ADD CONSTRAINT "chk_unit_price_positive" CHECK (unit_price IS NULL OR unit_price > 0)
        `);

        // Add CHECK constraints for trust_transactions
        await queryRunner.query(`
            ALTER TABLE "trust_transactions"
            ADD CONSTRAINT "chk_transaction_amount_positive" CHECK (amount > 0)
        `);

        // Add composite unique constraint to prevent duplicate parties
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_party_unique" 
            ON "parties" ("case_id", "name", "type") 
            WHERE "deletedAt" IS NULL
        `);

        // Add covering indexes for common queries
        await queryRunner.query(`
            CREATE INDEX "idx_cases_status_covering" 
            ON "cases" ("status", "title", "created_at")
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_documents_status_covering" 
            ON "documents" ("status", "title", "created_at", "case_id")
        `);

        // Add partial indexes for active/unpaid records
        await queryRunner.query(`
            CREATE INDEX "idx_cases_active" 
            ON "cases" ("status", "assigned_team_id", "lead_attorney_id") 
            WHERE status IN ('Active', 'Open', 'Discovery', 'Trial')
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_invoices_unpaid"
            ON "invoices" ("client_id", "due_date", "balance_due")
            WHERE status NOT IN ('Paid', 'Cancelled')
        `);

        await queryRunner.query(`
            CREATE INDEX "idx_time_entries_unbilled"
            ON "time_entries" ("case_id", "user_id", "date")
            WHERE status != 'Billed'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_time_entries_unbilled"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_invoices_unpaid"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_cases_active"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_documents_status_covering"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_cases_status_covering"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_party_unique"`);

        // Drop CHECK constraints
        await queryRunner.query(`ALTER TABLE "trust_transactions" DROP CONSTRAINT IF EXISTS "chk_transaction_amount_positive"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT IF EXISTS "chk_amount_positive"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT IF EXISTS "chk_quantity_positive"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT IF EXISTS "chk_unit_price_positive"`);
        await queryRunner.query(`ALTER TABLE "time_entries" DROP CONSTRAINT IF EXISTS "chk_duration_positive"`);
        await queryRunner.query(`ALTER TABLE "time_entries" DROP CONSTRAINT IF EXISTS "chk_rate_positive"`);
        await queryRunner.query(`ALTER TABLE "time_entries" DROP CONSTRAINT IF EXISTS "chk_total_valid"`);
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT IF EXISTS "chk_trial_after_filing"`);
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT IF EXISTS "chk_close_after_filing"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT IF EXISTS "chk_graduation_year_valid"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT IF EXISTS "chk_experience_valid"`);
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT IF EXISTS "chk_hourly_rate_positive"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "chk_invoice_subtotal_positive"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "chk_invoice_tax_rate_valid"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "chk_invoice_total_positive"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT IF EXISTS "chk_invoice_balance_valid"`);

        // Drop version columns
        await queryRunner.query(`ALTER TABLE "trust_transactions" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "time_entries" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "version"`);
    }
}
