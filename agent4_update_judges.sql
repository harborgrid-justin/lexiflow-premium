-- Enterprise Agent 4: Judges & Originating Court Loader
-- SQL script to update judge and originating court information

-- Extracted Data from XML:
-- Presiding Judge: Hon. Leonie M. Brinkema (U.S. District Court Judge)
-- Ordering Judge: Hon. Ivan Darnell Davis (U.S. Magistrate Judge)
-- Originating Court: United States District Court for the Eastern District of Virginia at Alexandria
-- Originating Case: 1:24-cv-01442-LMB-IDD
-- District: 0422, Division: 1
-- Date Filed: 08/16/2024
-- Important Dates:
--   - Judgment: 11/15/2024
--   - Judgment EOD: 11/18/2024
--   - NOA Filed: 11/18/2024
--   - Received COA: 11/19/2024

\echo '=== AGENT 4: JUDGES & ORIGINATING COURT LOADER ==='
\echo ''
\echo 'Finding case record...'

-- Find the case
\set case_id '(SELECT id FROM cases WHERE case_number = ''24-2160'' OR title ILIKE ''%Saadein-Morales%'' LIMIT 1)'

-- Display case info
SELECT id, case_number, title, judge, court
FROM cases
WHERE case_number = '24-2160' OR title ILIKE '%Saadein-Morales%';

\echo ''
\echo 'Updating cases table with judge information...'

-- Update the cases table with judge information
UPDATE cases
SET judge = 'Hon. Leonie M. Brinkema',
    court = COALESCE(court, 'United States Court of Appeals for the Fourth Circuit'),
    updated_at = NOW()
WHERE case_number = '24-2160' OR title ILIKE '%Saadein-Morales%';

\echo ''
\echo 'Cases table updated!'

-- Check if judges table exists and insert if it does
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'judges') THEN
    RAISE NOTICE 'Judges table found - inserting judge records...';

    -- Insert presiding judge
    INSERT INTO judges (name, title, court, role, created_at, updated_at)
    VALUES (
      'Hon. Leonie M. Brinkema',
      'U. S. District Court Judge',
      'United States District Court for the Eastern District of Virginia at Alexandria',
      'Presiding Judge',
      NOW(),
      NOW()
    )
    ON CONFLICT (name) DO UPDATE
    SET title = EXCLUDED.title,
        court = EXCLUDED.court,
        role = EXCLUDED.role,
        updated_at = NOW();

    -- Insert ordering judge
    INSERT INTO judges (name, title, court, role, created_at, updated_at)
    VALUES (
      'Hon. Ivan Darnell Davis',
      'U. S. Magistrate Judge',
      'United States District Court for the Eastern District of Virginia at Alexandria',
      'Ordering Judge',
      NOW(),
      NOW()
    )
    ON CONFLICT (name) DO UPDATE
    SET title = EXCLUDED.title,
        court = EXCLUDED.court,
        role = EXCLUDED.role,
        updated_at = NOW();

    RAISE NOTICE 'Judge records inserted/updated!';
  ELSE
    RAISE NOTICE 'No judges table found - skipping judge table population';
  END IF;
END $$;

-- Check if originating_courts table exists and insert if it does
DO $$
DECLARE
  v_case_id UUID;
BEGIN
  -- Get case ID
  SELECT id INTO v_case_id FROM cases
  WHERE case_number = '24-2160' OR title ILIKE '%Saadein-Morales%'
  LIMIT 1;

  IF v_case_id IS NULL THEN
    RAISE EXCEPTION 'Case not found!';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'originating_courts') THEN
    RAISE NOTICE 'Originating_courts table found - inserting court record...';

    INSERT INTO originating_courts (
      case_id,
      district,
      division,
      case_number,
      date_filed,
      case_number_link,
      court_name,
      created_at,
      updated_at
    )
    VALUES (
      v_case_id,
      '0422',
      '1',
      '1:24-cv-01442-LMB-IDD',
      '08/16/2024',
      'https://ecf.vaed.uscourts.gov/cgi-bin/DktRpt.pl?caseNumber=1:24-cv-01442-LMB-IDD',
      'United States District Court for the Eastern District of Virginia at Alexandria',
      NOW(),
      NOW()
    )
    ON CONFLICT (case_id) DO UPDATE
    SET district = EXCLUDED.district,
        division = EXCLUDED.division,
        case_number = EXCLUDED.case_number,
        date_filed = EXCLUDED.date_filed,
        case_number_link = EXCLUDED.case_number_link,
        court_name = EXCLUDED.court_name,
        updated_at = NOW();

    RAISE NOTICE 'Originating court record inserted/updated!';
  ELSE
    RAISE NOTICE 'No originating_courts table found - skipping';
  END IF;
END $$;

-- Check if case_dates table exists and insert dates if it does
DO $$
DECLARE
  v_case_id UUID;
BEGIN
  -- Get case ID
  SELECT id INTO v_case_id FROM cases
  WHERE case_number = '24-2160' OR title ILIKE '%Saadein-Morales%'
  LIMIT 1;

  IF v_case_id IS NULL THEN
    RAISE EXCEPTION 'Case not found!';
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'case_dates') THEN
    RAISE NOTICE 'Case_dates table found - inserting important dates...';

    -- Insert judgment date
    INSERT INTO case_dates (case_id, date_type, date_value, description, created_at, updated_at)
    VALUES (v_case_id, 'judgment_date', '11/15/2024', 'Judgment Date', NOW(), NOW())
    ON CONFLICT (case_id, date_type) DO UPDATE
    SET date_value = EXCLUDED.date_value,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- Insert judgment EOD
    INSERT INTO case_dates (case_id, date_type, date_value, description, created_at, updated_at)
    VALUES (v_case_id, 'judgment_eod', '11/18/2024', 'Judgment Entry on Docket', NOW(), NOW())
    ON CONFLICT (case_id, date_type) DO UPDATE
    SET date_value = EXCLUDED.date_value,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- Insert NOA filed
    INSERT INTO case_dates (case_id, date_type, date_value, description, created_at, updated_at)
    VALUES (v_case_id, 'noa_filed', '11/18/2024', 'Notice of Appeal Filed', NOW(), NOW())
    ON CONFLICT (case_id, date_type) DO UPDATE
    SET date_value = EXCLUDED.date_value,
        description = EXCLUDED.description,
        updated_at = NOW();

    -- Insert received at COA
    INSERT INTO case_dates (case_id, date_type, date_value, description, created_at, updated_at)
    VALUES (v_case_id, 'recd_coa', '11/19/2024', 'Received at Court of Appeals', NOW(), NOW())
    ON CONFLICT (case_id, date_type) DO UPDATE
    SET date_value = EXCLUDED.date_value,
        description = EXCLUDED.description,
        updated_at = NOW();

    RAISE NOTICE 'Important dates inserted/updated!';
  ELSE
    RAISE NOTICE 'No case_dates table found - skipping date population';
  END IF;
END $$;

\echo ''
\echo '=== SUMMARY ==='
\echo 'Judge Information Extracted:'
\echo '  Presiding Judge: Hon. Leonie M. Brinkema (U.S. District Court Judge)'
\echo '  Ordering Judge: Hon. Ivan Darnell Davis (U.S. Magistrate Judge)'
\echo ''
\echo 'Originating Court Data:'
\echo '  District: 0422'
\echo '  Division: 1'
\echo '  Case Number: 1:24-cv-01442-LMB-IDD'
\echo '  Date Filed: 08/16/2024'
\echo '  Court: United States District Court for the Eastern District of Virginia at Alexandria'
\echo ''
\echo 'Important Dates:'
\echo '  Judgment Date: 11/15/2024'
\echo '  Judgment Entry on Docket: 11/18/2024'
\echo '  Notice of Appeal Filed: 11/18/2024'
\echo '  Received at Court of Appeals: 11/19/2024'
\echo ''
\echo '✅ Agent 4 Complete!'

-- Display final case state
\echo ''
\echo 'Final Case State:'
SELECT id, case_number, title, judge, court, created_at, updated_at
FROM cases
WHERE case_number = '24-2160' OR title ILIKE '%Saadein-Morales%';
