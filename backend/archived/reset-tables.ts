import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

config();

const resetTables = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Connected successfully');

    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'reset-discovery-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Dropping problematic tables...');
    await dataSource.query(sql);
    console.log('Tables dropped successfully');

    console.log('\nYou can now run "npm run start:dev" to recreate tables with proper constraints');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

resetTables();
