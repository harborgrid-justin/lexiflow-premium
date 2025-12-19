import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTablePartitioning1734600300000 implements MigrationInterface {
    name = 'AddTablePartitioning1734600300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create partitioned audit_logs table
        await queryRunner.query(`
            -- Create new partitioned table
            CREATE TABLE audit_logs_new (
                id uuid NOT NULL,
                entity_type character varying NOT NULL,
                entity_id character varying NOT NULL,
                action character varying NOT NULL,
                changes jsonb,
                user_id character varying,
                timestamp timestamp without time zone NOT NULL DEFAULT now(),
                ip_address character varying,
                user_agent character varying,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now(),
                CONSTRAINT audit_logs_new_pkey PRIMARY KEY (id, timestamp)
            ) PARTITION BY RANGE (timestamp);
        `);

        // Create partitions for current and upcoming months
        const currentDate = new Date();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = -2; i <= 3; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
            const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const partitionName = `audit_logs_y${year}m${month}`;
            
            await queryRunner.query(`
                CREATE TABLE ${partitionName} PARTITION OF audit_logs_new
                FOR VALUES FROM ('${year}-${month}-01') TO ('${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01');
            `);
        }

        // Migrate existing data
        await queryRunner.query(`
            INSERT INTO audit_logs_new 
            SELECT * FROM audit_logs
            WHERE timestamp >= NOW() - INTERVAL '2 months';
        `);

        // Rename tables
        await queryRunner.query(`ALTER TABLE audit_logs RENAME TO audit_logs_old`);
        await queryRunner.query(`ALTER TABLE audit_logs_new RENAME TO audit_logs`);

        // Create indexes on partitions
        await queryRunner.query(`CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id, timestamp DESC)`);
        await queryRunner.query(`CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, timestamp DESC)`);
        await queryRunner.query(`CREATE INDEX idx_audit_logs_action ON audit_logs(action, timestamp DESC)`);

        // Create partitioned time_entries table
        await queryRunner.query(`
            CREATE TABLE time_entries_new (
                id uuid NOT NULL,
                case_id character varying,
                user_id character varying NOT NULL,
                date date NOT NULL,
                duration numeric(10,2) NOT NULL,
                rate numeric(10,2) NOT NULL,
                total numeric(10,2) NOT NULL,
                description text NOT NULL,
                status character varying NOT NULL DEFAULT 'Draft',
                billable boolean NOT NULL DEFAULT true,
                invoice_id character varying,
                task_code character varying,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now(),
                version integer NOT NULL DEFAULT 1,
                CONSTRAINT time_entries_new_pkey PRIMARY KEY (id, date),
                CONSTRAINT time_entries_new_duration_check CHECK (duration > 0),
                CONSTRAINT time_entries_new_rate_check CHECK (rate >= 0),
                CONSTRAINT time_entries_new_total_check CHECK (total >= 0)
            ) PARTITION BY RANGE (date);
        `);

        // Create partitions for time_entries (quarterly)
        for (let i = -1; i <= 2; i++) {
            const quarter = Math.floor(currentDate.getMonth() / 3) + i;
            const year = currentDate.getFullYear() + Math.floor(quarter / 4);
            const q = ((quarter % 4) + 4) % 4;
            const startMonth = q * 3 + 1;
            const endMonth = startMonth + 3;
            const partitionName = `time_entries_y${year}q${q + 1}`;
            
            await queryRunner.query(`
                CREATE TABLE ${partitionName} PARTITION OF time_entries_new
                FOR VALUES FROM ('${year}-${String(startMonth).padStart(2, '0')}-01') 
                TO ('${year + Math.floor(endMonth / 13)}-${String((endMonth % 12) || 12).padStart(2, '0')}-01');
            `);
        }

        // Migrate existing time_entries data
        await queryRunner.query(`
            INSERT INTO time_entries_new 
            SELECT * FROM time_entries
            WHERE date >= NOW() - INTERVAL '3 months';
        `);

        // Rename time_entries tables
        await queryRunner.query(`ALTER TABLE time_entries RENAME TO time_entries_old`);
        await queryRunner.query(`ALTER TABLE time_entries_new RENAME TO time_entries`);

        // Create indexes on time_entries partitions
        await queryRunner.query(`CREATE INDEX idx_time_entries_user ON time_entries(user_id, date DESC)`);
        await queryRunner.query(`CREATE INDEX idx_time_entries_case ON time_entries(case_id, date DESC)`);
        await queryRunner.query(`CREATE INDEX idx_time_entries_status ON time_entries(status, date DESC) WHERE status != 'Billed'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restore original time_entries
        await queryRunner.query(`DROP TABLE IF EXISTS time_entries`);
        await queryRunner.query(`ALTER TABLE time_entries_old RENAME TO time_entries`);

        // Restore original audit_logs
        await queryRunner.query(`DROP TABLE IF EXISTS audit_logs`);
        await queryRunner.query(`ALTER TABLE audit_logs_old RENAME TO audit_logs`);
    }
}
