/**
 * Script to run SQL migrations directly
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import dataSource from './src/config/data-source';

async function runMigration() {
  try {
    console.log('Initializing database connection...');
    await dataSource.initialize();
    
    console.log('Reading migration file...');
    const sqlPath = join(__dirname, 'migrations', 'create-compliance-checks-table.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    console.log('Running migration...');
    await dataSource.query(sql);
    
    console.log('✅ Migration completed successfully!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
