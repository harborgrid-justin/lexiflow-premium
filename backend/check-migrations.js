const { Client } = require('pg');

async function checkMigrations() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'lexiflow',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    
    // Check migrations table
    const migrationsResult = await client.query('SELECT * FROM migrations ORDER BY timestamp');
    console.log('\n=== Migrations in database ===');
    console.log(migrationsResult.rows);
    
    // Check if discovery_requests table exists
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('discovery_requests', 'depositions', 'custodians', 'trial_exhibits')
      ORDER BY table_name
    `);
    console.log('\n=== Discovery tables that exist ===');
    console.log(tablesResult.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkMigrations();
