-- ============================================================================
-- ENTERPRISE AGENT 2: PARTY & ATTORNEY LOADER (Case 25-1229)
-- ============================================================================
-- Mirrors agent2_party_attorney_insert.sql for 24-2160 but targets case 25-1229.
-- Before running, ensure Agent 1/Agent 5 scripts have created the case row.
-- ============================================================================

DO $$
DECLARE
    v_case_id UUID;
BEGIN
    -- Resolve case_id for 25-1229
    SELECT id INTO v_case_id
    FROM cases
    WHERE case_number = '25-1229'
    LIMIT 1;

    IF v_case_id IS NULL THEN
        RAISE EXCEPTION 'Case 25-1229 not found. Run agent1_case_metadata_insert_25_1229.sql first.';
    END IF;

    -- ========================================================================
    -- PARTIES
    -- ========================================================================

    -- Party 1: Debtor - Appellant (Pro Se)
    INSERT INTO parties (
        id,
        case_id,
        name,
        type,
        role,
        description,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        is_pro_se,
        created_at,
        updated_at
    ) VALUES (
        'a1b2c3d4-e5f6-7890-1234-567890abcde1'::uuid,
        v_case_id,
        'JUSTIN JEFFREY SAADEIN-MORALES',
        'individual',
        'appellant',
        'Debtor - Appellant',
        'justin.saadein@harborgrid.com',
        '678-650-6400',
        'P. O. Box 55268',
        'Washington',
        'DC',
        '20040',
        TRUE,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- Party 2: Creditor - Appellee
    INSERT INTO parties (
        id,
        case_id,
        name,
        type,
        role,
        description,
        created_at,
        updated_at
    ) VALUES (
        'b2c3d4e5-f6a7-8901-2345-67890abcdef2'::uuid,
        v_case_id,
        'WESTRIDGE SWIM & RACQUET CLUB, INC., A Community Association',
        'corporation',
        'appellee',
        'Creditor - Appellee',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    -- ========================================================================
    -- ATTORNEYS AS USERS (same identities as 24-2160 loader)
    -- ========================================================================

    INSERT INTO users (
        id, email, password_hash, first_name, last_name,
        role, phone, created_at, updated_at
    ) VALUES (
        'c3d4e5f6-a7b8-9012-3456-7890abcdef12'::uuid,
        'justin.saadein@harborgrid.com',
        'EXTERNAL_ATTORNEY',
        'Justin',
        'Saadein-Morales',
        'attorney',
        '678-650-6400',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO users (
        id, email, password_hash, first_name, last_name,
        role, phone, created_at, updated_at
    ) VALUES (
        'd4e5f6a7-b890-1234-5678-90abcdef1234'::uuid,
        'thomas.junker@mercertrigiani.com',
        'EXTERNAL_ATTORNEY',
        'Thomas',
        'Junker',
        'attorney',
        '703-837-5000',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO users (
        id, email, password_hash, first_name, last_name,
        role, phone, created_at, updated_at
    ) VALUES (
        'e5f6a7b8-9012-3456-7890-abcdef123456'::uuid,
        'rlash@bhlpc.com',
        'EXTERNAL_ATTORNEY',
        'Richard',
        'Lash',
        'attorney',
        '703-796-1341',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO users (
        id, email, password_hash, first_name, last_name,
        role, phone, created_at, updated_at
    ) VALUES (
        'f6a7b890-1234-5678-90ab-cdef12345678'::uuid,
        'david.mercer@mercertrigiani.com',
        'EXTERNAL_ATTORNEY',
        'David',
        'Mercer',
        'attorney',
        '202-659-6935',
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;

END $$;

-- Simple verification
SELECT id, case_id, name, type, role, description
FROM parties
WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229');
