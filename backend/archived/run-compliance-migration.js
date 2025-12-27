/**
 * Run compliance_checks table migration directly using pg
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    
    // Check if table exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'compliance_checks'
      );
    `);
    
    if (checkResult.rows[0].exists) {
      console.log('✅ compliance_checks table already exists!');
      
      // Show columns
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'compliance_checks'
        ORDER BY ordinal_position;
      `);
      console.log('Columns:', columns.rows.map(r => r.column_name).join(', '));
    } else {
      console.log('Creating compliance_checks table...');
      const sqlPath = path.join(__dirname, 'migrations', 'create-compliance-checks-table.sql');
      const sql = fs.readFileSync(sqlPath, 'utf-8');
      
      await client.query(sql);
      console.log('✅ Migration completed successfully!');
    }
    
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await client.end();
    process.exit(1);
  }
}

runMigration();
