-- Add created_by and updated_by columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by varchar;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by varchar;
