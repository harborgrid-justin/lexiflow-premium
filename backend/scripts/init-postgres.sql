-- ============================================
-- LexiFlow Database Initialization Script
-- ============================================
-- This script runs when the PostgreSQL container is first created
-- It sets up extensions, schemas, types, and performance optimizations

-- ============================================
-- PostgreSQL Extensions
-- ============================================

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Full-text search with trigram support
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Additional indexing methods
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Case-insensitive text type
CREATE EXTENSION IF NOT EXISTS "citext";

-- Fuzzy string matching
CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch";

-- International character support
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Advanced statistics for query planning
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Table bloat monitoring
CREATE EXTENSION IF NOT EXISTS "pgstattuple";

-- HTTP client (for webhooks, if needed)
-- CREATE EXTENSION IF NOT EXISTS "http"; -- Uncomment if needed

-- ============================================
-- Custom Database Types
-- ============================================

-- User Roles Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM (
        'super_admin',
        'admin',
        'partner',
        'senior_associate',
        'associate',
        'junior_associate',
        'paralegal',
        'legal_assistant',
        'clerk',
        'intern',
        'accountant',
        'billing_specialist',
        'it_admin',
        'user'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Case Status Enum
DO $$ BEGIN
    CREATE TYPE case_status AS ENUM (
        'draft',
        'active',
        'pending',
        'closed',
        'archived',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Case Priority Enum
DO $$ BEGIN
    CREATE TYPE case_priority AS ENUM (
        'low',
        'medium',
        'high',
        'urgent',
        'critical'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Document Type Enum
DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'pleading',
        'motion',
        'brief',
        'contract',
        'agreement',
        'correspondence',
        'evidence',
        'discovery',
        'court_order',
        'transcript',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- Database Schemas
-- ============================================

-- Audit logs schema
CREATE SCHEMA IF NOT EXISTS audit;
COMMENT ON SCHEMA audit IS 'Audit trail and activity logs';

-- Temporary data schema
CREATE SCHEMA IF NOT EXISTS temp;
COMMENT ON SCHEMA temp IS 'Temporary tables and working data';

-- Archival data schema
CREATE SCHEMA IF NOT EXISTS archive;
COMMENT ON SCHEMA archive IS 'Archived historical data';

-- ============================================
-- Permissions
-- ============================================

-- Grant permissions on public schema
GRANT ALL PRIVILEGES ON DATABASE lexiflow_db TO lexiflow_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO lexiflow_user;

-- Grant permissions on audit schema
GRANT ALL ON SCHEMA audit TO lexiflow_user;
GRANT ALL ON ALL TABLES IN SCHEMA audit TO lexiflow_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA audit TO lexiflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL ON TABLES TO lexiflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA audit GRANT ALL ON SEQUENCES TO lexiflow_user;

-- Grant permissions on temp schema
GRANT ALL ON SCHEMA temp TO lexiflow_user;
GRANT ALL ON ALL TABLES IN SCHEMA temp TO lexiflow_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA temp TO lexiflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA temp GRANT ALL ON TABLES TO lexiflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA temp GRANT ALL ON SEQUENCES TO lexiflow_user;

-- Grant permissions on archive schema
GRANT ALL ON SCHEMA archive TO lexiflow_user;
GRANT ALL ON ALL TABLES IN SCHEMA archive TO lexiflow_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA archive TO lexiflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA archive GRANT ALL ON TABLES TO lexiflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA archive GRANT ALL ON SEQUENCES TO lexiflow_user;

-- ============================================
-- Database Configuration
-- ============================================

-- Set default search path
ALTER DATABASE lexiflow_db SET search_path TO public, audit, temp;

-- ============================================
-- PostgreSQL Performance Tuning
-- ============================================
-- These settings are optimized for development/medium workloads
-- Adjust based on your server's available resources

-- Memory Configuration
ALTER SYSTEM SET shared_buffers = '256MB';                    -- Memory for caching data
ALTER SYSTEM SET effective_cache_size = '1GB';                -- OS cache estimate
ALTER SYSTEM SET maintenance_work_mem = '64MB';               -- Memory for maintenance operations
ALTER SYSTEM SET work_mem = '16MB';                           -- Memory per query operation

-- WAL (Write-Ahead Logging) Configuration
ALTER SYSTEM SET wal_buffers = '16MB';                        -- WAL buffer size
ALTER SYSTEM SET min_wal_size = '1GB';                        -- Minimum WAL size
ALTER SYSTEM SET max_wal_size = '4GB';                        -- Maximum WAL size before checkpoint
ALTER SYSTEM SET checkpoint_completion_target = 0.9;          -- Spread checkpoints over time

-- Query Planning
ALTER SYSTEM SET default_statistics_target = 100;             -- Statistics detail level
ALTER SYSTEM SET random_page_cost = 1.1;                      -- Cost of random disk access (SSD optimized)
ALTER SYSTEM SET effective_io_concurrency = 200;              -- Concurrent I/O operations (SSD)

-- Parallel Query Execution
ALTER SYSTEM SET max_worker_processes = 8;                    -- Max background processes
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;         -- Parallel workers per query
ALTER SYSTEM SET max_parallel_workers = 8;                    -- Total parallel workers
ALTER SYSTEM SET max_parallel_maintenance_workers = 4;        -- Parallel workers for maintenance

-- Connection Configuration
ALTER SYSTEM SET max_connections = 100;                       -- Maximum client connections

-- Logging Configuration
ALTER SYSTEM SET log_min_duration_statement = 1000;           -- Log queries longer than 1 second
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';
ALTER SYSTEM SET log_checkpoints = on;
ALTER SYSTEM SET log_connections = on;
ALTER SYSTEM SET log_disconnections = on;
ALTER SYSTEM SET log_lock_waits = on;
ALTER SYSTEM SET log_temp_files = 0;

-- Autovacuum Configuration
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 3;
ALTER SYSTEM SET autovacuum_naptime = '1min';
ALTER SYSTEM SET autovacuum_vacuum_threshold = 50;
ALTER SYSTEM SET autovacuum_analyze_threshold = 50;
ALTER SYSTEM SET autovacuum_vacuum_scale_factor = 0.1;
ALTER SYSTEM SET autovacuum_analyze_scale_factor = 0.05;

-- Lock Configuration
ALTER SYSTEM SET deadlock_timeout = '1s';

-- Statement Timeout (prevent runaway queries)
ALTER SYSTEM SET statement_timeout = '300000';                -- 5 minutes

-- ============================================
-- Full-Text Search Configuration
-- ============================================

-- Create custom text search configuration for legal documents
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS legal_english ( COPY = pg_catalog.english );

-- Add legal-specific dictionary customization
COMMENT ON TEXT SEARCH CONFIGURATION legal_english IS 'Full-text search configuration optimized for legal documents';

-- Create custom text search dictionary for legal terms (optional enhancement)
-- You can add legal-specific stop words and synonyms here

-- ============================================
-- Utility Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate random string (useful for tokens, etc.)
CREATE OR REPLACE FUNCTION generate_random_string(length INTEGER)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Database Metadata
-- ============================================

COMMENT ON DATABASE lexiflow_db IS 'LexiFlow AI Legal Suite - Enterprise Document Management System';

-- ============================================
-- Information Messages
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'LexiFlow Database Initialization Complete';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Database: lexiflow_db';
    RAISE NOTICE 'User: lexiflow_user';
    RAISE NOTICE 'Schemas: public, audit, temp, archive';
    RAISE NOTICE 'Extensions: uuid-ossp, pg_trgm, pgcrypto, and more';
    RAISE NOTICE 'Configuration: Optimized for development/medium workloads';
    RAISE NOTICE '==========================================';
END $$;
