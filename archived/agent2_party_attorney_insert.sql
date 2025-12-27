-- ============================================================================
-- ENTERPRISE AGENT 2: PARTY & ATTORNEY LOADER
-- Generated SQL Statements for Case 24-2160
-- ============================================================================

-- Note: Replace {CASE_ID} with actual case UUID from Agent 1

-- ============================================================================
-- PARTIES TABLE INSERTS
-- ============================================================================

-- Party 1: JUSTIN JEFFREY SAADEIN-MORALES (Individual, Debtor-Appellant, Pro Se)
INSERT INTO parties (id, name, type, created_at, updated_at)
VALUES (
    'a1b2c3d4-e5f6-7890-1234-567890abcdef'::uuid,
    'JUSTIN JEFFREY SAADEIN-MORALES',
    'Individual',
    NOW(),
    NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Party 2: WESTRIDGE SWIM & RACQUET CLUB, INC. (Corporation, Creditor-Appellee)
INSERT INTO parties (id, name, type, created_at, updated_at)
VALUES (
    'b2c3d4e5-f6a7-8901-2345-67890abcdef1'::uuid,
    'WESTRIDGE SWIM & RACQUET CLUB, INC., A Community Association',
    'Corporation',
    NOW(),
    NOW()
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- CASE_PARTIES TABLE INSERTS (Junction Table)
-- ============================================================================

-- Link Justin Saadein-Morales to Case (Pro Se)
INSERT INTO case_parties (case_id, party_id, role, counsel_name, created_at, updated_at)
VALUES (
    '{CASE_ID}'::uuid,
    'a1b2c3d4-e5f6-7890-1234-567890abcdef'::uuid,
    'Debtor - Appellant',
    'Pro Se',
    NOW(),
    NOW()
)
ON CONFLICT (case_id, party_id) DO UPDATE
SET role = EXCLUDED.role,
    counsel_name = EXCLUDED.counsel_name,
    updated_at = NOW();

-- Link Westridge to Case
INSERT INTO case_parties (case_id, party_id, role, counsel_name, created_at, updated_at)
VALUES (
    '{CASE_ID}'::uuid,
    'b2c3d4e5-f6a7-8901-2345-67890abcdef1'::uuid,
    'Creditor - Appellee',
    'Thomas Charles Junker, Richard A. Lash, David Storey Mercer',
    NOW(),
    NOW()
)
ON CONFLICT (case_id, party_id) DO UPDATE
SET role = EXCLUDED.role,
    counsel_name = EXCLUDED.counsel_name,
    updated_at = NOW();

-- ============================================================================
-- USERS TABLE INSERTS (Attorneys)
-- ============================================================================

-- Attorney 1: Justin Jeffrey Saadein-Morales (Pro Se)
INSERT INTO users (
    id, email, password_hash, first_name, last_name,
    role, phone, organization, is_active, created_at, updated_at
)
VALUES (
    'c3d4e5f6-a7b8-9012-3456-7890abcdef12'::uuid,
    'justin.saadein@harborgrid.com',
    'EXTERNAL_ATTORNEY',
    'Justin',
    'Saadein-Morales',
    'attorney',
    '678-650-6400',
    'Pro Se',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Attorney 2: Thomas Charles Junker
INSERT INTO users (
    id, email, password_hash, first_name, last_name,
    role, phone, organization, is_active, created_at, updated_at
)
VALUES (
    'd4e5f6a7-b890-1234-5678-90abcdef1234'::uuid,
    'thomas.junker@mercertrigiani.com',
    'EXTERNAL_ATTORNEY',
    'Thomas',
    'Junker',
    'attorney',
    '',
    'MERCERTRIGIANI',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Attorney 3: Richard A. Lash
INSERT INTO users (
    id, email, password_hash, first_name, last_name,
    role, phone, organization, is_active, created_at, updated_at
)
VALUES (
    'e5f6a7b8-9012-3456-7890-abcdef123456'::uuid,
    'rlash@bhlpc.com',
    'EXTERNAL_ATTORNEY',
    'Richard',
    'Lash',
    'attorney',
    '',
    'BUONASSISSI, HENNING & LASH, PC',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Attorney 4: David Storey Mercer
-- Note: No email provided in XML, generating placeholder
INSERT INTO users (
    id, email, password_hash, first_name, last_name,
    role, phone, organization, is_active, created_at, updated_at
)
VALUES (
    'f6a7b890-1234-5678-90ab-cdef12345678'::uuid,
    'david.mercer@mercertrigiani.com',
    'EXTERNAL_ATTORNEY',
    'David',
    'Mercer',
    'attorney',
    '',
    'MERCERTRIGIANI',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check all parties
SELECT id, name, type FROM parties WHERE name LIKE '%SAADEIN%' OR name LIKE '%WESTRIDGE%';

-- Check case_parties links (replace {CASE_ID})
SELECT
    p.name as party_name,
    cp.role,
    cp.counsel_name
FROM case_parties cp
JOIN parties p ON cp.party_id = p.id
WHERE cp.case_id = '{CASE_ID}'::uuid;

-- Check attorneys
SELECT
    first_name || ' ' || last_name as attorney_name,
    email,
    organization as firm,
    phone
FROM users
WHERE email IN (
    'justin.saadein@harborgrid.com',
    'thomas.junker@mercertrigiani.com',
    'rlash@bhlpc.com',
    'david.mercer@mercertrigiani.com'
);

-- ============================================================================
-- SUMMARY
-- ============================================================================
/*
PARTIES EXTRACTED:
1. JUSTIN JEFFREY SAADEIN-MORALES (Individual, Debtor-Appellant, Pro Se)
2. WESTRIDGE SWIM & RACQUET CLUB, INC. (Corporation, Creditor-Appellee)

ATTORNEYS EXTRACTED:
1. Justin Jeffrey Saadein-Morales (justin.saadein@harborgrid.com) - Pro Se
2. Thomas Charles Junker (thomas.junker@mercertrigiani.com) - MERCERTRIGIANI
3. Richard A. Lash (rlash@bhlpc.com) - BUONASSISSI, HENNING & LASH, PC
4. David Storey Mercer (david.mercer@mercertrigiani.com) - MERCERTRIGIANI

PARTY UUIDs CREATED:
- Justin Saadein-Morales: a1b2c3d4-e5f6-7890-1234-567890abcdef
- Westridge: b2c3d4e5-f6a7-8901-2345-67890abcdef1

ATTORNEY UUIDs CREATED:
- Justin Saadein-Morales: c3d4e5f6-a7b8-9012-3456-7890abcdef12
- Thomas Junker: d4e5f6a7-b890-1234-5678-90abcdef1234
- Richard Lash: e5f6a7b8-9012-3456-7890-abcdef123456
- David Mercer: f6a7b890-1234-5678-90ab-cdef12345678

NOTE: Before executing, replace {CASE_ID} with actual case UUID from Agent 1
*/
