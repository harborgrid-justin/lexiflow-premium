-- =====================================================
-- LexiFlow AI Legal Suite - Custom PostgreSQL Functions
-- =====================================================
-- This script creates custom database functions for:
-- - Full-text search optimization
-- - Audit logging and triggers
-- - Data validation and business logic
-- - Performance optimization utilities
-- =====================================================

\echo 'Creating Custom PostgreSQL Functions for LexiFlow...'

-- =====================================================
-- FUNCTION: update_updated_at_timestamp()
-- =====================================================
-- Automatically updates the 'updatedAt' timestamp on row modification
-- Used by: All entity tables with updatedAt column
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

\echo '✓ Function created: update_updated_at_timestamp()'

-- =====================================================
-- FUNCTION: generate_case_number()
-- =====================================================
-- Generates sequential case numbers with year prefix
-- Format: CASE-YYYY-NNNN (e.g., CASE-2025-0001)
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

    -- Get the highest case number for current year
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING(
                    "caseNumber" FROM '\d{4}-(\d+)'
                ) AS INTEGER
            )
        ), 0
    ) + 1
    INTO next_number
    FROM cases
    WHERE "caseNumber" LIKE 'CASE-' || current_year || '-%';

    -- Format with leading zeros
    formatted_number := LPAD(next_number::TEXT, 4, '0');

    RETURN 'CASE-' || current_year || '-' || formatted_number;
END;
$$ LANGUAGE plpgsql;

\echo '✓ Function created: generate_case_number()'

-- =====================================================
-- FUNCTION: generate_client_number()
-- =====================================================
-- Generates sequential client numbers
-- Format: CLT-NNNNNN (e.g., CLT-000001)
CREATE OR REPLACE FUNCTION generate_client_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Get the highest client number
    SELECT COALESCE(
        MAX(
            CAST(
                SUBSTRING("clientNumber" FROM '\d+') AS INTEGER
            )
        ), 0
    ) + 1
    INTO next_number
    FROM clients
    WHERE "clientNumber" LIKE 'CLT-%';

    -- Format with leading zeros
    formatted_number := LPAD(next_number::TEXT, 6, '0');

    RETURN 'CLT-' || formatted_number;
END;
$$ LANGUAGE plpgsql;

\echo '✓ Function created: generate_client_number()'

-- =====================================================
-- FUNCTION: create_document_search_vector()
-- =====================================================
-- Creates tsvector for full-text search on documents
-- Combines title, content, and metadata for comprehensive search
CREATE OR REPLACE FUNCTION create_document_search_vector(
    title TEXT,
    content TEXT,
    metadata JSONB
)
RETURNS tsvector AS $$
BEGIN
    RETURN
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(content, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(metadata::TEXT, '')), 'C');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

\echo '✓ Function created: create_document_search_vector()'

-- =====================================================
-- FUNCTION: calculate_case_duration_days()
-- =====================================================
-- Calculates the duration of a case in days
CREATE OR REPLACE FUNCTION calculate_case_duration_days(
    filing_date DATE,
    closed_date DATE DEFAULT NULL
)
RETURNS INTEGER AS $$
BEGIN
    IF closed_date IS NOT NULL THEN
        RETURN closed_date - filing_date;
    ELSE
        RETURN CURRENT_DATE - filing_date;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

\echo '✓ Function created: calculate_case_duration_days()'

-- =====================================================
-- FUNCTION: audit_trigger_function()
-- =====================================================
-- Generic audit logging function for tracking changes
-- Logs: INSERT, UPDATE, DELETE operations with old/new values
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    audit_row JSONB;
    user_id UUID;
BEGIN
    -- Extract user ID from session if available
    user_id := NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;

    IF (TG_OP = 'DELETE') THEN
        audit_row := jsonb_build_object(
            'schema', TG_TABLE_SCHEMA,
            'table', TG_TABLE_NAME,
            'operation', 'DELETE',
            'old_data', row_to_json(OLD),
            'new_data', NULL,
            'user_id', user_id,
            'timestamp', CURRENT_TIMESTAMP
        );

        -- Store in audit_logs table if it exists
        BEGIN
            EXECUTE format(
                'INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6)'
            ) USING TG_TABLE_NAME, 'DELETE', row_to_json(OLD)::JSONB, NULL, user_id, CURRENT_TIMESTAMP;
        EXCEPTION WHEN undefined_table THEN
            -- Audit table doesn't exist, skip logging
            NULL;
        END;

        RETURN OLD;

    ELSIF (TG_OP = 'UPDATE') THEN
        audit_row := jsonb_build_object(
            'schema', TG_TABLE_SCHEMA,
            'table', TG_TABLE_NAME,
            'operation', 'UPDATE',
            'old_data', row_to_json(OLD),
            'new_data', row_to_json(NEW),
            'user_id', user_id,
            'timestamp', CURRENT_TIMESTAMP
        );

        BEGIN
            EXECUTE format(
                'INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6)'
            ) USING TG_TABLE_NAME, 'UPDATE', row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB, user_id, CURRENT_TIMESTAMP;
        EXCEPTION WHEN undefined_table THEN
            NULL;
        END;

        RETURN NEW;

    ELSIF (TG_OP = 'INSERT') THEN
        audit_row := jsonb_build_object(
            'schema', TG_TABLE_SCHEMA,
            'table', TG_TABLE_NAME,
            'operation', 'INSERT',
            'old_data', NULL,
            'new_data', row_to_json(NEW),
            'user_id', user_id,
            'timestamp', CURRENT_TIMESTAMP
        );

        BEGIN
            EXECUTE format(
                'INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, created_at)
                 VALUES ($1, $2, $3, $4, $5, $6)'
            ) USING TG_TABLE_NAME, 'INSERT', NULL, row_to_json(NEW)::JSONB, user_id, CURRENT_TIMESTAMP;
        EXCEPTION WHEN undefined_table THEN
            NULL;
        END;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

\echo '✓ Function created: audit_trigger_function()'

-- =====================================================
-- FUNCTION: calculate_billable_hours()
-- =====================================================
-- Calculates total billable hours for a case or client
CREATE OR REPLACE FUNCTION calculate_billable_hours(
    entity_type TEXT,
    entity_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    total_hours DECIMAL(10,2);
BEGIN
    IF entity_type = 'case' THEN
        SELECT COALESCE(SUM(hours), 0)
        INTO total_hours
        FROM time_entries
        WHERE "caseId" = entity_id AND "isBillable" = true;
    ELSIF entity_type = 'client' THEN
        SELECT COALESCE(SUM(te.hours), 0)
        INTO total_hours
        FROM time_entries te
        JOIN cases c ON c.id = te."caseId"
        WHERE c."clientId" = entity_id AND te."isBillable" = true;
    END IF;

    RETURN COALESCE(total_hours, 0);
END;
$$ LANGUAGE plpgsql;

\echo '✓ Function created: calculate_billable_hours()'

-- =====================================================
-- FUNCTION: fuzzy_search_clients()
-- =====================================================
-- Performs fuzzy search on client names using trigram similarity
CREATE OR REPLACE FUNCTION fuzzy_search_clients(
    search_term TEXT,
    similarity_threshold REAL DEFAULT 0.3
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    client_number TEXT,
    similarity_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.name,
        c."clientNumber",
        similarity(c.name, search_term) AS similarity_score
    FROM clients c
    WHERE similarity(c.name, search_term) > similarity_threshold
    ORDER BY similarity_score DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

\echo '✓ Function created: fuzzy_search_clients()'

-- =====================================================
-- FUNCTION: get_case_statistics()
-- =====================================================
-- Returns comprehensive statistics for a specific case
CREATE OR REPLACE FUNCTION get_case_statistics(case_id UUID)
RETURNS TABLE (
    total_documents INTEGER,
    total_time_hours DECIMAL,
    total_billable_hours DECIMAL,
    total_billed_amount DECIMAL,
    total_paid_amount DECIMAL,
    duration_days INTEGER,
    team_member_count INTEGER,
    motion_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM legal_documents WHERE "caseId" = case_id),
        (SELECT COALESCE(SUM(hours), 0) FROM time_entries WHERE "caseId" = case_id),
        (SELECT COALESCE(SUM(hours), 0) FROM time_entries WHERE "caseId" = case_id AND "isBillable" = true),
        (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE "caseId" = case_id),
        (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE "caseId" = case_id AND status = 'paid'),
        (SELECT calculate_case_duration_days("filingDate", "closedDate") FROM cases WHERE id = case_id),
        (SELECT COUNT(*)::INTEGER FROM case_team_members WHERE "caseId" = case_id),
        (SELECT COUNT(*)::INTEGER FROM motions WHERE "caseId" = case_id);
END;
$$ LANGUAGE plpgsql;

\echo '✓ Function created: get_case_statistics()'

-- =====================================================
-- FUNCTION: validate_email()
-- =====================================================
-- Validates email format using regex
CREATE OR REPLACE FUNCTION validate_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

\echo '✓ Function created: validate_email()'

-- =====================================================
-- FUNCTION: calculate_invoice_total()
-- =====================================================
-- Calculates invoice total including line items and tax
CREATE OR REPLACE FUNCTION calculate_invoice_total(
    invoice_id UUID
)
RETURNS DECIMAL AS $$
DECLARE
    subtotal DECIMAL(15,2);
    tax_rate DECIMAL(5,2);
    total DECIMAL(15,2);
BEGIN
    -- Get subtotal from line items
    SELECT COALESCE(SUM(amount * quantity), 0)
    INTO subtotal
    FROM invoice_line_items
    WHERE "invoiceId" = invoice_id;

    -- Get tax rate from invoice
    SELECT COALESCE("taxRate", 0)
    INTO tax_rate
    FROM invoices
    WHERE id = invoice_id;

    -- Calculate total
    total := subtotal + (subtotal * tax_rate / 100);

    RETURN total;
END;
$$ LANGUAGE plpgsql;

\echo '✓ Function created: calculate_invoice_total()'

-- =====================================================
-- Create audit_logs table if it doesn't exist
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

\echo '✓ Table created: audit_logs'

\echo ''
\echo '✓ All custom PostgreSQL functions successfully created!'
