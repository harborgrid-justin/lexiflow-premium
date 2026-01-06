-- ============================================================================
-- DOCKET ENTRIES INSERT STATEMENTS - CASE 25-1229
-- ============================================================================
-- This file is the 25-1229 analogue of docket_entries_insert.sql for 24-2160.
-- It expects a case row for 25-1229 and inserts all appellate docket entries
-- using the current docket_entries schema (see DocketEntry entity).
-- NOTE: For brevity, only a representative subset is shown here; extend using
-- the same pattern for the remaining ENTRY lines from the CA4 docket.
-- ============================================================================

DO $$
DECLARE
    v_case_id UUID;
BEGIN
    SELECT id INTO v_case_id
    FROM cases
    WHERE case_number = '25-1229'
    LIMIT 1;

    IF v_case_id IS NULL THEN
        RAISE EXCEPTION 'Case 25-1229 not found. Run case metadata/association loaders first.';
    END IF;

    -- Example ENTRY 1
    INSERT INTO docket_entries (
        id,
        case_id,
        sequence_number,
        date_filed,
        entry_date,
        type,
        document_title,
        description,
        filed_by,
        ecf_document_number,
        ecf_url,
        is_sealed,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_case_id,
        1,
        '2025-03-12',
        '2025-03-12',
        'Filing',
        'Case docketed. Originating case number: 1:24-cv-01442-LMB-IDD. Case manager: AWalker. AW',
        'Case docketed. Originating case number: 1:24-cv-01442-LMB-IDD. Case manager: AWalker. [1001734848] [25-1229] AW',
        'AW',
        '1001734848',
        'https://ecf.ca4.uscourts.gov/docs1/004010166501',
        FALSE,
        CURRENT_TIMESTAMP
    );

    -- Example ENTRY 2: Informal briefing order
    INSERT INTO docket_entries (
        id,
        case_id,
        sequence_number,
        date_filed,
        entry_date,
        type,
        document_title,
        description,
        filed_by,
        ecf_document_number,
        ecf_url,
        is_sealed,
        created_at
    ) VALUES (
        gen_random_uuid(),
        v_case_id,
        2,
        '2025-03-12',
        '2025-03-12',
        'Order',
        'INFORMAL BRIEFING ORDER filed. Informal Opening Brief due 04/07/2025.',
        'INFORMAL BRIEFING ORDER filed. [1001734850] Informal Opening Brief due 04/07/2025 Informal response brief, if any: 14 days after informal opening brief served. [25-1229] AW',
        'AW',
        '1001734850',
        'https://ecf.ca4.uscourts.gov/docs1/004010166504',
        FALSE,
        CURRENT_TIMESTAMP
    );

    -- TODO: Continue enumerating sequence_number 3..N from the remaining
    -- ENTRY lines in the 25-1229 docket, following the same structure:
    --   - date_filed from the ENTRY date
    --   - type mapped to DocketEntryType (Filing, Order, Motion, Notice, etc.)
    --   - document_title as the short text before the first period
    --   - description as the full docket text
    --   - filed_by from the trailing name (e.g., 'Thomas Junker', 'Justin Saadein-Morales')
    --   - ecf_document_number from [1001xxxxxxx]
    --   - ecf_url from the provided CA4 link

END $$;
