-- Trust Account Compliance Enhancement Migration
-- Adds all compliance fields to support state bar requirements
-- Run from backend directory: npm run migration:run

-- ============================================
-- PART 1: Trust Accounts Table Enhancements
-- ============================================

-- Add compliance fields for account setup and structure
ALTER TABLE trust_accounts
ADD COLUMN IF NOT EXISTS state_bar_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS jurisdiction VARCHAR(10),
ADD COLUMN IF NOT EXISTS iolta_program_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS overdraft_reporting_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS account_title_compliant BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS client_consent_for_location BOOLEAN DEFAULT FALSE;

-- Add reconciliation tracking fields
ALTER TABLE trust_accounts
ADD COLUMN IF NOT EXISTS last_reconciled_date DATE,
ADD COLUMN IF NOT EXISTS reconciliation_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS next_reconciliation_due DATE,
ADD COLUMN IF NOT EXISTS record_retention_years INTEGER DEFAULT 7;

-- Add check number tracking
ALTER TABLE trust_accounts
ADD COLUMN IF NOT EXISTS check_number_range_start INTEGER,
ADD COLUMN IF NOT EXISTS check_number_range_current INTEGER;

-- Add signatory control
ALTER TABLE trust_accounts
ADD COLUMN IF NOT EXISTS authorized_signatories UUID[],
ADD COLUMN IF NOT EXISTS primary_signatory UUID;

-- Add indexes for compliance queries
CREATE INDEX IF NOT EXISTS idx_trust_accounts_jurisdiction 
ON trust_accounts(jurisdiction);

CREATE INDEX IF NOT EXISTS idx_trust_accounts_reconciliation_status 
ON trust_accounts(reconciliation_status) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_trust_accounts_next_reconciliation 
ON trust_accounts(next_reconciliation_due) 
WHERE deleted_at IS NULL AND next_reconciliation_due IS NOT NULL;

-- ============================================
-- PART 2: Trust Transactions Table Enhancements
-- ============================================

-- Add compliance fields for deposit/withdrawal rules
ALTER TABLE trust_transactions
ADD COLUMN IF NOT EXISTS funds_received_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS prompt_deposit_compliant BOOLEAN,
ADD COLUMN IF NOT EXISTS is_advanced_fee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_earned_fee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transaction_source VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_operating_fund_transfer BOOLEAN DEFAULT FALSE;

-- Add check tracking and payment method validation
ALTER TABLE trust_transactions
ADD COLUMN IF NOT EXISTS check_voided BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_method_compliant BOOLEAN DEFAULT TRUE;

-- Add signatory authorization tracking
ALTER TABLE trust_transactions
ADD COLUMN IF NOT EXISTS signatory_authorized BOOLEAN;

-- Add bank reconciliation fields
ALTER TABLE trust_transactions
ADD COLUMN IF NOT EXISTS bank_statement_date DATE,
ADD COLUMN IF NOT EXISTS cleared_date DATE;

-- Add client notification tracking
ALTER TABLE trust_transactions
ADD COLUMN IF NOT EXISTS client_notified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS client_notified_date TIMESTAMP;

-- Add dispute tracking
ALTER TABLE trust_transactions
ADD COLUMN IF NOT EXISTS disputed_amount DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
ADD COLUMN IF NOT EXISTS dispute_resolved_date DATE;

-- Add record retention
ALTER TABLE trust_transactions
ADD COLUMN IF NOT EXISTS retention_expiry_date DATE;

-- Add constraint for check numbers
ALTER TABLE trust_transactions
DROP CONSTRAINT IF EXISTS check_payment_method_for_checks;

ALTER TABLE trust_transactions
ADD CONSTRAINT check_payment_method_for_checks 
CHECK (
  payment_method IS NULL OR 
  payment_method != 'CHECK' OR 
  payment_method != 'check' OR 
  check_number IS NOT NULL
);

-- Add constraint for minimum description length (compliance requirement)
ALTER TABLE trust_transactions
DROP CONSTRAINT IF EXISTS check_description_length;

ALTER TABLE trust_transactions
ADD CONSTRAINT check_description_length 
CHECK (LENGTH(description) >= 20);

-- Add indexes for compliance queries
CREATE INDEX IF NOT EXISTS idx_trust_transactions_prompt_deposit 
ON trust_transactions(prompt_deposit_compliant) 
WHERE NOT prompt_deposit_compliant AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_trust_transactions_unnotified 
ON trust_transactions(client_notified) 
WHERE NOT client_notified AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_trust_transactions_disputed 
ON trust_transactions(disputed_amount) 
WHERE disputed_amount IS NOT NULL AND dispute_resolved_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_trust_transactions_cleared 
ON trust_transactions(cleared_date, reconciled) 
WHERE cleared_date IS NOT NULL AND NOT reconciled;

-- ============================================
-- PART 3: Data Migration for Existing Records
-- ============================================

-- Set default values for existing trust accounts
UPDATE trust_accounts
SET 
  account_title_compliant = (
    account_name ILIKE '%trust account%' OR 
    account_name ILIKE '%escrow account%'
  ),
  record_retention_years = 7,
  reconciliation_status = 'pending'
WHERE deleted_at IS NULL;

-- Set next reconciliation due dates (first of next month)
UPDATE trust_accounts
SET next_reconciliation_due = DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
WHERE deleted_at IS NULL 
  AND status = 'active'
  AND next_reconciliation_due IS NULL;

-- Mark all existing transactions as compliant (assume historical compliance)
UPDATE trust_transactions
SET 
  prompt_deposit_compliant = TRUE,
  payment_method_compliant = TRUE,
  client_notified = TRUE,
  signatory_authorized = TRUE
WHERE deleted_at IS NULL;

-- Calculate retention expiry dates for existing transactions (7 years from transaction date)
UPDATE trust_transactions
SET retention_expiry_date = transaction_date + INTERVAL '7 years'
WHERE deleted_at IS NULL 
  AND retention_expiry_date IS NULL;

-- ============================================
-- PART 4: Create Reconciliation Tracking Table
-- ============================================

CREATE TABLE IF NOT EXISTS trust_reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_account_id UUID NOT NULL REFERENCES trust_accounts(id),
  
  -- Reconciliation period
  reconciliation_date DATE NOT NULL,
  reconciliation_period VARCHAR(50) NOT NULL, -- e.g., "December 2025"
  performed_by UUID NOT NULL,
  performed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Three-way reconciliation components
  bank_statement_balance DECIMAL(15,2) NOT NULL,
  trust_ledger_balance DECIMAL(15,2) NOT NULL,
  client_ledgers_total DECIMAL(15,2) NOT NULL,
  
  -- Reconciliation result
  is_reconciled BOOLEAN NOT NULL,
  discrepancy_amount DECIMAL(15,2),
  discrepancy_reason TEXT,
  
  -- Outstanding items
  outstanding_deposits DECIMAL(15,2) DEFAULT 0,
  outstanding_withdrawals DECIMAL(15,2) DEFAULT 0,
  bank_adjustments DECIMAL(15,2) DEFAULT 0,
  
  -- Compliance flags
  negative_balance_clients TEXT[], -- Array of client IDs with negative balances
  overdraft_detected BOOLEAN DEFAULT FALSE,
  unmatched_transactions UUID[], -- Array of transaction IDs
  
  notes TEXT,
  attachments TEXT[],
  next_reconciliation_due DATE,
  
  -- Audit trail
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT check_reconciliation_match 
    CHECK (
      is_reconciled = FALSE OR 
      (bank_statement_balance + outstanding_deposits - outstanding_withdrawals + bank_adjustments) = trust_ledger_balance
    )
);

CREATE INDEX idx_trust_reconciliations_account 
ON trust_reconciliations(trust_account_id, reconciliation_date DESC);

CREATE INDEX idx_trust_reconciliations_due 
ON trust_reconciliations(next_reconciliation_due) 
WHERE next_reconciliation_due IS NOT NULL;

-- ============================================
-- PART 5: Create Compliance Violations Table
-- ============================================

CREATE TABLE IF NOT EXISTS trust_compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trust_account_id UUID NOT NULL REFERENCES trust_accounts(id),
  transaction_id UUID REFERENCES trust_transactions(id),
  
  violation_type VARCHAR(100) NOT NULL, -- e.g., 'late_deposit', 'cash_withdrawal', 'negative_balance'
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'major', 'minor')),
  description TEXT NOT NULL,
  
  client_id UUID,
  detected_date TIMESTAMP NOT NULL DEFAULT NOW(),
  detected_by UUID, -- System-detected or user ID
  
  resolved BOOLEAN DEFAULT FALSE,
  resolved_date TIMESTAMP,
  resolved_by UUID,
  resolution_notes TEXT,
  
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trust_violations_account 
ON trust_compliance_violations(trust_account_id, detected_date DESC);

CREATE INDEX idx_trust_violations_unresolved 
ON trust_compliance_violations(resolved, severity, detected_date) 
WHERE NOT resolved;

CREATE INDEX idx_trust_violations_type 
ON trust_compliance_violations(violation_type);

-- ============================================
-- PART 6: Create Helper Views
-- ============================================

-- View: Client Ledger Balances
CREATE OR REPLACE VIEW v_client_ledger_balances AS
SELECT 
  tt.trust_account_id,
  tt.client_id,
  tt.client_name,
  COUNT(*) as transaction_count,
  SUM(CASE 
    WHEN tt.transaction_type IN ('deposit', 'interest', 'refund') THEN tt.amount 
    ELSE 0 
  END) as total_deposits,
  SUM(CASE 
    WHEN tt.transaction_type IN ('withdrawal', 'fee', 'transfer') THEN tt.amount 
    ELSE 0 
  END) as total_withdrawals,
  (total_deposits - total_withdrawals) as current_balance,
  MAX(tt.transaction_date) as last_transaction_date,
  SUM(CASE WHEN tt.disputed_amount IS NOT NULL THEN tt.disputed_amount ELSE 0 END) as total_disputed
FROM trust_transactions tt
WHERE tt.deleted_at IS NULL
GROUP BY tt.trust_account_id, tt.client_id, tt.client_name;

-- View: Compliance Summary
CREATE OR REPLACE VIEW v_trust_compliance_summary AS
SELECT 
  ta.id as account_id,
  ta.account_name,
  ta.status,
  ta.jurisdiction,
  ta.balance,
  
  -- Account setup compliance
  ta.state_bar_approved,
  ta.account_title_compliant,
  ta.overdraft_reporting_enabled,
  
  -- Reconciliation status
  ta.last_reconciled_date,
  ta.next_reconciliation_due,
  (ta.next_reconciliation_due < CURRENT_DATE) as reconciliation_overdue,
  
  -- Transaction statistics
  COUNT(tt.id) as total_transactions,
  COUNT(tt.id) FILTER (WHERE NOT tt.prompt_deposit_compliant) as late_deposits,
  COUNT(tt.id) FILTER (WHERE NOT tt.client_notified) as unnotified_deposits,
  COUNT(tt.id) FILTER (WHERE tt.disputed_amount IS NOT NULL AND tt.dispute_resolved_date IS NULL) as active_disputes,
  COUNT(tt.id) FILTER (WHERE NOT tt.reconciled) as unreconciled_transactions,
  
  -- Violation counts
  (SELECT COUNT(*) FROM trust_compliance_violations tcv 
   WHERE tcv.trust_account_id = ta.id AND NOT tcv.resolved) as active_violations
   
FROM trust_accounts ta
LEFT JOIN trust_transactions tt ON tt.trust_account_id = ta.id AND tt.deleted_at IS NULL
WHERE ta.deleted_at IS NULL
GROUP BY ta.id, ta.account_name, ta.status, ta.jurisdiction, ta.balance,
         ta.state_bar_approved, ta.account_title_compliant, ta.overdraft_reporting_enabled,
         ta.last_reconciled_date, ta.next_reconciliation_due;

-- View: Aged Earned Fees (fees that should be withdrawn)
CREATE OR REPLACE VIEW v_aged_earned_fees AS
SELECT 
  tt.id as transaction_id,
  tt.trust_account_id,
  ta.account_name,
  tt.client_id,
  tt.client_name,
  tt.transaction_date,
  tt.amount,
  tt.description,
  CURRENT_DATE - tt.transaction_date as days_aged
FROM trust_transactions tt
JOIN trust_accounts ta ON ta.id = tt.trust_account_id
WHERE tt.deleted_at IS NULL
  AND ta.deleted_at IS NULL
  AND tt.is_earned_fee = TRUE
  AND NOT tt.is_operating_fund_transfer
  AND tt.transaction_type = 'deposit'
  AND CURRENT_DATE - tt.transaction_date > 30 -- Aged > 30 days
ORDER BY days_aged DESC;

-- ============================================
-- PART 7: Validation and Verification Queries
-- ============================================

-- Verify no negative balances exist (should return 0 rows)
SELECT id, account_name, balance 
FROM trust_accounts 
WHERE balance < 0 AND deleted_at IS NULL;

-- Verify no negative client ledger balances (should return 0 rows)
SELECT * 
FROM v_client_ledger_balances 
WHERE current_balance < 0;

-- Check for accounts missing compliance fields
SELECT 
  id, 
  account_name,
  state_bar_approved,
  account_title_compliant,
  jurisdiction,
  last_reconciled_date,
  next_reconciliation_due
FROM trust_accounts
WHERE deleted_at IS NULL
  AND (
    state_bar_approved IS NULL OR
    account_title_compliant IS NULL OR
    jurisdiction IS NULL OR
    next_reconciliation_due IS NULL
  );

-- Check for transactions missing required compliance fields
SELECT 
  id,
  transaction_date,
  description,
  prompt_deposit_compliant,
  client_notified,
  payment_method_compliant
FROM trust_transactions
WHERE deleted_at IS NULL
  AND (
    prompt_deposit_compliant IS NULL OR
    client_notified IS NULL OR
    payment_method_compliant IS NULL
  )
LIMIT 100;

-- ============================================
-- PART 8: Rollback Script (if needed)
-- ============================================

-- UNCOMMENT TO ROLLBACK (use with extreme caution)
/*
-- Drop new tables
DROP VIEW IF EXISTS v_aged_earned_fees;
DROP VIEW IF EXISTS v_trust_compliance_summary;
DROP VIEW IF EXISTS v_client_ledger_balances;
DROP TABLE IF EXISTS trust_compliance_violations;
DROP TABLE IF EXISTS trust_reconciliations;

-- Remove new columns from trust_accounts
ALTER TABLE trust_accounts
DROP COLUMN IF EXISTS state_bar_approved,
DROP COLUMN IF EXISTS jurisdiction,
DROP COLUMN IF EXISTS iolta_program_id,
DROP COLUMN IF EXISTS overdraft_reporting_enabled,
DROP COLUMN IF EXISTS account_title_compliant,
DROP COLUMN IF EXISTS client_consent_for_location,
DROP COLUMN IF EXISTS last_reconciled_date,
DROP COLUMN IF EXISTS reconciliation_status,
DROP COLUMN IF EXISTS next_reconciliation_due,
DROP COLUMN IF EXISTS record_retention_years,
DROP COLUMN IF EXISTS check_number_range_start,
DROP COLUMN IF EXISTS check_number_range_current,
DROP COLUMN IF EXISTS authorized_signatories,
DROP COLUMN IF EXISTS primary_signatory;

-- Remove new columns from trust_transactions
ALTER TABLE trust_transactions
DROP COLUMN IF EXISTS funds_received_date,
DROP COLUMN IF EXISTS prompt_deposit_compliant,
DROP COLUMN IF EXISTS is_advanced_fee,
DROP COLUMN IF EXISTS is_earned_fee,
DROP COLUMN IF EXISTS transaction_source,
DROP COLUMN IF EXISTS is_operating_fund_transfer,
DROP COLUMN IF EXISTS check_voided,
DROP COLUMN IF EXISTS payment_method_compliant,
DROP COLUMN IF EXISTS signatory_authorized,
DROP COLUMN IF EXISTS bank_statement_date,
DROP COLUMN IF EXISTS cleared_date,
DROP COLUMN IF EXISTS client_notified,
DROP COLUMN IF EXISTS client_notified_date,
DROP COLUMN IF EXISTS disputed_amount,
DROP COLUMN IF EXISTS dispute_reason,
DROP COLUMN IF EXISTS dispute_resolved_date,
DROP COLUMN IF EXISTS retention_expiry_date;

-- Remove constraints
ALTER TABLE trust_transactions
DROP CONSTRAINT IF EXISTS check_payment_method_for_checks,
DROP CONSTRAINT IF EXISTS check_description_length;
*/
