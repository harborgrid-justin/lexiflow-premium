/**
 * Drop everything from database - tables, indexes, enums, sequences
 */

require('dotenv').config();
const { Client } = require('pg');

async function dropEverything() {
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
    console.log('✅ Connected to database\n');

    // Drop all tables
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    
    if (tables.rows.length > 0) {
      console.log(`🗑️  Dropping ${tables.rows.length} tables...`);
      const tableNames = tables.rows.map(r => `"${r.tablename}"`).join(', ');
      await client.query(`DROP TABLE IF EXISTS ${tableNames} CASCADE`);
      console.log('✅ Tables dropped\n');
    }

    // Drop all enums
    const enums = await client.query(`
      SELECT DISTINCT t.typname FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);
    
    if (enums.rows.length > 0) {
      console.log(`🗑️  Dropping ${enums.rows.length} enums...`);
      for (const row of enums.rows) {
        await client.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
      }
      console.log('✅ Enums dropped\n');
    }

    // Drop all sequences
    const sequences = await client.query(`
      SELECT sequence_name FROM information_schema.sequences
      WHERE sequence_schema = 'public'
    `);
    
    if (sequences.rows.length > 0) {
      console.log(`🗑️  Dropping ${sequences.rows.length} sequences...`);
      for (const row of sequences.rows) {
        await client.query(`DROP SEQUENCE IF EXISTS "${row.sequence_name}" CASCADE`);
      }
      console.log('✅ Sequences dropped\n');
    }

    console.log('✨ Database completely clean!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

dropEverything();
