import { DataSource } from 'typeorm';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testDatabaseConnection() {
  console.log('🔌 Testing database connection...\n');

  const dataSource = new DataSource({
    type: 'postgres',
    url: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      application_name: 'lexiflow-db-test',
      connect_timeout: 10,
    },
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection successful!\n');

    // Test query
    const result = await dataSource.query('SELECT version()');
    console.log('📊 Database version:');
    console.log(result[0].version);
    console.log('');

    // List all tables
    const tables = await dataSource.query(`
      SELECT
        schemaname,
        tablename,
        tableowner
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    console.log(`📋 Found ${tables.length} tables in public schema:\n`);
    tables.forEach((table: any) => {
      console.log(`  - ${table.tablename}`);
    });
    console.log('');

    // Get table count for each table
    console.log('📈 Table row counts:\n');
    for (const table of tables) {
      try {
        const countResult = await dataSource.query(
          `SELECT COUNT(*) as count FROM "${table.tablename}"`
        );
        const count = countResult[0].count;
        console.log(`  ${table.tablename}: ${count} rows`);
      } catch (error: any) {
        console.log(`  ${table.tablename}: Error - ${error.message}`);
      }
    }

    await dataSource.destroy();
    console.log('\n✅ Database test completed successfully!');
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testDatabaseConnection();
