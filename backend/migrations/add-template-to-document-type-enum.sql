-- Add Template to documents_type_enum
-- Migration: add-template-to-document-type-enum
-- Date: 2025-12-26

-- Add 'Template' to the documents_type_enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Template' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'documents_type_enum')
    ) THEN
        ALTER TYPE documents_type_enum ADD VALUE 'Template';
    END IF;
END
$$;
