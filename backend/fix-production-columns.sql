-- Production-Grade Database Column Fixer
-- Adds missing snake_case timestamp columns to all tables

-- Fix jurisdictions table
DO $$
BEGIN
    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='jurisdictions' AND column_name='created_at') THEN
        ALTER TABLE jurisdictions ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        UPDATE jurisdictions SET created_at = NOW() WHERE created_at IS NULL;
        RAISE NOTICE 'Added created_at to jurisdictions';
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='jurisdictions' AND column_name='updated_at') THEN
        ALTER TABLE jurisdictions ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        UPDATE jurisdictions SET updated_at = NOW() WHERE updated_at IS NULL;
        RAISE NOTICE 'Added updated_at to jurisdictions';
    END IF;
END $$;

-- Fix integrations table
DO $$
BEGIN
    -- Ensure provider column exists (should have been added by previous script)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='integrations' AND column_name='provider') THEN
        ALTER TABLE integrations ADD COLUMN provider VARCHAR(255);
        RAISE NOTICE 'Added provider to integrations';
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='integrations' AND column_name='created_at') THEN
        ALTER TABLE integrations ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        UPDATE integrations SET created_at = NOW() WHERE created_at IS NULL;
        RAISE NOTICE 'Added created_at to integrations';
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='integrations' AND column_name='updated_at') THEN
        ALTER TABLE integrations ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        UPDATE integrations SET updated_at = NOW() WHERE updated_at IS NULL;
        RAISE NOTICE 'Added updated_at to integrations';
    END IF;
END $$;

-- Fix citations table (convert camelCase to snake_case)
DO $$
BEGIN
    -- Add case_id and copy from caseId if caseId exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='citations' AND column_name='caseId') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='citations' AND column_name='case_id') THEN
        ALTER TABLE citations ADD COLUMN case_id UUID;
        UPDATE citations SET case_id = "caseId";
        RAISE NOTICE 'Added case_id to citations (copied from caseId)';
    END IF;

    -- Add document_id and copy from documentId if documentId exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='citations' AND column_name='documentId') AND
       NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='citations' AND column_name='document_id') THEN
        ALTER TABLE citations ADD COLUMN document_id UUID;
        UPDATE citations SET document_id = "documentId";
        RAISE NOTICE 'Added document_id to citations (copied from documentId)';
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='citations' AND column_name='created_at') THEN
        ALTER TABLE citations ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        UPDATE citations SET created_at = NOW() WHERE created_at IS NULL;
        RAISE NOTICE 'Added created_at to citations';
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='citations' AND column_name='updated_at') THEN
        ALTER TABLE citations ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
        UPDATE citations SET updated_at = NOW() WHERE updated_at IS NULL;
        RAISE NOTICE 'Added updated_at to citations';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jurisdictions_created_at ON jurisdictions(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON integrations(created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_citations_case_id ON citations(case_id);
CREATE INDEX IF NOT EXISTS idx_citations_document_id ON citations(document_id);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ All production database columns fixed!';
    RAISE NOTICE '📝 Added snake_case timestamp columns';
    RAISE NOTICE '📝 Converted citations camelCase columns';
    RAISE NOTICE '📝 Created performance indexes';
END $$;
