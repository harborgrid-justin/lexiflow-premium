-- =============================================================================
-- LexiFlow Premium - PostgreSQL Initialization Script
-- =============================================================================
-- Runs automatically when PostgreSQL container starts for the first time
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create schemas for organization
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Grant permissions to application user
GRANT ALL PRIVILEGES ON DATABASE lexiflow_db TO lexiflow;
GRANT ALL PRIVILEGES ON SCHEMA public TO lexiflow;
GRANT ALL PRIVILEGES ON SCHEMA audit TO lexiflow;
GRANT ALL PRIVILEGES ON SCHEMA analytics TO lexiflow;
GRANT ALL ON ALL TABLES IN SCHEMA public TO lexiflow;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO lexiflow;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO lexiflow;

-- Set default search path
ALTER DATABASE lexiflow_db SET search_path TO public, audit, analytics;

-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function for audit logging
CREATE OR REPLACE FUNCTION audit.log_changes()
RETURNS TRIGGER AS $$
DECLARE
    audit_row audit.audit_log;
    include_values boolean;
    log_diffs boolean;
    h_old hstore;
    h_new hstore;
    excluded_cols text[] = ARRAY[]::text[];
BEGIN
    audit_row = ROW(
        nextval('audit.audit_log_id_seq'),
        TG_TABLE_SCHEMA::text,
        TG_TABLE_NAME::text,
        TG_RELID,
        session_user::text,
        current_timestamp,
        current_setting('application_name'),
        inet_client_addr(),
        substring(TG_OP,1,1),
        NULL, NULL, NULL
    );

    IF TG_ARGV[0] IS NOT NULL THEN
        excluded_cols = TG_ARGV[0]::text[];
    END IF;

    IF (TG_OP = 'UPDATE' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(OLD.*) - excluded_cols;
        audit_row.changed_fields = (hstore(NEW.*) - audit_row.row_data) - excluded_cols;
        IF audit_row.changed_fields = hstore('') THEN
            RETURN NULL;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(OLD.*) - excluded_cols;
    ELSIF (TG_OP = 'INSERT' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(NEW.*) - excluded_cols;
    ELSE
        RAISE EXCEPTION '[audit.log_changes] - Trigger func added as trigger for unhandled case: %, %', TG_OP, TG_LEVEL;
        RETURN NULL;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'LexiFlow Premium database initialized successfully';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pg_trgm, unaccent, citext';
    RAISE NOTICE 'Schemas created: audit, analytics';
END $$;
