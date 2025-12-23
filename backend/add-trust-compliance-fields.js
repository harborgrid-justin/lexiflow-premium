/**
 * Add Trust Account Compliance Fields Script
 * 
 * Adds all compliance columns to trust_accounts and trust_transactions tables
 * Run: node add-trust-compliance-fields.js
 */

const { Client } = require('pg');
require('dotenv').config();

async function addComplianceFields() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // ============================================
    // PART 1: Trust Accounts Table - Compliance Fields
    // ============================================
    console.log('\n--- Adding compliance fields to trust_accounts ---');

    const trustAccountColumns = [
      // Account Setup and Structure
      { name: 'state_bar_approved', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'jurisdiction', type: 'VARCHAR(10)' },
      { name: 'iolta_program_id', type: 'VARCHAR(100)' },
      { name: 'overdraft_reporting_enabled', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'account_title_compliant', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'client_consent_for_location', type: 'BOOLEAN DEFAULT FALSE' },
      
      // Recordkeeping and Documentation
      { name: 'last_reconciled_date', type: 'DATE' },
      { name: 'reconciliation_status', type: 'VARCHAR(50)' },
      { name: 'next_reconciliation_due', type: 'DATE' },
      { name: 'record_retention_years', type: 'INTEGER DEFAULT 7' },
      { name: 'check_number_range_start', type: 'INTEGER' },
      { name: 'check_number_range_current', type: 'INTEGER' },
      
      // Signatory Control
      { name: 'authorized_signatories', type: 'TEXT' },
      { name: 'primary_signatory', type: 'UUID' },
    ];

    for (const col of trustAccountColumns) {
      try {
        // Check if column exists
        const checkResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'trust_accounts' 
            AND column_name = $1
        `, [col.name]);

        if (checkResult.rows.length === 0) {
          await client.query(`
            ALTER TABLE trust_accounts 
            ADD COLUMN ${col.name} ${col.type}
          `);
          console.log(`  ✓ Added column: ${col.name}`);
        } else {
          console.log(`  - Column exists: ${col.name}`);
        }
      } catch (err) {
        console.error(`  ✗ Error adding ${col.name}:`, err.message);
      }
    }

    // ============================================
    // PART 2: Trust Transactions Table - Compliance Fields
    // ============================================
    console.log('\n--- Adding compliance fields to trust_transactions ---');

    const trustTransactionColumns = [
      // Deposit and Withdrawal Rules
      { name: 'funds_received_date', type: 'TIMESTAMP' },
      { name: 'prompt_deposit_compliant', type: 'BOOLEAN' },
      { name: 'is_advanced_fee', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'is_earned_fee', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'transaction_source', type: 'VARCHAR(50)' },
      { name: 'is_operating_fund_transfer', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'check_voided', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'payment_method_compliant', type: 'BOOLEAN DEFAULT TRUE' },
      { name: 'signatory_authorized', type: 'BOOLEAN' },
      
      // Reconciliation
      { name: 'bank_statement_date', type: 'DATE' },
      { name: 'cleared_date', type: 'DATE' },
      
      // Communication and Disputed Funds
      { name: 'client_notified', type: 'BOOLEAN DEFAULT FALSE' },
      { name: 'client_notified_date', type: 'TIMESTAMP' },
      { name: 'disputed_amount', type: 'DECIMAL(15,2)' },
      { name: 'dispute_reason', type: 'TEXT' },
      { name: 'dispute_resolved_date', type: 'DATE' },
      
      // Record Retention
      { name: 'retention_expiry_date', type: 'DATE' },
      { name: 'deleted_at', type: 'TIMESTAMP' },
    ];

    for (const col of trustTransactionColumns) {
      try {
        // Check if column exists
        const checkResult = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'trust_transactions' 
            AND column_name = $1
        `, [col.name]);

        if (checkResult.rows.length === 0) {
          await client.query(`
            ALTER TABLE trust_transactions 
            ADD COLUMN ${col.name} ${col.type}
          `);
          console.log(`  ✓ Added column: ${col.name}`);
        } else {
          console.log(`  - Column exists: ${col.name}`);
        }
      } catch (err) {
        console.error(`  ✗ Error adding ${col.name}:`, err.message);
      }
    }

    // ============================================
    // PART 3: Update TrustAccountStatus enum
    // ============================================
    console.log('\n--- Updating TrustAccountStatus enum ---');
    
    try {
      // Check if 'Frozen' status exists and update to 'Suspended'
      const frozenCheck = await client.query(`
        SELECT COUNT(*) as count 
        FROM trust_accounts 
        WHERE status = 'Frozen'
      `);

      if (frozenCheck.rows[0].count > 0) {
        await client.query(`
          UPDATE trust_accounts 
          SET status = 'Suspended' 
          WHERE status = 'Frozen'
        `);
        console.log(`  ✓ Updated ${frozenCheck.rows[0].count} accounts from 'Frozen' to 'Suspended'`);
      } else {
        console.log('  - No accounts with Frozen status found');
      }
    } catch (err) {
      console.error('  ✗ Error updating status enum:', err.message);
    }

    // ============================================
    // PART 4: Set Default Values for Existing Records
    // ============================================
    console.log('\n--- Setting default values for existing records ---');

    try {
      // Update trust accounts with compliance defaults
      const accountUpdateResult = await client.query(`
        UPDATE trust_accounts
        SET 
          account_title_compliant = (
            account_name ILIKE '%trust account%' OR 
            account_name ILIKE '%escrow account%'
          ),
          record_retention_years = COALESCE(record_retention_years, 7),
          reconciliation_status = COALESCE(reconciliation_status, 'pending'),
          next_reconciliation_due = COALESCE(
            next_reconciliation_due, 
            DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month')::DATE
          )
        WHERE "deletedAt" IS NULL
          AND (
            account_title_compliant IS NULL OR
            record_retention_years IS NULL OR
            reconciliation_status IS NULL OR
            next_reconciliation_due IS NULL
          )
      `);
      console.log(`  ✓ Updated ${accountUpdateResult.rowCount} trust accounts with defaults`);

      // Update trust transactions with compliance defaults
      const transactionUpdateResult = await client.query(`
        UPDATE trust_transactions
        SET 
          prompt_deposit_compliant = COALESCE(prompt_deposit_compliant, TRUE),
          payment_method_compliant = COALESCE(payment_method_compliant, TRUE),
          client_notified = COALESCE(client_notified, TRUE),
          signatory_authorized = COALESCE(signatory_authorized, TRUE),
          is_advanced_fee = COALESCE(is_advanced_fee, FALSE),
          is_earned_fee = COALESCE(is_earned_fee, FALSE),
          is_operating_fund_transfer = COALESCE(is_operating_fund_transfer, FALSE),
          check_voided = COALESCE(check_voided, FALSE),
          retention_expiry_date = COALESCE(
            retention_expiry_date,
            transaction_date + INTERVAL '7 years'
          )
        WHERE deleted_at IS NULL
          AND (
            prompt_deposit_compliant IS NULL OR
            payment_method_compliant IS NULL OR
            client_notified IS NULL OR
            retention_expiry_date IS NULL
          )
      `);
      console.log(`  ✓ Updated ${transactionUpdateResult.rowCount} trust transactions with defaults`);

    } catch (err) {
      console.error('  ✗ Error setting default values:', err.message);
    }

    // ============================================
    // PART 5: Create Indexes for Compliance Queries
    // ============================================
    console.log('\n--- Creating indexes for compliance queries ---');

    const indexes = [
      {
        name: 'idx_trust_accounts_jurisdiction',
        table: 'trust_accounts',
        sql: 'CREATE INDEX IF NOT EXISTS idx_trust_accounts_jurisdiction ON trust_accounts(jurisdiction)'
      },
      {
        name: 'idx_trust_accounts_reconciliation_status',
        table: 'trust_accounts',
        sql: 'CREATE INDEX IF NOT EXISTS idx_trust_accounts_reconciliation_status ON trust_accounts(reconciliation_status) WHERE "deletedAt" IS NULL'
      },
      {
        name: 'idx_trust_accounts_next_reconciliation',
        table: 'trust_accounts',
        sql: 'CREATE INDEX IF NOT EXISTS idx_trust_accounts_next_reconciliation ON trust_accounts(next_reconciliation_due) WHERE "deletedAt" IS NULL AND next_reconciliation_due IS NOT NULL'
      },
      {
        name: 'idx_trust_transactions_prompt_deposit',
        table: 'trust_transactions',
        sql: 'CREATE INDEX IF NOT EXISTS idx_trust_transactions_prompt_deposit ON trust_transactions(prompt_deposit_compliant) WHERE prompt_deposit_compliant = FALSE AND deleted_at IS NULL'
      },
      {
        name: 'idx_trust_transactions_unnotified',
        table: 'trust_transactions',
        sql: 'CREATE INDEX IF NOT EXISTS idx_trust_transactions_unnotified ON trust_transactions(client_notified) WHERE client_notified = FALSE AND deleted_at IS NULL'
      },
      {
        name: 'idx_trust_transactions_disputed',
        table: 'trust_transactions',
        sql: 'CREATE INDEX IF NOT EXISTS idx_trust_transactions_disputed ON trust_transactions(disputed_amount) WHERE disputed_amount IS NOT NULL AND dispute_resolved_date IS NULL'
      }
    ];

    for (const idx of indexes) {
      try {
        await client.query(idx.sql);
        console.log(`  ✓ Created index: ${idx.name}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`  - Index exists: ${idx.name}`);
        } else {
          console.error(`  ✗ Error creating ${idx.name}:`, err.message);
        }
      }
    }

    // ============================================
    // PART 6: Verification
    // ============================================
    console.log('\n--- Verification ---');

    // Verify trust_accounts columns
    const accountColumnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'trust_accounts'
      ORDER BY ordinal_position
    `);
    console.log(`  ✓ trust_accounts has ${accountColumnsResult.rows.length} columns`);

    // Verify trust_transactions columns
    const transactionColumnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'trust_transactions'
      ORDER BY ordinal_position
    `);
    console.log(`  ✓ trust_transactions has ${transactionColumnsResult.rows.length} columns`);

    // Check for negative balances (compliance violation)
    const negativeBalanceResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM trust_accounts 
      WHERE balance < 0 AND "deletedAt" IS NULL
    `);
    if (negativeBalanceResult.rows[0].count > 0) {
      console.log(`  ⚠ WARNING: ${negativeBalanceResult.rows[0].count} accounts with negative balance found!`);
    } else {
      console.log('  ✓ No negative balances found (compliance check passed)');
    }

    // Check accounts needing reconciliation
    const needsReconciliationResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM trust_accounts 
      WHERE next_reconciliation_due < CURRENT_DATE 
        AND status = 'Active' 
        AND "deletedAt" IS NULL
    `);
    console.log(`  ℹ ${needsReconciliationResult.rows[0].count} accounts need reconciliation`);

    console.log('\n✓ Trust account compliance fields migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart backend: cd backend && npm run start:dev');
    console.log('2. Test trust account creation with compliance fields');
    console.log('3. Review compliance report: GET /billing/trust-accounts');
    console.log('4. Schedule monthly reconciliations');

  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n✓ Database connection closed');
  }
}

// Run the migration
addComplianceFields()
  .then(() => {
    console.log('\n=== Migration Complete ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n=== Migration Failed ===');
    console.error(error);
    process.exit(1);
  });
