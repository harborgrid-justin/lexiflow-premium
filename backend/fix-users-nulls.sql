-- Manual fix for users table
-- First, update null values in existing records
UPDATE users 
SET 
  first_name = COALESCE(first_name, 'Unknown'),
  last_name = COALESCE(last_name, 'User')
WHERE first_name IS NULL OR last_name IS NULL;

-- Now add NOT NULL constraints if they don't exist
ALTER TABLE users 
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL;
