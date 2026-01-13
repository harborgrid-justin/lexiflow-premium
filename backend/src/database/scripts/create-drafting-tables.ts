#!/usr/bin/env ts-node
/**
 * Standalone script to create drafting tables
 *
 * Usage:
 *   npm run db:create-drafting
 *   or
 *   npx ts-node src/database/scripts/create-drafting-tables.ts
 *
 * Environment Variables (from .env):
 *   - DATABASE_URL or individual DB_* variables
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { Client } from "pg";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const createTablesSql = `
-- ============================================================================
-- DRAFTING TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS drafting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  clause_references JSONB DEFAULT '[]'::jsonb,
  jurisdiction VARCHAR(100),
  practice_area VARCHAR(100),
  court_type VARCHAR(100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  version INTEGER DEFAULT 1,
  parent_template_id UUID,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT chk_category CHECK (category IN (
    'motion', 'complaint', 'answer', 'discovery', 'brief', 'memo',
    'order', 'notice', 'contract', 'letter', 'pleading', 'exhibit',
    'affidavit', 'declaration', 'other', 'stipulation'
  )),
  CONSTRAINT chk_status CHECK (status IN ('draft', 'active', 'archived', 'deprecated'))
);

-- ============================================================================
-- GENERATED DOCUMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID NOT NULL REFERENCES drafting_templates(id) ON DELETE CASCADE,
  case_id UUID,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  content TEXT NOT NULL,
  variable_values JSONB DEFAULT '{}'::jsonb,
  included_clauses TEXT[] DEFAULT ARRAY[]::TEXT[],
  word_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID,
  updated_by UUID,
  reviewer_id UUID,
  review_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  finalized_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT chk_status CHECK (status IN (
    'draft', 'in_review', 'approved', 'rejected',
    'finalized', 'archived', 'exported'
  ))
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Drafting Templates Indexes
CREATE INDEX IF NOT EXISTS idx_drafting_templates_category ON drafting_templates(category);
CREATE INDEX IF NOT EXISTS idx_drafting_templates_status ON drafting_templates(status);
CREATE INDEX IF NOT EXISTS idx_drafting_templates_created_by ON drafting_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_drafting_templates_created_at ON drafting_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafting_templates_usage ON drafting_templates(usage_count DESC);

-- Generated Documents Indexes
CREATE INDEX IF NOT EXISTS idx_generated_documents_template ON generated_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_case ON generated_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_status ON generated_documents(status);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_by ON generated_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_generated_documents_reviewer ON generated_documents(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_generated_documents_created_at ON generated_documents(created_at DESC);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE drafting_templates IS 'Reusable document templates for legal drafting';
COMMENT ON TABLE generated_documents IS 'Documents generated from templates with variable substitution';

COMMENT ON COLUMN drafting_templates.variables IS 'Array of variable definitions with validation rules';
COMMENT ON COLUMN drafting_templates.clause_references IS 'Array of clause library references';
COMMENT ON COLUMN generated_documents.variable_values IS 'JSON object of variable name/value pairs';
COMMENT ON COLUMN generated_documents.included_clauses IS 'Array of clause IDs included in this document';
`;

async function main() {
  console.log("🚀 Starting drafting tables creation script...\n");
  console.log("📁 Environment:", process.env.NODE_ENV || "development");
  console.log("🗄️  Database Host:", process.env.DB_HOST || "localhost");
  console.log(
    "📊 Database Name:",
    process.env.DB_DATABASE || process.env.DB_NAME || "lexiflow"
  );
  console.log("");

  // Create PostgreSQL client
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_DATABASE || process.env.DB_NAME || "lexiflow",
    ssl:
      process.env.DB_SSL === "true"
        ? {
            rejectUnauthorized:
              process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
          }
        : false,
  });

  try {
    // Connect to database
    console.log("🔌 Connecting to database...");
    await client.connect();
    console.log("✅ Database connection established\n");

    // Execute table creation SQL
    console.log("📋 Creating drafting tables...");
    await client.query(createTablesSql);
    console.log("✅ Tables created successfully!\n");

    // Verify tables exist
    console.log("🔍 Verifying tables...");
    const verifyQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('drafting_templates', 'generated_documents')
      ORDER BY table_name;
    `;
    const result = await client.query(verifyQuery);

    if (result.rows.length === 2) {
      console.log("✅ Verification successful:");
      result.rows.forEach((row: any) => {
        console.log(`   ✓ ${row.table_name}`);
      });
    } else {
      console.warn("⚠️  Warning: Expected 2 tables, found", result.rows.length);
    }

    // Show column counts
    console.log("\n📊 Table Statistics:");
    const statsQuery = `
      SELECT
        'drafting_templates' as table_name,
        COUNT(*) as column_count
      FROM information_schema.columns
      WHERE table_name = 'drafting_templates'
      UNION ALL
      SELECT
        'generated_documents' as table_name,
        COUNT(*) as column_count
      FROM information_schema.columns
      WHERE table_name = 'generated_documents';
    `;
    const stats = await client.query(statsQuery);
    stats.rows.forEach((row: any) => {
      console.log(`   ${row.table_name}: ${row.column_count} columns`);
    });

    console.log("\n🎉 Drafting tables setup completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("   1. Run: npm run seed:drafting");
    console.log("   2. Tables include soft-delete support (deleted_at column)");
    console.log("   3. Restart your backend server");
    console.log("   4. Refresh your frontend");
  } catch (error) {
    console.error("\n❌ Script failed:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
      if ("code" in error) {
        console.error("   Code:", (error as { code: string }).code);
      }
    }
    process.exit(1);
  } finally {
    // Close connection
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the script
main();
