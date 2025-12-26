/**
 * Initialize Database with Snake Case Naming
 * Uses TypeORM synchronize to auto-create tables with snake_case
 */

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';

async function initializeDatabase() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'lexiflow',
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    } : false,
    entities: [path.join(__dirname, '../src/**/*.entity.{ts,js}')],
    synchronize: true, // Auto-create tables with snake_case
    namingStrategy: new SnakeNamingStrategy(),
    logging: ['error', 'warn', 'schema'],
  });

  try {
    console.log('🔄 Initializing database with snake_case naming...\n');
    await dataSource.initialize();
    console.log('\n✅ Database initialized successfully with snake_case!');
    console.log('📊 All table columns are now in snake_case format\n');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initializeDatabase();
