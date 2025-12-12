-- =====================================================
-- LexiFlow AI Legal Suite - Materialized Views
-- =====================================================
-- This script creates materialized views for:
-- - Analytics dashboards (fast aggregated data)
-- - Performance reporting
-- - Complex query optimization
-- - Business intelligence
-- =====================================================

\echo 'Creating Materialized Views for LexiFlow Analytics...'

-- =====================================================
-- VIEW: case_statistics_summary
-- =====================================================
-- Provides aggregated statistics for all cases
-- Updated: Daily via scheduled job
CREATE MATERIALIZED VIEW IF NOT EXISTS case_statistics_summary AS
SELECT
    c.id AS case_id,
    c."caseNumber",
    c.title,
    c.status,
    c."caseType",
    c."filingDate",
    c."closedDate",
    c."clientId",
    cl.name AS client_name,

    -- Document statistics
    COUNT(DISTINCT ld.id) AS total_documents,

    -- Time tracking statistics
    COALESCE(SUM(te.hours), 0) AS total_hours,
    COALESCE(SUM(CASE WHEN te."isBillable" = true THEN te.hours ELSE 0 END), 0) AS billable_hours,

    -- Financial statistics
    COALESCE(SUM(i.amount), 0) AS total_billed,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) AS total_paid,
    COALESCE(SUM(CASE WHEN i.status IN ('pending', 'sent', 'overdue') THEN i.amount ELSE 0 END), 0) AS outstanding_amount,

    -- Team statistics
    COUNT(DISTINCT ctm.id) AS team_member_count,

    -- Case activity statistics
    COUNT(DISTINCT m.id) AS motion_count,
    COUNT(DISTINCT de.id) AS docket_entry_count,
    COUNT(DISTINCT dr.id) AS discovery_request_count,

    -- Duration
    CASE
        WHEN c."closedDate" IS NOT NULL THEN c."closedDate" - c."filingDate"
        ELSE CURRENT_DATE - c."filingDate"
    END AS duration_days,

    -- Last activity
    GREATEST(
        COALESCE(MAX(ld."updatedAt"), c."createdAt"),
        COALESCE(MAX(te."createdAt"), c."createdAt"),
        COALESCE(MAX(m."updatedAt"), c."createdAt"),
        COALESCE(MAX(de."createdAt"), c."createdAt")
    ) AS last_activity_date,

    -- Metadata
    c."createdAt",
    c."updatedAt"

FROM cases c
LEFT JOIN clients cl ON cl.id = c."clientId"
LEFT JOIN legal_documents ld ON ld."caseId" = c.id
LEFT JOIN time_entries te ON te."caseId" = c.id
LEFT JOIN invoices i ON i."caseId" = c.id
LEFT JOIN case_team_members ctm ON ctm."caseId" = c.id AND ctm."isActive" = true
LEFT JOIN motions m ON m."caseId" = c.id
LEFT JOIN docket_entries de ON de."caseId" = c.id
LEFT JOIN discovery_requests dr ON dr."caseId" = c.id
GROUP BY c.id, c."caseNumber", c.title, c.status, c."caseType", c."filingDate", c."closedDate", c."clientId", cl.name, c."createdAt", c."updatedAt";

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_case_stats_case_number ON case_statistics_summary("caseNumber");
CREATE INDEX IF NOT EXISTS idx_case_stats_status ON case_statistics_summary(status);
CREATE INDEX IF NOT EXISTS idx_case_stats_client_id ON case_statistics_summary("clientId");
CREATE INDEX IF NOT EXISTS idx_case_stats_filing_date ON case_statistics_summary("filingDate" DESC);
CREATE INDEX IF NOT EXISTS idx_case_stats_last_activity ON case_statistics_summary(last_activity_date DESC);

\echo '✓ Materialized view created: case_statistics_summary'

-- =====================================================
-- VIEW: client_financial_summary
-- =====================================================
-- Provides financial overview for all clients
-- Updated: Daily via scheduled job
CREATE MATERIALIZED VIEW IF NOT EXISTS client_financial_summary AS
SELECT
    cl.id AS client_id,
    cl."clientNumber",
    cl.name,
    cl."clientType",
    cl.status,

    -- Case statistics
    COUNT(DISTINCT c.id) AS total_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'open' THEN c.id END) AS active_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'closed' THEN c.id END) AS closed_cases,

    -- Financial statistics
    COALESCE(SUM(i.amount), 0) AS total_invoiced,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) AS total_paid,
    COALESCE(SUM(CASE WHEN i.status IN ('pending', 'sent') THEN i.amount ELSE 0 END), 0) AS pending_amount,
    COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN i.amount ELSE 0 END), 0) AS overdue_amount,

    -- Time statistics
    COALESCE(SUM(te.hours), 0) AS total_hours,
    COALESCE(SUM(CASE WHEN te."isBillable" = true THEN te.hours ELSE 0 END), 0) AS billable_hours,
    COALESCE(SUM(CASE WHEN te."isBillable" = true AND te."invoiceId" IS NULL THEN te.hours ELSE 0 END), 0) AS unbilled_hours,

    -- Document statistics
    COUNT(DISTINCT ld.id) AS total_documents,

    -- Client metrics
    cl."retainerBalance",
    cl."creditLimit",
    cl."currentBalance",

    -- Dates
    cl."clientSince",
    MAX(i."invoiceDate") AS last_invoice_date,
    MAX(c."createdAt") AS last_case_opened,

    -- Last activity
    GREATEST(
        COALESCE(MAX(c."updatedAt"), cl."createdAt"),
        COALESCE(MAX(i."updatedAt"), cl."createdAt"),
        COALESCE(MAX(te."createdAt"), cl."createdAt")
    ) AS last_activity_date,

    -- Metadata
    cl."createdAt",
    cl."updatedAt"

FROM clients cl
LEFT JOIN cases c ON c."clientId" = cl.id
LEFT JOIN invoices i ON i."clientId" = cl.id
LEFT JOIN time_entries te ON te."caseId" = c.id
LEFT JOIN legal_documents ld ON ld."caseId" = c.id
GROUP BY cl.id, cl."clientNumber", cl.name, cl."clientType", cl.status, cl."retainerBalance",
         cl."creditLimit", cl."currentBalance", cl."clientSince", cl."createdAt", cl."updatedAt";

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_client_financial_client_number ON client_financial_summary("clientNumber");
CREATE INDEX IF NOT EXISTS idx_client_financial_status ON client_financial_summary(status);
CREATE INDEX IF NOT EXISTS idx_client_financial_total_invoiced ON client_financial_summary(total_invoiced DESC);
CREATE INDEX IF NOT EXISTS idx_client_financial_overdue ON client_financial_summary(overdue_amount DESC);

\echo '✓ Materialized view created: client_financial_summary'

-- =====================================================
-- VIEW: user_productivity_metrics
-- =====================================================
-- Tracks user productivity and time utilization
-- Updated: Daily via scheduled job
CREATE MATERIALIZED VIEW IF NOT EXISTS user_productivity_metrics AS
SELECT
    u.id AS user_id,
    u.username,
    u."firstName",
    u."lastName",
    u.email,
    u.role,

    -- Time statistics (last 30 days)
    COALESCE(SUM(CASE WHEN te.date >= CURRENT_DATE - INTERVAL '30 days' THEN te.hours ELSE 0 END), 0) AS hours_last_30_days,
    COALESCE(SUM(CASE WHEN te.date >= CURRENT_DATE - INTERVAL '30 days' AND te."isBillable" = true THEN te.hours ELSE 0 END), 0) AS billable_hours_last_30_days,

    -- Time statistics (last 90 days)
    COALESCE(SUM(CASE WHEN te.date >= CURRENT_DATE - INTERVAL '90 days' THEN te.hours ELSE 0 END), 0) AS hours_last_90_days,
    COALESCE(SUM(CASE WHEN te.date >= CURRENT_DATE - INTERVAL '90 days' AND te."isBillable" = true THEN te.hours ELSE 0 END), 0) AS billable_hours_last_90_days,

    -- All-time statistics
    COALESCE(SUM(te.hours), 0) AS total_hours,
    COALESCE(SUM(CASE WHEN te."isBillable" = true THEN te.hours ELSE 0 END), 0) AS total_billable_hours,

    -- Case assignments
    COUNT(DISTINCT ctm."caseId") AS assigned_cases,
    COUNT(DISTINCT CASE WHEN c.status = 'open' THEN ctm."caseId" END) AS active_assigned_cases,

    -- Document creation
    COUNT(DISTINCT ld.id) AS documents_created,

    -- Billability ratio
    CASE
        WHEN SUM(te.hours) > 0 THEN
            (SUM(CASE WHEN te."isBillable" = true THEN te.hours ELSE 0 END) / SUM(te.hours)) * 100
        ELSE 0
    END AS billability_percentage,

    -- Average daily hours (last 30 days)
    COALESCE(SUM(CASE WHEN te.date >= CURRENT_DATE - INTERVAL '30 days' THEN te.hours ELSE 0 END) / 30, 0) AS avg_daily_hours_30_days,

    -- Last activity
    MAX(te.date) AS last_time_entry_date,
    MAX(ld."createdAt") AS last_document_created,

    -- Metadata
    u."createdAt",
    u."updatedAt"

FROM users u
LEFT JOIN time_entries te ON te."userId" = u.id
LEFT JOIN case_team_members ctm ON ctm."userId" = u.id AND ctm."isActive" = true
LEFT JOIN cases c ON c.id = ctm."caseId"
LEFT JOIN legal_documents ld ON ld."createdBy" = u.id
WHERE u."isActive" = true
GROUP BY u.id, u.username, u."firstName", u."lastName", u.email, u.role, u."createdAt", u."updatedAt";

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_user_productivity_username ON user_productivity_metrics(username);
CREATE INDEX IF NOT EXISTS idx_user_productivity_role ON user_productivity_metrics(role);
CREATE INDEX IF NOT EXISTS idx_user_productivity_billable_hours ON user_productivity_metrics(billable_hours_last_30_days DESC);

\echo '✓ Materialized view created: user_productivity_metrics'

-- =====================================================
-- VIEW: monthly_revenue_summary
-- =====================================================
-- Monthly revenue and billing analytics
-- Updated: Daily via scheduled job
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_revenue_summary AS
SELECT
    EXTRACT(YEAR FROM i."invoiceDate") AS year,
    EXTRACT(MONTH FROM i."invoiceDate") AS month,
    TO_CHAR(i."invoiceDate", 'YYYY-MM') AS year_month,

    -- Invoice counts
    COUNT(*) AS total_invoices,
    COUNT(CASE WHEN i.status = 'paid' THEN 1 END) AS paid_invoices,
    COUNT(CASE WHEN i.status IN ('pending', 'sent') THEN 1 END) AS pending_invoices,
    COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) AS overdue_invoices,

    -- Revenue
    COALESCE(SUM(i.amount), 0) AS total_invoiced,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) AS revenue_collected,
    COALESCE(SUM(CASE WHEN i.status IN ('pending', 'sent') THEN i.amount ELSE 0 END), 0) AS pending_revenue,
    COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN i.amount ELSE 0 END), 0) AS overdue_revenue,

    -- Averages
    AVG(i.amount) AS average_invoice_amount,
    AVG(CASE WHEN i.status = 'paid' AND i."paidDate" IS NOT NULL
        THEN i."paidDate" - i."invoiceDate"
        ELSE NULL
    END) AS avg_days_to_payment,

    -- Unique clients
    COUNT(DISTINCT i."clientId") AS unique_clients,

    -- Metadata
    MIN(i."invoiceDate") AS period_start,
    MAX(i."invoiceDate") AS period_end

FROM invoices i
GROUP BY EXTRACT(YEAR FROM i."invoiceDate"), EXTRACT(MONTH FROM i."invoiceDate"), TO_CHAR(i."invoiceDate", 'YYYY-MM');

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_revenue_summary_year_month ON monthly_revenue_summary(year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_summary_year_month_str ON monthly_revenue_summary(year_month);

\echo '✓ Materialized view created: monthly_revenue_summary'

-- =====================================================
-- VIEW: case_type_analytics
-- =====================================================
-- Analytics by case type for performance tracking
-- Updated: Daily via scheduled job
CREATE MATERIALIZED VIEW IF NOT EXISTS case_type_analytics AS
SELECT
    c."caseType",
    c."practiceArea",

    -- Case counts
    COUNT(*) AS total_cases,
    COUNT(CASE WHEN c.status = 'open' THEN 1 END) AS open_cases,
    COUNT(CASE WHEN c.status = 'closed' THEN 1 END) AS closed_cases,

    -- Duration statistics
    AVG(CASE WHEN c."closedDate" IS NOT NULL
        THEN c."closedDate" - c."filingDate"
        ELSE NULL
    END) AS avg_case_duration_days,
    MIN(CASE WHEN c."closedDate" IS NOT NULL
        THEN c."closedDate" - c."filingDate"
        ELSE NULL
    END) AS min_case_duration_days,
    MAX(CASE WHEN c."closedDate" IS NOT NULL
        THEN c."closedDate" - c."filingDate"
        ELSE NULL
    END) AS max_case_duration_days,

    -- Financial statistics
    COALESCE(SUM(i.amount), 0) AS total_revenue,
    COALESCE(AVG(i.amount), 0) AS avg_revenue_per_case,

    -- Time statistics
    COALESCE(SUM(te.hours), 0) AS total_hours,
    COALESCE(AVG(te_case_sum.case_hours), 0) AS avg_hours_per_case,

    -- Document statistics
    COALESCE(AVG(doc_count.doc_count), 0) AS avg_documents_per_case,

    -- Success rate (cases won/closed successfully)
    COUNT(CASE WHEN c.status = 'closed' AND (c.metadata->>'outcome')::text IN ('won', 'settled_favorably') THEN 1 END)::DECIMAL /
    NULLIF(COUNT(CASE WHEN c.status = 'closed' THEN 1 END), 0) * 100 AS success_rate_percentage,

    -- Metadata
    MIN(c."filingDate") AS earliest_case_date,
    MAX(c."filingDate") AS latest_case_date

FROM cases c
LEFT JOIN invoices i ON i."caseId" = c.id AND i.status = 'paid'
LEFT JOIN time_entries te ON te."caseId" = c.id
LEFT JOIN (
    SELECT "caseId", SUM(hours) AS case_hours
    FROM time_entries
    GROUP BY "caseId"
) te_case_sum ON te_case_sum."caseId" = c.id
LEFT JOIN (
    SELECT "caseId", COUNT(*) AS doc_count
    FROM legal_documents
    GROUP BY "caseId"
) doc_count ON doc_count."caseId" = c.id
GROUP BY c."caseType", c."practiceArea";

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_case_type_analytics_type ON case_type_analytics("caseType");
CREATE INDEX IF NOT EXISTS idx_case_type_analytics_practice ON case_type_analytics("practiceArea");

\echo '✓ Materialized view created: case_type_analytics'

-- =====================================================
-- VIEW: overdue_items_dashboard
-- =====================================================
-- Consolidated view of all overdue items
-- Updated: Hourly via scheduled job
CREATE MATERIALIZED VIEW IF NOT EXISTS overdue_items_dashboard AS
-- Overdue invoices
SELECT
    'invoice' AS item_type,
    i.id AS item_id,
    i."invoiceNumber" AS item_reference,
    c."caseNumber" AS case_reference,
    cl.name AS client_name,
    i.amount,
    i."dueDate" AS due_date,
    CURRENT_DATE - i."dueDate" AS days_overdue,
    i.status,
    i."createdAt",
    i."updatedAt"
FROM invoices i
LEFT JOIN cases c ON c.id = i."caseId"
LEFT JOIN clients cl ON cl.id = i."clientId"
WHERE i.status IN ('pending', 'sent', 'overdue')
    AND i."dueDate" < CURRENT_DATE

UNION ALL

-- Overdue discovery requests
SELECT
    'discovery' AS item_type,
    dr.id AS item_id,
    dr."requestNumber" AS item_reference,
    c."caseNumber" AS case_reference,
    cl.name AS client_name,
    NULL AS amount,
    dr."dueDate" AS due_date,
    CURRENT_DATE - dr."dueDate" AS days_overdue,
    dr.status,
    dr."createdAt",
    dr."updatedAt"
FROM discovery_requests dr
JOIN cases c ON c.id = dr."caseId"
LEFT JOIN clients cl ON cl.id = c."clientId"
WHERE dr.status NOT IN ('completed', 'withdrawn')
    AND dr."dueDate" < CURRENT_DATE

UNION ALL

-- Upcoming motion hearings
SELECT
    'motion' AS item_type,
    m.id AS item_id,
    m."motionNumber" AS item_reference,
    c."caseNumber" AS case_reference,
    cl.name AS client_name,
    NULL AS amount,
    m."hearingDate" AS due_date,
    m."hearingDate" - CURRENT_DATE AS days_overdue,
    m.status,
    m."createdAt",
    m."updatedAt"
FROM motions m
JOIN cases c ON c.id = m."caseId"
LEFT JOIN clients cl ON cl.id = c."clientId"
WHERE m."hearingDate" IS NOT NULL
    AND m."hearingDate" BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    AND m.status NOT IN ('granted', 'denied', 'withdrawn');

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS idx_overdue_dashboard_item_type ON overdue_items_dashboard(item_type);
CREATE INDEX IF NOT EXISTS idx_overdue_dashboard_due_date ON overdue_items_dashboard(due_date);
CREATE INDEX IF NOT EXISTS idx_overdue_dashboard_days_overdue ON overdue_items_dashboard(days_overdue DESC);

\echo '✓ Materialized view created: overdue_items_dashboard'

-- =====================================================
-- Refresh Function
-- =====================================================
-- Creates a convenience function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
    RAISE NOTICE 'Refreshing all materialized views...';

    REFRESH MATERIALIZED VIEW CONCURRENTLY case_statistics_summary;
    RAISE NOTICE '✓ Refreshed: case_statistics_summary';

    REFRESH MATERIALIZED VIEW CONCURRENTLY client_financial_summary;
    RAISE NOTICE '✓ Refreshed: client_financial_summary';

    REFRESH MATERIALIZED VIEW CONCURRENTLY user_productivity_metrics;
    RAISE NOTICE '✓ Refreshed: user_productivity_metrics';

    REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue_summary;
    RAISE NOTICE '✓ Refreshed: monthly_revenue_summary';

    REFRESH MATERIALIZED VIEW CONCURRENTLY case_type_analytics;
    RAISE NOTICE '✓ Refreshed: case_type_analytics';

    REFRESH MATERIALIZED VIEW CONCURRENTLY overdue_items_dashboard;
    RAISE NOTICE '✓ Refreshed: overdue_items_dashboard';

    RAISE NOTICE 'All materialized views refreshed successfully!';
END;
$$ LANGUAGE plpgsql;

\echo '✓ Function created: refresh_all_materialized_views()'

\echo ''
\echo 'To refresh all views, run: SELECT refresh_all_materialized_views();'
\echo ''
\echo '✓ All materialized views successfully created!'
