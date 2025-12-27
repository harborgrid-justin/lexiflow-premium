#!/usr/bin/env ts-node
/**
 * Standalone script to seed drafting templates
 * 
 * Usage:
 *   npm run seed:drafting
 *   or
 *   npx ts-node src/database/scripts/seed-drafting.ts
 * 
 * Environment Variables (from .env):
 *   - DATABASE_URL or individual DB_* variables
 *   - DEFAULT_ADMIN_USER_ID (optional, defaults to UUID zero)
 */

import { DataSource } from 'typeorm';
import { seedDraftingTemplates } from '@database/seeds/drafting-templates.seed';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  console.log('🚀 Starting drafting templates seed script...\n');
  console.log('📁 Environment:', process.env.NODE_ENV || 'development');
  console.log('🗄️  Database Host:', process.env.DB_HOST || 'localhost');
  console.log('📊 Database Name:', process.env.DB_NAME || 'lexiflow');
  console.log('');

  // Create data source
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || process.env.DB_NAME || 'lexiflow',
    entities: [path.resolve(__dirname, '../../**/*.entity{.ts,.js}')],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : false,
  });

  try {
    // Initialize connection
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Run seed
    await seedDraftingTemplates(AppDataSource);

    console.log('\n🎉 Seed script completed successfully!');
  } catch (error) {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
main();
