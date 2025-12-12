-- =====================================================
-- LexiFlow AI Legal Suite - Advanced Database Indexes
-- =====================================================
-- This script creates optimized indexes for:
-- - Full-text search performance (GIN indexes)
-- - JSON field queries (JSONB GIN indexes)
-- - Text similarity searches (trigram indexes)
-- - Common query patterns optimization
-- =====================================================

\echo 'Creating Advanced Indexes for LexiFlow...'

-- =====================================================
-- CASES TABLE INDEXES
-- =====================================================

-- Full-text search index for case titles and descriptions
CREATE INDEX IF NOT EXISTS idx_cases_fulltext_search
ON cases USING GIN (
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, ''))
);
\echo '✓ Index created: idx_cases_fulltext_search'

-- GIN index for metadata JSONB field
CREATE INDEX IF NOT EXISTS idx_cases_metadata_gin
ON cases USING GIN (metadata);
\echo '✓ Index created: idx_cases_metadata_gin'

-- Specific JSONB path indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cases_metadata_tags
ON cases USING GIN ((metadata -> 'tags'));
\echo '✓ Index created: idx_cases_metadata_tags'

-- Trigram index for fuzzy case number search
CREATE INDEX IF NOT EXISTS idx_cases_case_number_trgm
ON cases USING GIN ("caseNumber" gin_trgm_ops);
\echo '✓ Index created: idx_cases_case_number_trgm'

-- Trigram index for fuzzy title search
CREATE INDEX IF NOT EXISTS idx_cases_title_trgm
ON cases USING GIN (title gin_trgm_ops);
\echo '✓ Index created: idx_cases_title_trgm'

-- Composite index for common case queries
CREATE INDEX IF NOT EXISTS idx_cases_status_type_filing
ON cases (status, "caseType", "filingDate" DESC);
\echo '✓ Index created: idx_cases_status_type_filing'

-- Index for client relationship queries
CREATE INDEX IF NOT EXISTS idx_cases_client_status
ON cases ("clientId", status) WHERE "clientId" IS NOT NULL;
\echo '✓ Index created: idx_cases_client_status'

-- =====================================================
-- CLIENTS TABLE INDEXES
-- =====================================================

-- Full-text search index for client information
CREATE INDEX IF NOT EXISTS idx_clients_fulltext_search
ON clients USING GIN (
    to_tsvector('english',
        COALESCE(name, '') || ' ' ||
        COALESCE(email, '') || ' ' ||
        COALESCE("primaryContactName", '') || ' ' ||
        COALESCE(notes, '')
    )
);
\echo '✓ Index created: idx_clients_fulltext_search'

-- Trigram index for fuzzy client name search
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm
ON clients USING GIN (name gin_trgm_ops);
\echo '✓ Index created: idx_clients_name_trgm'

-- Trigram index for email search
CREATE INDEX IF NOT EXISTS idx_clients_email_trgm
ON clients USING GIN (email gin_trgm_ops);
\echo '✓ Index created: idx_clients_email_trgm'

-- GIN index for custom fields JSONB
CREATE INDEX IF NOT EXISTS idx_clients_custom_fields_gin
ON clients USING GIN ("customFields");
\echo '✓ Index created: idx_clients_custom_fields_gin'

-- GIN index for tags array
CREATE INDEX IF NOT EXISTS idx_clients_tags_gin
ON clients USING GIN (tags);
\echo '✓ Index created: idx_clients_tags_gin'

-- GIN index for metadata JSONB
CREATE INDEX IF NOT EXISTS idx_clients_metadata_gin
ON clients USING GIN (metadata);
\echo '✓ Index created: idx_clients_metadata_gin'

-- Composite index for client filtering
CREATE INDEX IF NOT EXISTS idx_clients_type_status
ON clients ("clientType", status);
\echo '✓ Index created: idx_clients_type_status'

-- Index for VIP clients
CREATE INDEX IF NOT EXISTS idx_clients_vip
ON clients ("isVip") WHERE "isVip" = true;
\echo '✓ Index created: idx_clients_vip'

-- =====================================================
-- LEGAL_DOCUMENTS TABLE INDEXES
-- =====================================================

-- Full-text search index for document content
CREATE INDEX IF NOT EXISTS idx_documents_fulltext_search
ON legal_documents USING GIN (
    to_tsvector('english',
        COALESCE(title, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(content, '')
    )
);
\echo '✓ Index created: idx_documents_fulltext_search'

-- Trigram index for document title fuzzy search
CREATE INDEX IF NOT EXISTS idx_documents_title_trgm
ON legal_documents USING GIN (title gin_trgm_ops);
\echo '✓ Index created: idx_documents_title_trgm'

-- GIN index for document metadata
CREATE INDEX IF NOT EXISTS idx_documents_metadata_gin
ON legal_documents USING GIN (metadata);
\echo '✓ Index created: idx_documents_metadata_gin'

-- GIN index for tags
CREATE INDEX IF NOT EXISTS idx_documents_tags_gin
ON legal_documents USING GIN (tags);
\echo '✓ Index created: idx_documents_tags_gin'

-- Composite index for case documents
CREATE INDEX IF NOT EXISTS idx_documents_case_type_created
ON legal_documents ("caseId", "documentType", "createdAt" DESC) WHERE "caseId" IS NOT NULL;
\echo '✓ Index created: idx_documents_case_type_created'

-- Index for document status queries
CREATE INDEX IF NOT EXISTS idx_documents_status
ON legal_documents (status);
\echo '✓ Index created: idx_documents_status'

-- =====================================================
-- TIME_ENTRIES TABLE INDEXES
-- =====================================================

-- Composite index for billable hours queries
CREATE INDEX IF NOT EXISTS idx_time_entries_case_billable
ON time_entries ("caseId", "isBillable", date DESC);
\echo '✓ Index created: idx_time_entries_case_billable'

-- Index for user time tracking
CREATE INDEX IF NOT EXISTS idx_time_entries_user_date
ON time_entries ("userId", date DESC);
\echo '✓ Index created: idx_time_entries_user_date'

-- Full-text search for time entry descriptions
CREATE INDEX IF NOT EXISTS idx_time_entries_description_fulltext
ON time_entries USING GIN (to_tsvector('english', COALESCE(description, '')));
\echo '✓ Index created: idx_time_entries_description_fulltext'

-- Index for unbilled time entries
CREATE INDEX IF NOT EXISTS idx_time_entries_unbilled
ON time_entries ("isBillable", "invoiceId") WHERE "isBillable" = true AND "invoiceId" IS NULL;
\echo '✓ Index created: idx_time_entries_unbilled'

-- =====================================================
-- USERS TABLE INDEXES
-- =====================================================

-- Full-text search index for users
CREATE INDEX IF NOT EXISTS idx_users_fulltext_search
ON users USING GIN (
    to_tsvector('english',
        COALESCE(username, '') || ' ' ||
        COALESCE(email, '') || ' ' ||
        COALESCE("firstName", '') || ' ' ||
        COALESCE("lastName", '')
    )
);
\echo '✓ Index created: idx_users_fulltext_search'

-- Trigram index for username search
CREATE INDEX IF NOT EXISTS idx_users_username_trgm
ON users USING GIN (username gin_trgm_ops);
\echo '✓ Index created: idx_users_username_trgm'

-- Index for active users by role
CREATE INDEX IF NOT EXISTS idx_users_role_active
ON users (role, "isActive") WHERE "isActive" = true;
\echo '✓ Index created: idx_users_role_active'

-- =====================================================
-- INVOICES TABLE INDEXES
-- =====================================================

-- Composite index for invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_status_due_date
ON invoices (status, "dueDate" DESC);
\echo '✓ Index created: idx_invoices_status_due_date'

-- Index for case invoices
CREATE INDEX IF NOT EXISTS idx_invoices_case_client
ON invoices ("caseId", "clientId");
\echo '✓ Index created: idx_invoices_case_client'

-- Index for overdue invoices
CREATE INDEX IF NOT EXISTS idx_invoices_overdue
ON invoices ("dueDate", status)
WHERE status IN ('pending', 'sent') AND "dueDate" < CURRENT_DATE;
\echo '✓ Index created: idx_invoices_overdue'

-- GIN index for invoice metadata
CREATE INDEX IF NOT EXISTS idx_invoices_metadata_gin
ON invoices USING GIN (metadata);
\echo '✓ Index created: idx_invoices_metadata_gin'

-- =====================================================
-- MOTIONS TABLE INDEXES
-- =====================================================

-- Composite index for case motions
CREATE INDEX IF NOT EXISTS idx_motions_case_status_filed
ON motions ("caseId", status, "filedDate" DESC);
\echo '✓ Index created: idx_motions_case_status_filed'

-- Full-text search for motion titles
CREATE INDEX IF NOT EXISTS idx_motions_title_fulltext
ON motions USING GIN (to_tsvector('english', COALESCE(title, '')));
\echo '✓ Index created: idx_motions_title_fulltext'

-- Index for hearing dates
CREATE INDEX IF NOT EXISTS idx_motions_hearing_date
ON motions ("hearingDate") WHERE "hearingDate" IS NOT NULL;
\echo '✓ Index created: idx_motions_hearing_date'

-- =====================================================
-- DOCKET_ENTRIES TABLE INDEXES
-- =====================================================

-- Composite index for case docket entries
CREATE INDEX IF NOT EXISTS idx_docket_entries_case_entry_date
ON docket_entries ("caseId", "entryDate" DESC);
\echo '✓ Index created: idx_docket_entries_case_entry_date'

-- Full-text search for docket descriptions
CREATE INDEX IF NOT EXISTS idx_docket_entries_description_fulltext
ON docket_entries USING GIN (to_tsvector('english', COALESCE(description, '')));
\echo '✓ Index created: idx_docket_entries_description_fulltext'

-- =====================================================
-- DISCOVERY_REQUESTS TABLE INDEXES
-- =====================================================

-- Composite index for case discovery
CREATE INDEX IF NOT EXISTS idx_discovery_case_type_status
ON discovery_requests ("caseId", "requestType", status);
\echo '✓ Index created: idx_discovery_case_type_status'

-- Index for due date queries
CREATE INDEX IF NOT EXISTS idx_discovery_due_date
ON discovery_requests ("dueDate", status)
WHERE status NOT IN ('completed', 'withdrawn');
\echo '✓ Index created: idx_discovery_due_date'

-- GIN index for discovery metadata
CREATE INDEX IF NOT EXISTS idx_discovery_metadata_gin
ON discovery_requests USING GIN (metadata);
\echo '✓ Index created: idx_discovery_metadata_gin'

-- =====================================================
-- CASE_TEAM_MEMBERS TABLE INDEXES
-- =====================================================

-- Composite index for team queries
CREATE INDEX IF NOT EXISTS idx_case_team_case_user_role
ON case_team_members ("caseId", "userId", role);
\echo '✓ Index created: idx_case_team_case_user_role'

-- Index for user's cases
CREATE INDEX IF NOT EXISTS idx_case_team_user_active
ON case_team_members ("userId", "isActive") WHERE "isActive" = true;
\echo '✓ Index created: idx_case_team_user_active'

-- =====================================================
-- PARTIES TABLE INDEXES
-- =====================================================

-- Full-text search for party names
CREATE INDEX IF NOT EXISTS idx_parties_name_fulltext
ON parties USING GIN (to_tsvector('english', COALESCE(name, '')));
\echo '✓ Index created: idx_parties_name_fulltext'

-- Trigram index for fuzzy party name search
CREATE INDEX IF NOT EXISTS idx_parties_name_trgm
ON parties USING GIN (name gin_trgm_ops);
\echo '✓ Index created: idx_parties_name_trgm'

-- Composite index for case parties
CREATE INDEX IF NOT EXISTS idx_parties_case_type
ON parties ("caseId", "partyType");
\echo '✓ Index created: idx_parties_case_type'

-- =====================================================
-- API_KEYS TABLE INDEXES
-- =====================================================

-- Index for active API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_active
ON api_keys ("isActive", "expiresAt")
WHERE "isActive" = true;
\echo '✓ Index created: idx_api_keys_active'

-- Index for key lookup (if table has keyHash)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'api_keys' AND column_name = 'keyHash'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash
        ON api_keys ("keyHash");
        RAISE NOTICE '✓ Index created: idx_api_keys_key_hash';
    END IF;
END $$;

-- =====================================================
-- COMPLIANCE_CHECKS TABLE INDEXES
-- =====================================================

-- Composite index for compliance queries
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'compliance_checks') THEN
        CREATE INDEX IF NOT EXISTS idx_compliance_type_status_date
        ON compliance_checks ("checkType", status, "createdAt" DESC);
        RAISE NOTICE '✓ Index created: idx_compliance_type_status_date';
    END IF;
END $$;

-- =====================================================
-- ANALYTICS OPTIMIZATION INDEXES
-- =====================================================

-- Index for date range analytics queries
CREATE INDEX IF NOT EXISTS idx_cases_filing_date_year
ON cases (EXTRACT(YEAR FROM "filingDate"), EXTRACT(MONTH FROM "filingDate"));
\echo '✓ Index created: idx_cases_filing_date_year'

-- Index for time entry aggregations
CREATE INDEX IF NOT EXISTS idx_time_entries_date_user_hours
ON time_entries (date, "userId", hours);
\echo '✓ Index created: idx_time_entries_date_user_hours'

-- Index for invoice analytics
CREATE INDEX IF NOT EXISTS idx_invoices_date_amount
ON invoices ("invoiceDate", amount);
\echo '✓ Index created: idx_invoices_date_amount'

-- =====================================================
-- Verify Index Creation
-- =====================================================
\echo ''
\echo 'Summary of GIN Indexes:'
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
WHERE indexdef LIKE '%USING gin%'
    AND schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''
\echo '✓ All advanced indexes successfully created!'
