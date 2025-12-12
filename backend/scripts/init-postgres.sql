-- LexiFlow Database Initialization Script
-- This script runs when the PostgreSQL container is first created

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types if needed
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
    WHEN duplicate_object THEN null;
END $$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE lexiflow_db TO lexiflow_user;

-- Set default search path
ALTER DATABASE lexiflow_db SET search_path TO public;

-- Configure PostgreSQL settings for better performance
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';

-- Reload configuration (requires superuser privileges)
-- SELECT pg_reload_conf();

-- Create a schema for audit logs if needed
CREATE SCHEMA IF NOT EXISTS audit;
GRANT ALL ON SCHEMA audit TO lexiflow_user;

-- Create a schema for temporary data
CREATE SCHEMA IF NOT EXISTS temp;
GRANT ALL ON SCHEMA temp TO lexiflow_user;

-- Set up text search configuration for legal documents
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS legal_english ( COPY = pg_catalog.english );

COMMENT ON DATABASE lexiflow_db IS 'LexiFlow AI Legal Suite - Enterprise Document Management System';
