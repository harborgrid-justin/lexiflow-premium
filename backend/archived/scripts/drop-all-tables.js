/**
 * Drop All Tables Script
 * Drops all tables from the database to allow clean rebuild with snake_case
 */

require('dotenv').config();
const { Client } = require('pg');

async function dropAllTables() {
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
    console.log('✅ Connected to database');

    // Get all table names
    const result = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    console.log(`\n📋 Found ${result.rows.length} tables:`);
    result.rows.forEach(row => console.log(`   - ${row.tablename}`));

    if (result.rows.length === 0) {
      console.log('\n✅ No tables to drop');
      return;
    }

    // Drop all tables with CASCADE
    console.log('\n🗑️  Dropping all tables...');
    const tableNames = result.rows.map(row => row.tablename).join(', ');
    await client.query(`DROP TABLE IF EXISTS ${tableNames} CASCADE`);

    console.log('✅ All tables dropped successfully');

    // Drop TypeORM migrations table
    await client.query(`DROP TABLE IF EXISTS migrations CASCADE`);
    console.log('✅ Migrations table dropped');

    // Drop all custom types/enums
    console.log('\n🗑️  Dropping all custom types/enums...');
    const typesResult = await client.query(`
      SELECT DISTINCT t.typname
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);
    
    for (const row of typesResult.rows) {
      try {
        await client.query(`DROP TYPE IF EXISTS "${row.typname}" CASCADE`);
        console.log(`   ✓ Dropped type: ${row.typname}`);
      } catch (err) {
        console.warn(`   ⚠  Could not drop type: ${row.typname}`);
      }
    }
    console.log('✅ Types/enums dropped');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

dropAllTables();
