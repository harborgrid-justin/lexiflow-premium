const { Client } = require('pg');
require('dotenv').config();

async function checkTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');
    
    // Check if table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'matters'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('✗ Matters table does not exist');
      return;
    }
    
    console.log('✓ Matters table exists');
    
    // Get columns
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'matters' 
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumns:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Check if matterNumber column exists
    const hasMatterNumber = result.rows.some(col => col.column_name === 'matternumber');
    console.log(`\n${hasMatterNumber ? '✓' : '✗'} matterNumber column ${hasMatterNumber ? 'exists' : 'NOT FOUND'}`);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkTable();
