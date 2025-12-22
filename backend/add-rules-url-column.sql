-- Add rulesUrl column to jurisdictions table if it doesn't exist
-- Run this manually in your PostgreSQL database

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jurisdictions' 
        AND column_name = 'rulesUrl'
    ) THEN
        ALTER TABLE jurisdictions ADD COLUMN "rulesUrl" varchar(500) NULL;
        RAISE NOTICE 'Column rulesUrl added successfully';
    ELSE
        RAISE NOTICE 'Column rulesUrl already exists';
    END IF;
END $$;
