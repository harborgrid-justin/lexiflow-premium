-- Add PACER/ECF Docket Entry Fields
-- Run this script to add new columns for federal court docket tracking

-- Docket Entries table: Add ECF tracking fields
ALTER TABLE docket_entries 
  ADD COLUMN IF NOT EXISTS ecf_document_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS ecf_url VARCHAR(2048),
  ADD COLUMN IF NOT EXISTS attachments JSONB,
  ADD COLUMN IF NOT EXISTS filing_fee DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS fee_receipt_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS judge_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS signed_by VARCHAR(255),
  ADD COLUMN IF NOT EXISTS docket_clerk_initials VARCHAR(10),
  ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS related_docket_numbers TEXT;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_docket_entries_ecf_doc_number ON docket_entries (ecf_document_number);
CREATE INDEX IF NOT EXISTS idx_docket_entries_judge_name ON docket_entries (judge_name);
CREATE INDEX IF NOT EXISTS idx_docket_entries_filing_fee ON docket_entries (filing_fee) WHERE filing_fee IS NOT NULL;

-- Verify columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'docket_entries' 
  AND column_name IN ('ecf_document_number', 'ecf_url', 'attachments', 'filing_fee', 'judge_name', 'is_restricted')
ORDER BY column_name;
