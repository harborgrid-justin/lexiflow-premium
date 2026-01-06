#!/usr/bin/env node
/**
 * Execute Case 25-1229 Data Ingestion
 *
 * This script loads all case 25-1229 data into the PostgreSQL database:
 * - Case metadata with originating court information
 * - Consolidation relationship with case 24-2160
 * - Parties and attorneys
 * - All 127 docket entries
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Database connection from environment
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function executeSqlFile(filePath, description) {
  console.log(`\n▶ ${description}...`);
  const sql = fs.readFileSync(filePath, "utf8");

  try {
    await pool.query(sql);
    console.log(`✓ ${description} - SUCCESS`);
    return true;
  } catch (error) {
    console.error(`✗ ${description} - FAILED`);
    console.error(`  Error: ${error.message}`);
    if (error.detail) console.error(`  Detail: ${error.detail}`);
    return false;
  }
}

async function verifyData() {
  console.log(
    "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );
  console.log("VERIFICATION SUMMARY");
  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  );

  // Case Information
  console.log("📁 Case Information:");
  const caseResult = await pool.query(`
    SELECT
      case_number,
      title,
      matter_type,
      status,
      jurisdiction,
      filing_date,
      date_terminated,
      cause_of_action,
      nature_of_suit_code,
      is_consolidated,
      jsonb_array_length(related_cases) as related_case_count
    FROM cases
    WHERE case_number = '25-1229'
  `);
  if (caseResult.rows.length > 0) {
    console.table(caseResult.rows);
  } else {
    console.log("  ⚠ Case 25-1229 not found!");
  }

  // Parties
  console.log("\n👥 Parties (2 expected):");
  const partiesResult = await pool.query(`
    SELECT
      name,
      party_type as type,
      role,
      CASE WHEN is_pro_se THEN 'Pro Se' ELSE 'Represented' END as representation
    FROM parties
    WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229')
    ORDER BY role
  `);
  console.table(partiesResult.rows);

  // Attorneys
  console.log("\n⚖️ Attorneys (4 expected):");
  const attorneysResult = await pool.query(`
    SELECT
      name,
      email,
      role,
      metadata->>'firm' as firm
    FROM users
    WHERE email IN (
      'justin.saadein@harborgrid.com',
      'thomas.junker@mercertrigiani.com',
      'rlash@bhlpc.com',
      'david.mercer@mercertrigiani.com'
    )
    ORDER BY name
  `);
  console.table(attorneysResult.rows);

  // Docket Entries Summary
  console.log("\n📋 Docket Entries (127 expected):");
  const docketSummary = await pool.query(`
    SELECT
      COUNT(*) as total_entries,
      MIN(sequence_number) as first_seq,
      MAX(sequence_number) as last_seq,
      MIN(date_filed) as earliest_filing,
      MAX(date_filed) as latest_filing,
      COUNT(DISTINCT type) as distinct_types
    FROM docket_entries
    WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229')
  `);
  console.table(docketSummary.rows);

  // Entry Type Breakdown
  console.log("\n📊 Entry Type Breakdown:");
  const typeBreakdown = await pool.query(`
    SELECT
      type,
      COUNT(*) as count
    FROM docket_entries
    WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229')
    GROUP BY type
    ORDER BY count DESC
  `);
  console.table(typeBreakdown.rows);

  // Consolidation Status
  console.log("\n🔗 Consolidation Status:");
  const consolidationResult = await pool.query(`
    SELECT
      c1.case_number as case_25_1229,
      c1.is_consolidated as is_consolidated_25_1229,
      c2.case_number as case_24_2160,
      c2.is_consolidated as is_consolidated_24_2160
    FROM cases c1
    CROSS JOIN cases c2
    WHERE c1.case_number = '25-1229'
      AND c2.case_number = '24-2160'
  `);
  console.table(consolidationResult.rows);

  console.log(
    "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );

  // Final check
  const totalCheck = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM cases WHERE case_number = '25-1229') as cases,
      (SELECT COUNT(*) FROM parties WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229')) as parties,
      (SELECT COUNT(*) FROM docket_entries WHERE case_id = (SELECT id FROM cases WHERE case_number = '25-1229')) as docket_entries
  `);

  const counts = totalCheck.rows[0];
  const allGood =
    counts.cases === 1 && counts.parties === 2 && counts.docket_entries === 127;

  if (allGood) {
    console.log("✅ Case 25-1229 data ingestion COMPLETE!");
    console.log(`   ✓ 1 case record`);
    console.log(`   ✓ ${counts.parties} parties`);
    console.log(`   ✓ ${counts.docket_entries} docket entries`);
  } else {
    console.log("⚠ Data ingestion incomplete:");
    console.log(`   Cases: ${counts.cases}/1`);
    console.log(`   Parties: ${counts.parties}/2`);
    console.log(`   Docket Entries: ${counts.docket_entries}/127`);
  }

  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"
  );

  return allGood;
}

async function main() {
  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );
  console.log("LEXIFLOW ENTERPRISE: Case 25-1229 Complete Data Ingestion");
  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );

  const archivedDir = path.join(__dirname, "..");

  try {
    // Step 1: Case metadata
    await executeSqlFile(
      path.join(archivedDir, "agent1_case_metadata_insert_25_1229.sql"),
      "Step 1: Creating/updating case 25-1229 with originating court metadata"
    );

    // Step 2: Consolidation (if not already done)
    await executeSqlFile(
      path.join(archivedDir, "agent-5-associated-cases.sql"),
      "Step 2: Establishing consolidation relationship with case 24-2160"
    );

    // Step 3: Parties and attorneys
    await executeSqlFile(
      path.join(archivedDir, "agent2_party_attorney_insert_25_1229.sql"),
      "Step 3: Creating parties and attorney records"
    );

    // Step 4: Docket entries
    await executeSqlFile(
      path.join(archivedDir, "docket_entries_insert_25_1229.generated.sql"),
      "Step 4: Inserting all 127 docket entries"
    );

    // Verify
    const success = await verifyData();

    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error("\n❌ Fatal error during data ingestion:");
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
