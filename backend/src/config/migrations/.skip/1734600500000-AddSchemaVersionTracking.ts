import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchemaVersionTracking1734600500000 implements MigrationInterface {
    name = 'AddSchemaVersionTracking1734600500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create schema_versions table
        await queryRunner.query(`
            CREATE TABLE schema_versions (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                version character varying NOT NULL UNIQUE,
                major_version integer NOT NULL,
                minor_version integer NOT NULL,
                patch_version integer NOT NULL,
                description text,
                migration_name character varying NOT NULL,
                applied_at timestamp without time zone NOT NULL DEFAULT now(),
                applied_by character varying NOT NULL DEFAULT current_user,
                execution_time_ms integer,
                status character varying NOT NULL DEFAULT 'success',
                rollback_script text,
                breaking_changes boolean DEFAULT false,
                dependencies text[],
                created_at timestamp without time zone NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_schema_versions_version ON schema_versions(major_version DESC, minor_version DESC, patch_version DESC)`);
        await queryRunner.query(`CREATE INDEX idx_schema_versions_applied_at ON schema_versions(applied_at DESC)`);

        // Insert current version
        await queryRunner.query(`
            INSERT INTO schema_versions (
                version, major_version, minor_version, patch_version,
                description, migration_name, status
            ) VALUES (
                '1.0.0', 1, 0, 0,
                'Initial schema with optimistic locking, CHECK constraints, full-text search, and bi-temporal tracking',
                'InitialSchema',
                'success'
            )
        `);

        // Create schema_health table for monitoring
        await queryRunner.query(`
            CREATE TABLE schema_health (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                check_time timestamp without time zone NOT NULL DEFAULT now(),
                table_name character varying NOT NULL,
                row_count bigint,
                table_size_bytes bigint,
                index_size_bytes bigint,
                bloat_percentage numeric(5,2),
                last_vacuum timestamp without time zone,
                last_analyze timestamp without time zone,
                dead_tuples bigint,
                live_tuples bigint,
                health_score integer,
                recommendations text[]
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_schema_health_check_time ON schema_health(check_time DESC)`);
        await queryRunner.query(`CREATE INDEX idx_schema_health_table ON schema_health(table_name, check_time DESC)`);

        // Create function to track schema changes
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION track_schema_version(
                p_version character varying,
                p_description text,
                p_migration_name character varying,
                p_execution_time_ms integer DEFAULT NULL,
                p_breaking_changes boolean DEFAULT false
            ) RETURNS uuid AS $$
            DECLARE
                v_parts text[];
                v_id uuid;
            BEGIN
                v_parts := string_to_array(p_version, '.');
                
                INSERT INTO schema_versions (
                    version, major_version, minor_version, patch_version,
                    description, migration_name, execution_time_ms, breaking_changes
                ) VALUES (
                    p_version,
                    v_parts[1]::integer,
                    v_parts[2]::integer,
                    v_parts[3]::integer,
                    p_description,
                    p_migration_name,
                    p_execution_time_ms,
                    p_breaking_changes
                ) RETURNING id INTO v_id;
                
                RETURN v_id;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create function to check schema health
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_schema_health()
            RETURNS TABLE (
                table_name text,
                row_count bigint,
                table_size text,
                index_size text,
                total_size text,
                bloat_pct numeric
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    schemaname || '.' || tablename AS table_name,
                    pg_stat_user_tables.n_live_tup AS row_count,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS table_size,
                    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS index_size,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
                    ROUND(
                        100 * pg_stat_user_tables.n_dead_tup / 
                        GREATEST(pg_stat_user_tables.n_live_tup, 1)::numeric,
                        2
                    ) AS bloat_pct
                FROM pg_stat_user_tables
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_schema_health()`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS track_schema_version(character varying, text, character varying, integer, boolean)`);
        await queryRunner.query(`DROP TABLE IF EXISTS schema_health`);
        await queryRunner.query(`DROP TABLE IF EXISTS schema_versions`);
    }
}
