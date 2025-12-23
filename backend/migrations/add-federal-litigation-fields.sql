-- Add Federal Litigation Fields to Cases and Parties Tables
-- Run this script to manually add the columns if synchronize doesn't pick them up

-- Cases table: Add federal litigation tracking fields
ALTER TABLE cases 
  ADD COLUMN IF NOT EXISTS referred_judge VARCHAR(100),
  ADD COLUMN IF NOT EXISTS magistrate_judge VARCHAR(100),
  ADD COLUMN IF NOT EXISTS date_terminated DATE,
  ADD COLUMN IF NOT EXISTS jury_demand VARCHAR(50),
  ADD COLUMN IF NOT EXISTS cause_of_action VARCHAR(500),
  ADD COLUMN IF NOT EXISTS nature_of_suit VARCHAR(255),
  ADD COLUMN IF NOT EXISTS nature_of_suit_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS related_cases JSONB;

-- Parties table: Add attorney representation fields
ALTER TABLE parties 
  ADD COLUMN IF NOT EXISTS description VARCHAR(500),
  ADD COLUMN IF NOT EXISTS attorney_firm VARCHAR(255),
  ADD COLUMN IF NOT EXISTS attorney_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS attorney_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS attorney_address TEXT,
  ADD COLUMN IF NOT EXISTS attorney_fax VARCHAR(50),
  ADD COLUMN IF NOT EXISTS is_lead_attorney BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_attorney_to_be_noticed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pro_se BOOLEAN DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_nature_of_suit_code ON cases (nature_of_suit_code);
CREATE INDEX IF NOT EXISTS idx_cases_date_terminated ON cases (date_terminated);
CREATE INDEX IF NOT EXISTS idx_parties_is_lead_attorney ON parties (is_lead_attorney);
CREATE INDEX IF NOT EXISTS idx_parties_is_pro_se ON parties (is_pro_se);

-- Verify columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'cases' 
  AND column_name IN ('referred_judge', 'magistrate_judge', 'cause_of_action', 'nature_of_suit_code', 'date_terminated', 'jury_demand', 'related_cases')
ORDER BY column_name;

SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'parties' 
  AND column_name IN ('description', 'attorney_firm', 'attorney_email', 'is_lead_attorney', 'is_attorney_to_be_noticed', 'is_pro_se')
ORDER BY column_name;
