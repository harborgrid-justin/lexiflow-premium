const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Cases table: Add federal litigation tracking fields
    console.log('\n📋 Adding columns to cases table...');
    
    await client.query(`
      ALTER TABLE cases 
        ADD COLUMN IF NOT EXISTS referred_judge VARCHAR(100),
        ADD COLUMN IF NOT EXISTS magistrate_judge VARCHAR(100),
        ADD COLUMN IF NOT EXISTS date_terminated DATE,
        ADD COLUMN IF NOT EXISTS jury_demand VARCHAR(50),
        ADD COLUMN IF NOT EXISTS cause_of_action VARCHAR(500),
        ADD COLUMN IF NOT EXISTS nature_of_suit VARCHAR(255),
        ADD COLUMN IF NOT EXISTS nature_of_suit_code VARCHAR(10),
        ADD COLUMN IF NOT EXISTS related_cases JSONB;
    `);
    console.log('✅ Cases table updated');

    // Parties table: Add attorney representation fields
    console.log('\n📋 Adding columns to parties table...');
    
    await client.query(`
      ALTER TABLE parties 
        ADD COLUMN IF NOT EXISTS description VARCHAR(500),
        ADD COLUMN IF NOT EXISTS attorney_firm VARCHAR(255),
        ADD COLUMN IF NOT EXISTS attorney_email VARCHAR(255),
        ADD COLUMN IF NOT EXISTS attorney_phone VARCHAR(50),
        ADD COLUMN IF NOT EXISTS attorney_address TEXT,
        ADD COLUMN IF NOT EXISTS attorney_fax VARCHAR(50),
        ADD COLUMN IF NOT EXISTS is_lead_attorney BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_attorney_to_be_noticed BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS is_pro_se BOOLEAN DEFAULT false;
    `);
    console.log('✅ Parties table updated');

    // Create indexes
    console.log('\n📋 Creating indexes...');
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cases_nature_of_suit_code ON cases (nature_of_suit_code);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_cases_date_terminated ON cases (date_terminated);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_parties_is_lead_attorney ON parties (is_lead_attorney);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_parties_is_pro_se ON parties (is_pro_se);`);
    console.log('✅ Indexes created');

    // Verify columns were added
    console.log('\n🔍 Verifying cases table columns...');
    const casesResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'cases' 
        AND column_name IN ('referred_judge', 'magistrate_judge', 'cause_of_action', 'nature_of_suit_code', 'date_terminated', 'jury_demand', 'related_cases')
      ORDER BY column_name;
    `);
    console.log('Cases columns:', casesResult.rows);

    console.log('\n🔍 Verifying parties table columns...');
    const partiesResult = await client.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'parties' 
        AND column_name IN ('description', 'attorney_firm', 'attorney_email', 'is_lead_attorney', 'is_attorney_to_be_noticed', 'is_pro_se')
      ORDER BY column_name;
    `);
    console.log('Parties columns:', partiesResult.rows);

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

runMigration().catch(console.error);
