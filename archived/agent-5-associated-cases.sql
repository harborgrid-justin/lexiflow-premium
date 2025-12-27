-- ========================================================================
-- AGENT 5: ASSOCIATED CASES LOADER
-- Case 24-2160: Consolidated Case Relationships
-- Generated: 2025-12-27
-- ========================================================================

-- ========================================================================
-- SECTION 1: DATA EXTRACTED FROM XML
-- ========================================================================
-- Source: /home/user/lexiflow-premium/04_24-2160_Docket.xml
-- Element: <associatedCase leadCaseNumber="24-2160" memberCaseNumber="25-1229"
--           associatedType="Consolidated" dateStart="04/25/2025" dateEnd="" />
--
-- Associated Case Data:
--   - Lead Case Number: 24-2160
--   - Member Case Number: 25-1229
--   - Association Type: Consolidated
--   - Date Start: 04/25/2025
--   - Date End: (empty/ongoing)
-- ========================================================================

-- ========================================================================
-- SECTION 2: DATABASE SCHEMA ANALYSIS
-- ========================================================================
-- Current Schema:
-- 1. cases table EXISTS with the following relevant fields:
--    - id (uuid, primary key)
--    - title (varchar)
--    - case_number (varchar, unique)
--    - related_cases (jsonb) - Array of {court, caseNumber, relationship}
--    - is_archived (boolean)
--    NOTE: is_consolidated field does NOT exist
--
-- 2. No dedicated case_associations or related_cases table exists
--
-- Solution:
-- - Add is_consolidated boolean column to cases table
-- - Use existing related_cases JSONB column to store association data
-- ========================================================================

-- ========================================================================
-- SECTION 3: ADD is_consolidated COLUMN
-- ========================================================================
-- Add the is_consolidated boolean field if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'cases'
        AND column_name = 'is_consolidated'
    ) THEN
        ALTER TABLE cases ADD COLUMN is_consolidated BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN cases.is_consolidated IS 'Indicates if this case is consolidated with other cases';

        -- Create index for better query performance
        CREATE INDEX idx_cases_is_consolidated ON cases(is_consolidated)
        WHERE is_consolidated = TRUE;

        RAISE NOTICE 'Added is_consolidated column to cases table';
    ELSE
        RAISE NOTICE 'is_consolidated column already exists';
    END IF;
END $$;

-- ========================================================================
-- SECTION 4: UPDATE CASE 24-2160 - SET CONSOLIDATION FLAG
-- ========================================================================
-- Update the lead case (24-2160) to mark it as consolidated
UPDATE cases
SET is_consolidated = TRUE,
    updated_at = NOW()
WHERE case_number = '24-2160';

-- Verify the update
SELECT id, case_number, title, is_consolidated, related_cases
FROM cases
WHERE case_number = '24-2160';

-- ========================================================================
-- SECTION 5: UPDATE related_cases JSONB FIELD
-- ========================================================================
-- Add the consolidated case relationship to the related_cases JSONB field
UPDATE cases
SET related_cases = COALESCE(related_cases, '[]'::jsonb) || jsonb_build_array(
    jsonb_build_object(
        'caseNumber', '25-1229',
        'relationship', 'Consolidated',
        'dateStart', '2025-04-25',
        'dateEnd', null,
        'type', 'member',
        'notes', 'Member case consolidated with lead case 24-2160'
    )
),
    updated_at = NOW()
WHERE case_number = '24-2160';

-- Verify the related_cases update
SELECT id, case_number, title, is_consolidated,
       jsonb_pretty(related_cases) as related_cases_formatted
FROM cases
WHERE case_number = '24-2160';

-- ========================================================================
-- SECTION 6: CREATE SHELL RECORD FOR MEMBER CASE (25-1229)
-- ========================================================================
-- Check if case 25-1229 exists, create if it doesn't
DO $$
DECLARE
    v_case_id UUID;
    v_lead_case_id UUID;
    v_client_id UUID;
BEGIN
    -- Get the lead case ID and client ID
    SELECT id, client_id INTO v_lead_case_id, v_client_id
    FROM cases
    WHERE case_number = '24-2160';

    -- Check if member case exists
    SELECT id INTO v_case_id
    FROM cases
    WHERE case_number = '25-1229';

    IF v_case_id IS NULL THEN
        -- Create shell record for member case
        INSERT INTO cases (
            id,
            title,
            case_number,
            description,
            type,
            status,
            practice_area,
            jurisdiction,
            court,
            nature_of_suit,
            filing_date,
            client_id,
            is_consolidated,
            related_cases,
            metadata,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            'Consolidated Member Case 25-1229 (Related to 24-2160)',
            '25-1229',
            'Consolidated member case - part of case 24-2160',
            'Bankruptcy',
            'Active',
            'Bankruptcy Appeals',
            'Fourth Circuit',
            'United States Court of Appeals for the Fourth Circuit',
            '3422 Bankruptcy Appeals Rule 28 USC 158',
            '2025-04-25',
            v_client_id,
            TRUE,
            jsonb_build_array(
                jsonb_build_object(
                    'caseNumber', '24-2160',
                    'relationship', 'Consolidated',
                    'dateStart', '2025-04-25',
                    'dateEnd', null,
                    'type', 'lead',
                    'notes', 'Consolidated with lead case 24-2160'
                )
            ),
            jsonb_build_object(
                'consolidation_type', 'member',
                'lead_case_number', '24-2160',
                'consolidation_date', '2025-04-25',
                'auto_created', true,
                'needs_full_import', true
            ),
            NOW(),
            NOW()
        )
        RETURNING id INTO v_case_id;

        RAISE NOTICE 'Created shell record for member case 25-1229 with ID: %', v_case_id;
    ELSE
        -- Update existing case to mark as consolidated
        UPDATE cases
        SET is_consolidated = TRUE,
            related_cases = COALESCE(related_cases, '[]'::jsonb) || jsonb_build_array(
                jsonb_build_object(
                    'caseNumber', '24-2160',
                    'relationship', 'Consolidated',
                    'dateStart', '2025-04-25',
                    'dateEnd', null,
                    'type', 'lead',
                    'notes', 'Consolidated with lead case 24-2160'
                )
            ),
            metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
                'consolidation_type', 'member',
                'lead_case_number', '24-2160',
                'consolidation_date', '2025-04-25'
            ),
            updated_at = NOW()
        WHERE id = v_case_id;

        RAISE NOTICE 'Updated existing case 25-1229 with consolidation information';
    END IF;
END $$;

-- ========================================================================
-- SECTION 7: VERIFICATION QUERIES
-- ========================================================================

-- Verify both cases are properly configured
SELECT
    case_number,
    title,
    is_consolidated,
    jsonb_pretty(related_cases) as related_cases,
    jsonb_pretty(metadata) as metadata
FROM cases
WHERE case_number IN ('24-2160', '25-1229')
ORDER BY case_number;

-- Query to find all consolidated cases
SELECT
    case_number,
    title,
    is_consolidated,
    jsonb_array_length(related_cases) as num_related_cases,
    created_at,
    updated_at
FROM cases
WHERE is_consolidated = TRUE
ORDER BY case_number;

-- ========================================================================
-- SECTION 8: ROLLBACK SCRIPT (for testing/cleanup)
-- ========================================================================
-- CAUTION: Only run this if you need to undo the changes

/*
-- Remove consolidation from case 24-2160
UPDATE cases
SET is_consolidated = FALSE,
    related_cases = NULL,
    updated_at = NOW()
WHERE case_number = '24-2160';

-- Remove the shell case 25-1229 (only if it was auto-created)
DELETE FROM cases
WHERE case_number = '25-1229'
AND metadata->>'auto_created' = 'true';

-- Drop the is_consolidated column (if needed)
-- DROP INDEX IF EXISTS idx_cases_is_consolidated;
-- ALTER TABLE cases DROP COLUMN IF EXISTS is_consolidated;
*/

-- ========================================================================
-- SECTION 9: SUMMARY
-- ========================================================================
-- Actions Performed:
-- 1. Added is_consolidated boolean column to cases table
-- 2. Updated case 24-2160:
--    - Set is_consolidated = TRUE
--    - Added consolidation relationship to related_cases JSONB
-- 3. Created/Updated case 25-1229:
--    - Created shell record if doesn't exist
--    - Set is_consolidated = TRUE
--    - Added reverse relationship to related_cases JSONB
--    - Added metadata indicating consolidation details
-- 4. Created index on is_consolidated for query performance
--
-- Data Structure:
-- The related_cases JSONB field stores an array of consolidation relationships:
-- {
--   "caseNumber": "25-1229",
--   "relationship": "Consolidated",
--   "dateStart": "2025-04-25",
--   "dateEnd": null,
--   "type": "member",
--   "notes": "Member case consolidated with lead case 24-2160"
-- }
-- ========================================================================
