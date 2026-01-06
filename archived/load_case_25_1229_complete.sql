-- ============================================================================
-- MASTER LOADER: Complete Data Ingestion for Case 25-1229
-- ============================================================================
-- Justin Jeffrey Saadein-Morales v. Westridge Swim & Racquet Club, Inc.
-- Fourth Circuit Court of Appeals, consolidated with 24-2160
-- Originating case: 1:24-cv-01442-LMB-IDD (EDVA Alexandria)
--
-- This script orchestrates the complete ingestion of case 25-1229 data:
--   1. Case metadata with originating court and judges
--   2. Consolidation relationship with 24-2160
--   3. Parties and attorneys
--   4. All 127 docket entries
--
-- Prerequisites:
--   - PostgreSQL database with LexiFlow schema
--   - Tables: organizations, clients, cases, parties, users, docket_entries
--
-- Usage:
--   psql -h <host> -U <user> -d <database> -f load_case_25_1229_complete.sql
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'LEXIFLOW ENTERPRISE: Case 25-1229 Complete Data Ingestion'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

\echo '▶ Step 1: Creating/updating case 25-1229 with originating court metadata...'
\i archived/agent1_case_metadata_insert_25_1229.sql
\echo '✓ Case metadata loaded'
\echo ''

\echo '▶ Step 2: Establishing consolidation relationship with case 24-2160...'
\i archived/agent-5-associated-cases.sql
\echo '✓ Consolidation relationship established'
\echo ''

\echo '▶ Step 3: Creating parties and attorney records...'
\i archived/agent2_party_attorney_insert_25_1229.sql
\echo '✓ Parties and attorneys loaded'
\echo ''

\echo '▶ Step 4: Inserting all 127 docket entries...'
\i archived/docket_entries_insert_25_1229.generated.sql
\echo '✓ Docket entries loaded'
\echo ''

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo 'VERIFICATION SUMMARY'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''

-- Case summary
\echo '📁 Case Information:'
SELECT
    case_number,
    title,
    matter_type,
    status,
    jurisdiction,
    filing_date,
    date_terminated,
    cause_of_action,
    nature_of_suit_code,
    is_consolidated,
    jsonb_array_length(related_cases) as related_case_count
FROM cases
WHERE case_number = '25-1229';

\echo ''
\echo '👥 Parties (2 expected):'
SELECT
    name,
    party_type as type,
    role,
    CASE WHEN is_pro_se THEN 'Pro Se' ELSE 'Represented' END as representation
FROM parties
WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229')
ORDER BY role;

\echo ''
\echo '⚖️ Attorneys (4 expected):'
SELECT
    name,
    email,
    role,
    metadata->>'firm' as firm
FROM users
WHERE email IN (
    'justin.saadein@harborgrid.com',
    'thomas.junker@mercertrigiani.com',
    'rlash@bhlpc.com',
    'david.mercer@mercertrigiani.com'
)
ORDER BY name;

\echo ''
\echo '📋 Docket Entries (127 expected):'
SELECT
    COUNT(*) as total_entries,
    MIN(sequence_number) as first_seq,
    MAX(sequence_number) as last_seq,
    MIN(date_filed) as earliest_filing,
    MAX(date_filed) as latest_filing,
    COUNT(DISTINCT type) as distinct_types
FROM docket_entries
WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229');

\echo ''
\echo '📊 Entry Type Breakdown:'
SELECT
    type,
    COUNT(*) as count
FROM docket_entries
WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229')
GROUP BY type
ORDER BY count DESC;

\echo ''
\echo '🔗 Consolidation Status:'
SELECT
    c1.case_number as case_25_1229,
    c1.is_consolidated as is_consolidated_25_1229,
    c2.case_number as case_24_2160,
    c2.is_consolidated as is_consolidated_24_2160,
    (c1.related_cases @> c2.related_cases OR c2.related_cases @> c1.related_cases) as cross_linked
FROM cases c1
CROSS JOIN cases c2
WHERE c1.case_number = '25-1229'
  AND c2.case_number = '24-2160';

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ Case 25-1229 data ingestion complete!'
\echo ''
\echo 'Next steps:'
\echo '  1. Review verification output above'
\echo '  2. Check frontend integration via DataService.cases.get("25-1229")'
\echo '  3. Verify docket timeline rendering in UI'
\echo '  4. Test search/filter across consolidated cases 24-2160 & 25-1229'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
