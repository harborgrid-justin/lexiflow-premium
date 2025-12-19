import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReplicationSupport1734600800000 implements MigrationInterface {
    name = 'AddReplicationSupport1734600800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create replication status table
        await queryRunner.query(`
            CREATE TABLE replication_status (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                replica_name character varying NOT NULL UNIQUE,
                replica_role character varying NOT NULL CHECK (replica_role IN ('master', 'slave', 'standby')),
                host character varying NOT NULL,
                port integer NOT NULL,
                database_name character varying NOT NULL,
                is_active boolean DEFAULT true,
                lag_bytes bigint,
                lag_seconds integer,
                last_sync_time timestamp without time zone,
                health_status character varying DEFAULT 'unknown',
                error_message text,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_replication_status_role ON replication_status(replica_role, is_active)`);
        await queryRunner.query(`CREATE INDEX idx_replication_status_health ON replication_status(health_status, updated_at DESC)`);

        // Create read/write routing table
        await queryRunner.query(`
            CREATE TABLE query_routing_rules (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                rule_name character varying NOT NULL UNIQUE,
                query_pattern character varying NOT NULL,
                operation_type character varying NOT NULL CHECK (operation_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE', 'ALL')),
                route_to character varying NOT NULL CHECK (route_to IN ('master', 'slave', 'any')),
                priority integer NOT NULL DEFAULT 0,
                is_active boolean DEFAULT true,
                description text,
                created_at timestamp without time zone NOT NULL DEFAULT now(),
                updated_at timestamp without time zone NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_query_routing_priority ON query_routing_rules(priority DESC, is_active)`);

        // Insert default routing rules
        await queryRunner.query(`
            INSERT INTO query_routing_rules (rule_name, query_pattern, operation_type, route_to, priority, description) VALUES
            ('read_clients', '%FROM clients%', 'SELECT', 'slave', 100, 'Route client reads to read replica'),
            ('read_cases', '%FROM cases%', 'SELECT', 'slave', 100, 'Route case reads to read replica'),
            ('read_documents', '%FROM documents%', 'SELECT', 'slave', 100, 'Route document reads to read replica'),
            ('read_jurisdictions', '%FROM jurisdictions%', 'SELECT', 'slave', 90, 'Route jurisdiction reads to read replica'),
            ('write_all', '%', 'INSERT', 'master', 1000, 'All writes go to master'),
            ('update_all', '%', 'UPDATE', 'master', 1000, 'All updates go to master'),
            ('delete_all', '%', 'DELETE', 'master', 1000, 'All deletes go to master')
        `);

        // Create connection pool stats table
        await queryRunner.query(`
            CREATE TABLE connection_pool_stats (
                id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                pool_name character varying NOT NULL,
                total_connections integer NOT NULL,
                active_connections integer NOT NULL,
                idle_connections integer NOT NULL,
                waiting_connections integer NOT NULL,
                max_connections integer NOT NULL,
                min_connections integer NOT NULL,
                pool_utilization_pct numeric(5,2),
                avg_connection_time_ms numeric(10,2),
                recorded_at timestamp without time zone NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`CREATE INDEX idx_connection_pool_stats_recorded ON connection_pool_stats(recorded_at DESC)`);
        await queryRunner.query(`CREATE INDEX idx_connection_pool_stats_pool ON connection_pool_stats(pool_name, recorded_at DESC)`);

        // Create function to check replication lag
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_replication_lag()
            RETURNS TABLE (
                replica_name text,
                lag_bytes bigint,
                lag_seconds integer,
                status text
            ) AS $$
            BEGIN
                -- This is a placeholder - actual implementation depends on PostgreSQL replication setup
                RETURN QUERY
                SELECT 
                    client_addr::text AS replica_name,
                    pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn) AS lag_bytes,
                    EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp()))::integer AS lag_seconds,
                    CASE 
                        WHEN state = 'streaming' AND replay_lag < interval '10 seconds' THEN 'healthy'
                        WHEN state = 'streaming' AND replay_lag < interval '60 seconds' THEN 'warning'
                        ELSE 'critical'
                    END AS status
                FROM pg_stat_replication;
            END;
            $$ LANGUAGE plpgsql;
        `);

        // Create function to route queries
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION get_query_route(
                p_query_text text,
                p_operation_type character varying
            ) RETURNS character varying AS $$
            DECLARE
                v_route character varying;
            BEGIN
                -- Select highest priority matching rule
                SELECT route_to INTO v_route
                FROM query_routing_rules
                WHERE is_active = true
                    AND (operation_type = p_operation_type OR operation_type = 'ALL')
                    AND p_query_text ILIKE query_pattern
                ORDER BY priority DESC
                LIMIT 1;
                
                -- Default to master if no rule matches
                RETURN COALESCE(v_route, 'master');
            END;
            $$ LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP FUNCTION IF EXISTS get_query_route(text, character varying)`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_replication_lag()`);
        await queryRunner.query(`DROP TABLE IF EXISTS connection_pool_stats`);
        await queryRunner.query(`DROP TABLE IF EXISTS query_routing_rules`);
        await queryRunner.query(`DROP TABLE IF EXISTS replication_status`);
    }
}
