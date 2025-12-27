/**
 * Check if compliance_checks table exists
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import dataSource from './src/config/data-source';

async function checkTable() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    
    console.log('Checking for compliance_checks table...');
    const result = await dataSource.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'compliance_checks'
      ORDER BY ordinal_position;
    `);
    
    if (result.length > 0) {
      console.log('✅ Table exists! Columns:');
      console.table(result);
    } else {
      console.log('❌ Table does not exist. Running migration...');
      const sqlPath = join(__dirname, 'migrations', 'create-compliance-checks-table.sql');
      const sql = readFileSync(sqlPath, 'utf-8');
      await dataSource.query(sql);
      console.log('✅ Migration completed!');
    }
    
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
