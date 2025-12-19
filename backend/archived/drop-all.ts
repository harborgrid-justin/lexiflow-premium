import { DataSource } from 'typeorm';
import { dataSourceOptions } from './src/config/data-source';

async function dropDatabase() {
  console.log('🗑️  Dropping all tables...');
  
  const config = { ...dataSourceOptions, synchronize: false } as any;
  const dataSource = new DataSource(config);
  
  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');
    
    // Drop all tables
    await dataSource.query('DROP SCHEMA public CASCADE');
    await dataSource.query('CREATE SCHEMA public');
    
    console.log('✅ All tables dropped successfully');
    console.log('✅ Schema recreated');
    
    await dataSource.destroy();
    console.log('✅ Database reset complete - please restart backend server');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  }
}

dropDatabase();
