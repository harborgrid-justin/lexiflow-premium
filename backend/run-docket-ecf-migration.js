const { Client } = require('pg');
require('dotenv').config();

async function runDocketMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Docket Entries table: Add ECF tracking fields
    console.log('\n📋 Adding PACER/ECF columns to docket_entries table...');
    
    await client.query(`
      ALTER TABLE docket_entries 
        ADD COLUMN IF NOT EXISTS ecf_document_number VARCHAR(50),
        ADD COLUMN IF NOT EXISTS ecf_url VARCHAR(2048),
        ADD COLUMN IF NOT EXISTS attachments JSONB,
        ADD COLUMN IF NOT EXISTS filing_fee DECIMAL(10,2),
        ADD COLUMN IF NOT EXISTS fee_receipt_number VARCHAR(100),
        ADD COLUMN IF NOT EXISTS judge_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS signed_by VARCHAR(255),
        ADD COLUMN IF NOT EXISTS docket_clerk_initials VARCHAR(10),
        ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS related_docket_numbers TEXT;
    `);
    console.log('✅ Docket entries table updated');

    // Create indexes
    console.log('\n📋 Creating indexes...');
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_docket_entries_ecf_doc_number ON docket_entries (ecf_document_number);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_docket_entries_judge_name ON docket_entries (judge_name);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_docket_entries_filing_fee ON docket_entries (filing_fee) WHERE filing_fee IS NOT NULL;`);
    console.log('✅ Indexes created');

    // Verify columns were added
    console.log('\n🔍 Verifying docket_entries table columns...');
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'docket_entries' 
        AND column_name IN ('ecf_document_number', 'ecf_url', 'attachments', 'filing_fee', 'judge_name', 'is_restricted')
      ORDER BY column_name;
    `);
    console.log('Docket entries columns:', result.rows);

    console.log('\n✅ Docket migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

runDocketMigration().catch(console.error);
