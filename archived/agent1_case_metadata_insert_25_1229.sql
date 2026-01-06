-- Agent 1: Case Metadata Insert for Case 25-1229
-- Justin Jeffrey Saadein-Morales v. Westridge Swim & Racquet Club, Inc.
-- Bankruptcy appeal to Fourth Circuit Court of Appeals
-- Originating case: 1:24-cv-01442-LMB-IDD (EDVA Alexandria)

DO $$
DECLARE
    v_org_id UUID;
    v_case_id UUID;
    v_client_id UUID;
BEGIN
    -- Ensure Fourth Circuit organization exists
    INSERT INTO organizations (
        id,
        name,
        organization_type,
        description,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000004001'::UUID,
        'Fourth Circuit Court of Appeals',
        'court',
        'United States Court of Appeals for the Fourth Circuit',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO NOTHING;

    v_org_id := '00000000-0000-0000-0000-000000004001'::UUID;

    -- Create or get default client for demo purposes
    INSERT INTO clients (
        id,
        name,
        type,
        email,
        phone,
        status,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000001'::UUID,
        'Pro Se Litigants',
        'Individual',
        'demo@lexiflow.com',
        '000-000-0000',
        'Active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

    v_client_id := '00000000-0000-0000-0000-000000000001'::UUID;

    -- Insert or update case 25-1229
    INSERT INTO cases (
        id,
        case_number,
        title,
        type,
        status,
        practice_area,
        jurisdiction,
        court,
        filing_date,
        date_terminated,
        cause_of_action,
        nature_of_suit,
        nature_of_suit_code,
        client_id,
        is_consolidated,
        related_cases,
        metadata,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        '25-1229',
        'Justin Saadein-Morales v. Westridge Swim & Racquet Club, Inc.',
        'bankruptcy',
        'active',
        'Bankruptcy',
        'Fourth Circuit',
        'United States Court of Appeals for the Fourth Circuit',
        '2025-03-12',
        '2025-09-29',
        '3422 Bankruptcy Appeals Rule 28 USC 158',
        'Bankruptcy Appeals from District Court',
        '0422',
        v_client_id,
        TRUE,
        jsonb_build_array(
            jsonb_build_object(
                'case_number', '24-2160',
                'relationship', 'Consolidated',
                'consolidation_date', '2025-04-25',
                'court', 'United States Court of Appeals for the Fourth Circuit'
            ),
            jsonb_build_object(
                'case_number', '1:24-cv-01442-LMB-IDD',
                'relationship', 'Originating',
                'court', 'United States District Court for the Eastern District of Virginia at Alexandria',
                'filing_date', '2024-08-16',
                'ecf_url', 'https://ecf.vaed.uscourts.gov/cgi-bin/DktRpt.pl?caseNumber=1:24-cv-01442-LMB-IDD'
            )
        ),
        jsonb_build_object(
            'originating_court', jsonb_build_object(
                'name', 'United States District Court for the Eastern District of Virginia at Alexandria',
                'case_number', '1:24-cv-01442-LMB-IDD',
                'case_type', 'ORIG_CRT',
                'nature_of_suit_code', '0422',
                'consolidated_member_count', 1,
                'filing_date', '2024-08-16',
                'ecf_url', 'https://ecf.vaed.uscourts.gov/cgi-bin/DktRpt.pl?caseNumber=1:24-cv-01442-LMB-IDD'
            ),
            'originating_judges', jsonb_build_array(
                jsonb_build_object(
                    'role', 'Presiding Judge',
                    'first_name', 'Leonie',
                    'middle_name', 'M.',
                    'last_name', 'Brinkema',
                    'title', 'U. S. District Court Judge'
                ),
                jsonb_build_object(
                    'role', 'Ordering Judge',
                    'first_name', 'Ivan',
                    'middle_name', 'Darnell',
                    'last_name', 'Davis',
                    'title', 'U. S. Magistrate Judge'
                )
            ),
            'originating_dates', jsonb_build_object(
                'judgment_date', '2025-02-26',
                'notice_of_appeal_date', '2025-02-26',
                'docketed_date', '2025-03-07',
                'record_due_date', '2025-03-11'
            ),
            'final_disposition', jsonb_build_object(
                'opinion_date', '2025-09-29',
                'judgment_date', '2025-09-29',
                'mandate_date', '2025-10-21',
                'decision', 'Dismissed',
                'opinion_type', 'Unpublished Per Curiam',
                'ecf_opinion_number', '1001850040',
                'ecf_judgment_number', '1001850048',
                'ecf_mandate_number', '1001863664'
            )
        ),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (case_number)
    DO UPDATE SET
        title = EXCLUDED.title,
        matter_type = EXCLUDED.matter_type,
        status = EXCLUDED.status,
        practice_area = EXCLUDED.practice_area,
        jurisdiction = EXCLUDED.jurisdiction,
        court = EXCLUDED.court,
        filing_date = EXCLUDED.filing_date,
        date_terminated = EXCLUDED.date_terminated,
        cause_of_action = EXCLUDED.cause_of_action,
        nature_of_suit = EXCLUDED.nature_of_suit,
        nature_of_suit_code = EXCLUDED.nature_of_suit_code,
        is_consolidated = EXCLUDED.is_consolidated,
        related_cases = EXCLUDED.related_cases,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_case_id;

    RAISE NOTICE 'Case 25-1229 inserted/updated with ID: %', v_case_id;
END $$;
