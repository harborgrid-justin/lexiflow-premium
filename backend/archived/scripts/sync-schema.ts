import { config } from 'dotenv';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'lexiflow',
  ssl:
    process.env.DB_SSL === 'true'
      ? {
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
        }
      : false,
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  synchronize: true, // This creates all tables and indexes
  logging: false, // Reduce noise
  dropSchema: false, // Don't drop - clean script already did that
});

async function syncSchema() {
  console.log('🔄 Initializing database connection and synchronizing schema...');

  try {
    await AppDataSource.initialize();
    console.log('✅ Database schema synchronized successfully!');
    console.log('📊 All tables and indexes have been created.');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error synchronizing schema:', error);
    process.exit(1);
  }
}

syncSchema();
