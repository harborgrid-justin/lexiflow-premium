import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaterializedViews1734600200000 implements MigrationInterface {
    name = 'AddMaterializedViews1734600200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Client statistics materialized view
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW client_statistics AS
            SELECT 
                c.id,
                c.name,
                c.client_number,
                COALESCE(SUM(i.total_amount), 0) AS total_billed,
                COALESCE(SUM(i.paid_amount), 0) AS total_paid,
                COALESCE(SUM(i.balance_due), 0) AS total_outstanding,
                COUNT(DISTINCT cs.id) AS total_cases,
                COUNT(DISTINCT cs.id) FILTER (WHERE cs.status IN ('Active', 'Open', 'Discovery', 'Trial')) AS active_cases,
                COUNT(DISTINCT i.id) AS total_invoices,
                COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'Overdue') AS overdue_invoices,
                MAX(i.invoice_date) AS last_invoice_date,
                MAX(i.paid_at) AS last_payment_date
            FROM clients c
            LEFT JOIN invoices i ON i.client_id = c.id
            LEFT JOIN cases cs ON cs.client_id = c.id
            GROUP BY c.id, c.name, c.client_number
        `);

        await queryRunner.query(`CREATE UNIQUE INDEX ON client_statistics(id)`);
        await queryRunner.query(`CREATE INDEX ON client_statistics(total_outstanding DESC)`);
        await queryRunner.query(`CREATE INDEX ON client_statistics(active_cases DESC)`);

        // Case statistics materialized view
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW case_statistics AS
            SELECT 
                c.id,
                c.case_number,
                c.title,
                c.status,
                COUNT(DISTINCT p.id) AS party_count,
                COUNT(DISTINCT d.id) AS document_count,
                COUNT(DISTINCT pl.id) AS pleading_count,
                COALESCE(SUM(te.duration), 0) AS total_billable_hours,
                COALESCE(SUM(te.total), 0) AS total_time_charges,
                COALESCE(SUM(e.amount), 0) AS total_expenses,
                COUNT(DISTINCT te.user_id) AS team_member_count,
                MAX(d.created_at) AS last_document_date,
                MAX(te.date) AS last_time_entry_date
            FROM cases c
            LEFT JOIN parties p ON p.case_id = c.id
            LEFT JOIN documents d ON d.case_id = c.id::text
            LEFT JOIN pleadings pl ON pl.case_id = c.id
            LEFT JOIN time_entries te ON te.case_id = c.id::text
            LEFT JOIN expenses e ON e.case_id = c.id
            GROUP BY c.id, c.case_number, c.title, c.status
        `);

        await queryRunner.query(`CREATE UNIQUE INDEX ON case_statistics(id)`);
        await queryRunner.query(`CREATE INDEX ON case_statistics(status)`);
        await queryRunner.query(`CREATE INDEX ON case_statistics(total_billable_hours DESC)`);

        // Billing summary materialized view
        await queryRunner.query(`
            CREATE MATERIALIZED VIEW billing_summary AS
            SELECT 
                DATE_TRUNC('month', te.date) AS billing_month,
                te.user_id,
                u.first_name,
                u.last_name,
                COUNT(DISTINCT te.case_id) AS cases_worked,
                COUNT(te.id) AS entry_count,
                SUM(te.duration) AS total_hours,
                SUM(te.total) AS total_amount,
                SUM(te.total) FILTER (WHERE te.status = 'Billed') AS billed_amount,
                SUM(te.total) FILTER (WHERE te.status = 'Approved') AS approved_unbilled,
                SUM(te.total) FILTER (WHERE te.status = 'Draft') AS draft_amount,
                AVG(te.rate) AS average_rate
            FROM time_entries te
            JOIN users u ON u.id = te.user_id
            GROUP BY DATE_TRUNC('month', te.date), te.user_id, u.first_name, u.last_name
        `);

        await queryRunner.query(`CREATE INDEX ON billing_summary(billing_month DESC, user_id)`);
        await queryRunner.query(`CREATE INDEX ON billing_summary(total_hours DESC)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS billing_summary`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS case_statistics`);
        await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS client_statistics`);
    }
}
