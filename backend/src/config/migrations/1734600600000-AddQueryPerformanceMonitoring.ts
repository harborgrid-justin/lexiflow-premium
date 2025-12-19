import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQueryPerformanceMonitoring1734600600000 implements MigrationInterface {
    name = 'AddQueryPerformanceMonitoring1734600600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable pg_stat_statements extension
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_stat_statements`);

        // Create query performance log table
        await queryRunner.query(`
            CREATE TABLE query_performance_log (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                query_hash character varying NOT NULL,
                query_text text NOT NULL,
                execution_count bigint NOT NULL DEFAULT 1,
                total_time_ms numeric(10,2) NOT NULL,
                min_time_ms numeric(10,2) NOT NULL,
                max_time_ms numeric(10,2) NOT NULL,
                mean_time_ms numeric(10,2) NOT NULL,
                stddev_time_ms numeric(10,2),
                rows_returned bigint,
                shared_blks_hit bigint,
                shared_blks_read bigint,
                temp_blks_read bigint,
                temp_blks_written bigint,
                first_seen timestamp without time zone NOT NULL DEFAULT now(),
                last_seen timestamp without time zone NOT NULL DEFAULT now(),
                created_at timestamp without time zone NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_query_performance_hash ON query_performance_log(query_hash)`);
        await queryRunner.query(`CREATE INDEX idx_query_performance_mean_time ON query_performance_log(mean_time_ms DESC)`);
        await queryRunner.query(`CREATE INDEX idx_query_performance_total_time ON query_performance_log(total_time_ms DESC)`);
        await queryRunner.query(`CREATE INDEX idx_query_performance_last_seen ON query_performance_log(last_seen DESC)`);

        // Create slow query log table
        await queryRunner.query(`
            CREATE TABLE slow_query_log (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                query_text text NOT NULL,
                execution_time_ms numeric(10,2) NOT NULL,
                rows_returned bigint,
                user_id character varying,
                database_name character varying NOT NULL,
                application_name character varying,
                client_addr inet,
                executed_at timestamp without time zone NOT NULL DEFAULT now(),
                explain_plan jsonb,
                parameters jsonb,
                created_at timestamp without time zone NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_slow_query_execution_time ON slow_query_log(execution_time_ms DESC)`);
        await queryRunner.query(`CREATE INDEX idx_slow_query_executed_at ON slow_query_log(executed_at DESC)`);
        await queryRunner.query(`CREATE INDEX idx_slow_query_user ON slow_query_log(user_id, executed_at DESC)`);

        // Create index usage statistics table
        await queryRunner.query(`
            CREATE TABLE index_usage_stats (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                schema_name character varying NOT NULL,
                table_name character varying NOT NULL,
                index_name character varying NOT NULL,
                scans bigint NOT NULL DEFAULT 0,
                tuples_read bigint NOT NULL DEFAULT 0,
                tuples_fetched bigint NOT NULL DEFAULT 0,
                index_size_bytes bigint,
                bloat_bytes bigint,
                last_used timestamp without time zone,
                recommendation character varying,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`CREATE UNIQUE INDEX idx_index_usage_unique ON index_usage_stats(schema_name, table_name, index_name)`);
        await queryRunner.query(`CREATE INDEX idx_index_usage_scans ON index_usage_stats(scans ASC)`);

        // Create function to capture slow queries
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION log_slow_query(
                p_query_text text,
                p_execution_time_ms numeric,
                p_rows_returned bigint DEFAULT NULL,
                p_user_id character varying DEFAULT NULL,
                p_explain_plan jsonb DEFAULT NULL
            ) RETURNS uuid AS $$
            DECLARE
                v_id uuid;
            BEGIN
                -- Only log queries slower than 100ms
                IF p_execution_time_ms > 100 THEN
                    INSERT INTO slow_query_log (
                        query_text, execution_time_ms, rows_returned, 
                        user_id, database_name, explain_plan
                    ) VALUES (
                        p_query_text, p_execution_time_ms, p_rows_returned,
                        p_user_id, current_database(), p_explain_plan
                    ) RETURNING id INTO v_id;
                    
                    RETURN v_id;
                END IF;
                
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create function to get top slow queries
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_top_slow_queries(
                p_limit integer DEFAULT 20,
                p_since timestamp without time zone DEFAULT now() - interval '24 hours'
            ) RETURNS TABLE (
                query_text text,
                avg_time_ms numeric,
                max_time_ms numeric,
                execution_count bigint,
                total_time_ms numeric
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    LEFT(sq.query_text, 200) AS query_text,
                    ROUND(AVG(sq.execution_time_ms), 2) AS avg_time_ms,
                    MAX(sq.execution_time_ms) AS max_time_ms,
                    COUNT(*)::bigint AS execution_count,
                    SUM(sq.execution_time_ms) AS total_time_ms
                FROM slow_query_log sq
                WHERE sq.executed_at >= p_since
                GROUP BY LEFT(sq.query_text, 200)
                ORDER BY total_time_ms DESC
                LIMIT p_limit;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create function to identify unused indexes
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION find_unused_indexes()
            RETURNS TABLE (
                schema_name text,
                table_name text,
                index_name text,
                index_size text,
                scans bigint,
                recommendation text
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    schemaname::text,
                    tablename::text,
                    indexname::text,
                    pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) AS index_size,
                    idx_scan AS scans,
                    CASE 
                        WHEN idx_scan = 0 THEN 'Consider dropping - never used'
                        WHEN idx_scan < 10 THEN 'Low usage - evaluate necessity'
                        ELSE 'Active'
                    END AS recommendation
                FROM pg_stat_user_indexes
                WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
                    AND idx_scan < 100  -- Adjust threshold as needed
                    AND indexrelname NOT LIKE '%_pkey'  -- Exclude primary keys
                ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create function to analyze query performance from pg_stat_statements
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION analyze_query_performance()
            RETURNS TABLE (
                query_sample text,
                calls bigint,
                total_exec_time numeric,
                mean_exec_time numeric,
                cache_hit_ratio numeric,
                recommendation text
            ) AS $$
            BEGIN
                RETURN QUERY
                SELECT 
                    LEFT(pss.query, 100) AS query_sample,
                    pss.calls,
                    ROUND(pss.total_exec_time::numeric, 2) AS total_exec_time,
                    ROUND((pss.total_exec_time / pss.calls)::numeric, 2) AS mean_exec_time,
                    ROUND(
                        (100.0 * pss.shared_blks_hit / 
                        NULLIF(pss.shared_blks_hit + pss.shared_blks_read, 0))::numeric,
                        2
                    ) AS cache_hit_ratio,
                    CASE 
                        WHEN (pss.total_exec_time / pss.calls) > 1000 THEN 'Optimize - very slow average'
                        WHEN (100.0 * pss.shared_blks_hit / NULLIF(pss.shared_blks_hit + pss.shared_blks_read, 0)) < 90 THEN 'Check indexes - low cache hit'
                        WHEN pss.calls > 10000 THEN 'Consider caching - high call count'
                        ELSE 'OK'
                    END AS recommendation
                FROM pg_stat_statements pss
                WHERE pss.query NOT LIKE '%pg_stat_statements%'
                ORDER BY pss.total_exec_time DESC
                LIMIT 50;
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION IF EXISTS analyze_query_performance()`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS find_unused_indexes()`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS get_top_slow_queries(integer, timestamp without time zone)`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS log_slow_query(text, numeric, bigint, character varying, jsonb)`);
        await queryRunner.query(`DROP TABLE IF EXISTS index_usage_stats`);
        await queryRunner.query(`DROP TABLE IF EXISTS slow_query_log`);
        await queryRunner.query(`DROP TABLE IF EXISTS query_performance_log`);
        await queryRunner.query(`DROP EXTENSION IF EXISTS pg_stat_statements`);
    }
}
