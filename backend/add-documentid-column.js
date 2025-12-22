/**
 * Add documentId column to citations table
 * Run with: node add-documentid-column.js
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE || 'lexiflow',
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function addDocumentIdColumn() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking if documentId column exists in citations table...');
    
    // Check if column exists
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'citations' 
      AND column_name = 'documentId'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Column documentId already exists in citations table');
      return;
    }
    
    console.log('📝 Adding documentId column to citations table...');
    
    // Add the column
    await client.query(`
      ALTER TABLE citations ADD COLUMN "documentId" character varying
    `);
    
    console.log('✅ Column documentId successfully added to citations table');
    
    // Verify the table structure
    console.log('\n📊 Current citations table structure:');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'citations'
      ORDER BY ordinal_position
    `);
    
    console.table(columnsResult.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
addDocumentIdColumn()
  .then(() => {
    console.log('\n✅ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
