-- Add documentId column to citations table
-- Run this script directly in PostgreSQL or via psql

-- Add the documentId column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'citations' 
        AND column_name = 'documentId'
    ) THEN
        ALTER TABLE citations ADD COLUMN "documentId" character varying;
        RAISE NOTICE 'Column documentId added to citations table';
    ELSE
        RAISE NOTICE 'Column documentId already exists in citations table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'citations'
ORDER BY ordinal_position;
