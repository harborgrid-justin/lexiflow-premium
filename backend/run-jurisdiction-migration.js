const fs = require('fs');
const path = require('path');
const pg = require('pg');
const { Client } = pg;
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    } : false
  });

  try {
    await client.connect();
    console.log('✓ Connected to database:', process.env.DB_DATABASE);

    const sql = fs.readFileSync(path.join(__dirname, 'run-jurisdiction-migration.sql'), 'utf8');
    
    console.log('Running jurisdiction migration...');
    await client.query(sql);
    
    console.log('✅ Jurisdiction migration completed successfully!');
    
    // Query to confirm tables exist
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('jurisdictions', 'jurisdiction_rules')
      ORDER BY table_name
    `);
    
    console.log('Created tables:', result.rows.map(r => r.table_name).join(', '));
    
    // Count records
    const countJurisdictions = await client.query('SELECT COUNT(*) FROM jurisdictions');
    const countRules = await client.query('SELECT COUNT(*) FROM jurisdiction_rules');
    
    console.log(`Jurisdictions: ${countJurisdictions.rows[0].count}`);
    console.log(`Rules: ${countRules.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✓ Database connection closed');
  }
}

runMigration();
