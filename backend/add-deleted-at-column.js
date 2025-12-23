/**
 * Quick migration runner script
 * Adds deletedAt column to trust_accounts table
 * 
 * Usage: node add-deleted-at-column.js
 */

require('dotenv').config();
const { DataSource } = require('typeorm');

// Use DATABASE_URL from .env
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const dataSource = new DataSource({
  type: 'postgres',
  url: connectionString,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : false,
  logging: true
});

async function addDeletedAtColumn() {
  try {
    console.log('🔌 Connecting to PostgreSQL...');
    await dataSource.initialize();
    console.log('✅ Connected to database');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    console.log('🔍 Checking trust_accounts table...');
    
    // Check if column exists
    const result = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'trust_accounts' 
      AND column_name IN ('deletedAt', 'deleted_at')
    `);

    if (result.length === 0) {
      console.log('➕ Adding deletedAt column...');
      await queryRunner.query(`
        ALTER TABLE trust_accounts 
        ADD COLUMN "deletedAt" TIMESTAMP NULL
      `);
      console.log('✅ Column deletedAt added successfully');
    } else if (result[0].column_name === 'deleted_at') {
      console.log('🔄 Renaming deleted_at to deletedAt...');
      await queryRunner.query(`
        ALTER TABLE trust_accounts 
        RENAME COLUMN deleted_at TO "deletedAt"
      `);
      console.log('✅ Column renamed to deletedAt successfully');
    } else {
      console.log('✅ Column deletedAt already exists');
    }

    await queryRunner.release();
    await dataSource.destroy();
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addDeletedAtColumn();
