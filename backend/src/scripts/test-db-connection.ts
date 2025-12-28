import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

interface VersionResult {
  version: string;
}

interface DbInfoResult {
  database: string;
  user: string;
  server_address: string | null;
  server_port: number | null;
}

interface TableResult {
  tablename: string;
}

// Load environment variables
config({ path: path.join(__dirname, '../../.env') });

async function testConnection() {
  console.log('🔍 Testing Neon PostgreSQL Connection...\n');
  
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  // Hide password in logs
  const safeConnectionString = connectionString.replace(
    /:[^:@]+@/,
    ':****@'
  );
  console.log(`📡 Connection String: ${safeConnectionString}\n`);

  const dataSource = new DataSource({
    type: 'postgres',
    url: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    synchronize: false,
    logging: true,
  });

  try {
    console.log('⏳ Initializing connection...');
    await dataSource.initialize();
    console.log('✅ Connection initialized successfully!\n');

    console.log('⏳ Running test query...');
    const result = await dataSource.query<VersionResult[]>('SELECT version()');
    console.log('✅ Query successful!');
    if (result[0]) {
      console.log('📊 PostgreSQL Version:', result[0].version);
    }
    console.log('');

    console.log('⏳ Checking database information...');
    const dbInfo = await dataSource.query<DbInfoResult[]>(`
      SELECT
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);
    console.log('✅ Database Info:');
    if (dbInfo[0]) {
      console.log('   - Database:', dbInfo[0].database);
      console.log('   - User:', dbInfo[0].user);
      console.log('   - Server:', dbInfo[0].server_address || 'N/A');
      console.log('   - Port:', dbInfo[0].server_port || 'N/A');
    }
    console.log('');

    console.log('⏳ Checking existing tables...');
    const tables = await dataSource.query<TableResult[]>(`
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    console.log(`✅ Found ${tables.length} tables in public schema:`);
    if (tables.length > 0) {
      tables.forEach((table: TableResult) => {
        console.log(`   - ${table.tablename}`);
      });
    } else {
      console.log('   (No tables found - migrations may need to be run)');
    }
    console.log('');

    console.log('🎉 All tests passed! Connection is working properly.');
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Connection failed:', message);
    
    if (message.includes('ENOTFOUND')) {
      console.error('\n💡 DNS lookup failed. Check your internet connection and hostname.');
    } else if (message.includes('authentication')) {
      console.error('\n💡 Authentication failed. Check your username and password.');
    } else if (message.includes('ECONNREFUSED')) {
      console.error('\n💡 Connection refused. Check if the database server is running.');
    } else if (message.includes('SSL')) {
      console.error('\n💡 SSL connection issue. Verify SSL settings.');
    }
    
    process.exit(1);
  }
}

testConnection();
