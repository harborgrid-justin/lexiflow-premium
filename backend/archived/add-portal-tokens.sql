-- Add portal token fields to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS "portalToken" VARCHAR(500);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS "portalTokenExpiry" TIMESTAMP;
