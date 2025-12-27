-- ============================================================================
-- AGENT 1: CASE METADATA LOADER - SQL SCRIPT
-- ============================================================================
-- Case: 24-2160 (Justin Saadein-Morales v. Westridge Swim & Racquet Club)
-- Generated: 2025-12-27
-- XML Source: /home/user/lexiflow-premium/04_24-2160_Docket.xml
--
-- EXECUTION INSTRUCTIONS:
-- psql "postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require" < agent1_case_metadata_insert.sql
-- ============================================================================

DO $$
DECLARE
    v_org_id UUID;
    v_case_id UUID;
    v_existing_case_id UUID;
    v_operation TEXT;
BEGIN
    -- ========================================================================
    -- STEP 1: Check/Create Organization for Fourth Circuit Court of Appeals
    -- ========================================================================

    RAISE NOTICE '=== STEP 1: Organization Setup ===';

    -- Check if organization exists
    SELECT id INTO v_org_id
    FROM organizations
    WHERE name = 'Fourth Circuit Court of Appeals'
    LIMIT 1;

    IF v_org_id IS NULL THEN
        -- Create organization
        v_org_id := '4c1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c'::UUID;

        INSERT INTO organizations (
            id,
            name,
            created_at,
            updated_at
        ) VALUES (
            v_org_id,
            'Fourth Circuit Court of Appeals',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );

        RAISE NOTICE 'Created organization: % (ID: %)', 'Fourth Circuit Court of Appeals', v_org_id;
    ELSE
        RAISE NOTICE 'Organization already exists: % (ID: %)', 'Fourth Circuit Court of Appeals', v_org_id;
    END IF;

    -- ========================================================================
    -- STEP 2: Check if Case Already Exists
    -- ========================================================================

    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 2: Check Existing Case ===';

    SELECT id INTO v_existing_case_id
    FROM cases
    WHERE title = 'Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.'
       OR case_number = '24-2160'
    LIMIT 1;

    -- ========================================================================
    -- STEP 3: Insert or Update Case Record
    -- ========================================================================

    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 3: Case Record Operation ===';

    IF v_existing_case_id IS NULL THEN
        -- INSERT NEW CASE
        v_case_id := 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d'::UUID;
        v_operation := 'INSERT';

        INSERT INTO cases (
            id,
            org_id,
            title,
            case_number,
            matter_type,
            status,
            jurisdiction,
            court,
            filing_date,
            is_consolidated,
            created_at,
            updated_at
        ) VALUES (
            v_case_id,                                          -- id (UUID)
            v_org_id,                                          -- org_id (Fourth Circuit)
            'Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.', -- title
            '24-2160',                                         -- case_number
            'Bankruptcy-District Court',                       -- matter_type
            'Appeal',                                          -- status (enum)
            'Fourth Circuit',                                  -- jurisdiction
            'United States District Court for the Eastern District of Virginia at Alexandria', -- court
            '2024-11-20'::DATE,                               -- filing_date (converted from 11/20/2024)
            FALSE,                                             -- is_consolidated (will be set by Agent 5)
            CURRENT_TIMESTAMP,                                 -- created_at
            CURRENT_TIMESTAMP                                  -- updated_at
        );

        RAISE NOTICE 'INSERTED new case record with ID: %', v_case_id;

    ELSE
        -- UPDATE EXISTING CASE
        v_case_id := v_existing_case_id;
        v_operation := 'UPDATE';

        UPDATE cases
        SET
            org_id = v_org_id,
            title = 'Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.',
            case_number = '24-2160',
            matter_type = 'Bankruptcy-District Court',
            status = 'Appeal',
            jurisdiction = 'Fourth Circuit',
            court = 'United States District Court for the Eastern District of Virginia at Alexandria',
            filing_date = '2024-11-20'::DATE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_case_id;

        RAISE NOTICE 'UPDATED existing case record with ID: %', v_case_id;

    END IF;

    -- ========================================================================
    -- STEP 4: Verification
    -- ========================================================================

    RAISE NOTICE '';
    RAISE NOTICE '=== STEP 4: Verification ===';
    RAISE NOTICE 'Operation: %', v_operation;
    RAISE NOTICE 'Organization ID: %', v_org_id;
    RAISE NOTICE 'Case ID: %', v_case_id;
    RAISE NOTICE '';
    RAISE NOTICE '✅ Case metadata loaded successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '=== EXTRACTED DATA FROM XML ===';
    RAISE NOTICE 'Case Number: 24-2160';
    RAISE NOTICE 'Date Filed: 11/20/2024 (converted to: 2024-11-20)';
    RAISE NOTICE 'Date Terminated: 09/29/2025';
    RAISE NOTICE 'Nature of Suit: 3422 Bankruptcy Appeals Rule 28 USC 158';
    RAISE NOTICE 'Short Title: Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.';
    RAISE NOTICE 'Original Court: United States District Court for the Eastern District of Virginia at Alexandria';
    RAISE NOTICE 'Case Type: Bankruptcy-District Court';
    RAISE NOTICE 'Sub Type: from the district court';

END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT
    'Case Record Verification' as query_type,
    c.id as case_id,
    c.case_number,
    c.title,
    c.matter_type,
    c.status,
    c.jurisdiction,
    c.court,
    c.filing_date,
    c.is_consolidated,
    o.id as org_id,
    o.name as organization_name
FROM cases c
LEFT JOIN organizations o ON c.org_id = o.id
WHERE c.case_number = '24-2160'
   OR c.title LIKE '%Saadein-Morales%';

-- ============================================================================
-- EXPECTED RESULTS:
-- - 1 case record for case number 24-2160
-- - Organization: Fourth Circuit Court of Appeals
-- - Status: Appeal
-- - Filing Date: 2024-11-20
-- ============================================================================
