#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

echo "🗄️  Connecting to database: $DB_DATABASE@$DB_HOST"
echo "📝 Running migration to create document_reviewers table..."

# Run the migration
psql "$DATABASE_URL" -f migrations/create-document-reviewers-table.sql || {
    echo "❌ Migration failed!"
    exit 1
}

echo "✅ Document reviewers table migration completed successfully!"