import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanDatabase() {
  console.log('Cleaning database...');
  
  // Create a minimal connection just for executing queries (no synchronize)
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_DATABASE || 'lexiflow',
    synchronize: false, // CRITICAL: don't sync
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : false,
  });
  
  try {
    await dataSource.initialize();
    console.log('✓ Connected to database');
    
    // Drop and recreate the public schema - cleanest approach
    console.log('🗑️  Dropping public schema...');
    await dataSource.query(`DROP SCHEMA IF EXISTS public CASCADE`);
    
    console.log('🆕 Recreating public schema...');
    await dataSource.query(`CREATE SCHEMA public`);
    
    console.log('🔒 Granting privileges...');
    await dataSource.query(`GRANT ALL ON SCHEMA public TO ${process.env.DB_USERNAME || 'postgres'}`);
    await dataSource.query(`GRANT ALL ON SCHEMA public TO public`);
    
    // Enable uuid extension (required by entities)
    console.log('🔧 Enabling extensions...');
    await dataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    
    console.log('✓ Database cleaned successfully');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error cleaning database:', error);
    process.exit(1);
  }
}

cleanDatabase();
