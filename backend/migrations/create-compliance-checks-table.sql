-- Create compliance_checks table for conflict of interest and compliance tracking
CREATE TABLE IF NOT EXISTS compliance_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL,
    rule_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by case
CREATE INDEX IF NOT EXISTS idx_compliance_checks_case_id ON compliance_checks(case_id);

-- Create index for faster lookups by rule
CREATE INDEX IF NOT EXISTS idx_compliance_checks_rule_id ON compliance_checks(rule_id);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_compliance_checks_status ON compliance_checks(status);

-- Add comment
COMMENT ON TABLE compliance_checks IS 'Tracks compliance checks including conflict of interest screening';
COMMENT ON COLUMN compliance_checks.case_id IS 'Reference to the case being checked';
COMMENT ON COLUMN compliance_checks.rule_id IS 'Identifier for the compliance rule being checked';
COMMENT ON COLUMN compliance_checks.status IS 'Status: pending, passed, failed, requires_review';
COMMENT ON COLUMN compliance_checks.details IS 'Additional details about the check result in JSON format';
