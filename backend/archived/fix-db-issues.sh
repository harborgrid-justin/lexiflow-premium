#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

echo "🗄️  Connecting to database: $DB_DATABASE@$DB_HOST"
echo "📝 Running migration to add Template to documents_type_enum..."

# Create the SQL command
SQL_COMMAND="
-- Add Template to documents_type_enum
-- Migration: add-template-to-document-type-enum
-- Date: 2025-12-26

DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Template' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'documents_type_enum')
    ) THEN
        ALTER TYPE documents_type_enum ADD VALUE 'Template';
        RAISE NOTICE 'Added Template to documents_type_enum';
    ELSE
        RAISE NOTICE 'Template already exists in documents_type_enum';
    END IF;
END
\$\$;

-- Verify the enum values
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'documents_type_enum')
ORDER BY enumlabel;
"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql command not found. Installing postgresql-client..."
    sudo apt-get update && sudo apt-get install -y postgresql-client
fi

# Run the migration
echo "$SQL_COMMAND" | psql "$DATABASE_URL" || {
    echo "❌ Migration failed!"
    exit 1
}

echo "✅ Migration completed successfully!"

# Also create a test user for development
echo "👤 Creating test user for development..."
USER_SQL="
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'test@lexiflow.dev') THEN
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, is_verified, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'test@lexiflow.dev',
            '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeZHtxdoO4pJJ1kZ6', -- 'password123'
            'Test',
            'User',
            'partner',
            true,
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Created test user: test@lexiflow.dev (password: password123)';
    ELSE
        RAISE NOTICE 'Test user already exists: test@lexiflow.dev';
    END IF;
END
\$\$;
"

echo "$USER_SQL" | psql "$DATABASE_URL" || {
    echo "⚠️  Test user creation failed, but migration succeeded."
}

echo "🎉 Setup complete!"
echo "📧 Test user email: test@lexiflow.dev"
echo "🔑 Test user password: password123"