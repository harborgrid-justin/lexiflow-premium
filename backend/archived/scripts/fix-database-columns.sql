-- Fix Database Column Issues for Health Endpoints
-- Run this script to add missing columns or rename incorrectly named columns

-- Fix jurisdiction table - add created_at if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jurisdictions' AND column_name = 'created_at') THEN
        ALTER TABLE jurisdictions ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Added created_at column to jurisdictions table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jurisdictions' AND column_name = 'updated_at') THEN
        ALTER TABLE jurisdictions ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to jurisdictions table';
    END IF;
END$$;

-- Fix integrations table - add provider column if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'integrations' AND column_name = 'provider') THEN
        ALTER TABLE integrations ADD COLUMN provider VARCHAR(255);
        RAISE NOTICE 'Added provider column to integrations table';
    END IF;
END$$;

-- Check and report all tables with camelCase column issues
DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE 'Checking for camelCase columns that should be snake_case...';
    
    FOR r IN 
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND column_name ~ '[A-Z]'
        AND table_name IN ('jurisdictions', 'integrations', 'matters', 'projects', 
                          'organizations', 'legal_entities', 'clients', 'citations',
                          'trial_exhibits', 'custodians', 'witnesses')
        ORDER BY table_name, column_name
    LOOP
        RAISE NOTICE 'Found camelCase column: %.% ', r.table_name, r.column_name;
    END LOOP;
END$$;

-- Create indexes for health check queries to improve performance
CREATE INDEX IF NOT EXISTS idx_jurisdictions_created_at ON jurisdictions(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON integrations(created_at);
CREATE INDEX IF NOT EXISTS idx_matters_createdat ON matters(createdat);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- Update timestamps for existing records if they're NULL
UPDATE jurisdictions SET created_at = NOW() WHERE created_at IS NULL;
UPDATE jurisdictions SET updated_at = NOW() WHERE updated_at IS NULL;

SELECT 'Database column fixes applied successfully!' as status;
