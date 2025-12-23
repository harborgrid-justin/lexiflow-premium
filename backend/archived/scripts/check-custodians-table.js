const { Client } = require('pg');

const client = new Client({
  host: 'ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_u71zdejvgHOR',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'custodians'
      );
    `);
    console.log('\nTable exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Get column info
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'custodians'
        ORDER BY ordinal_position;
      `);
      console.log('\nCurrent columns:');
      columns.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });

      // Count rows
      const count = await client.query('SELECT COUNT(*) FROM custodians');
      console.log(`\nTotal rows: ${count.rows[0].count}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTable();
