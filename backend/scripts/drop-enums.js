/**
 * Drop all PostgreSQL enums/types
 */

require('dotenv').config();
const { Client } = require('pg');

async function dropAllEnums() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : false
  });

  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT DISTINCT t.typname
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);

    console.log(`Found ${result.rows.length} enums to drop`);

    for (const row of result.rows) {
      await client.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
      console.log(`  ✓ Dropped: ${row.typname}`);
    }

    console.log('✅ All enums dropped');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

dropAllEnums();
