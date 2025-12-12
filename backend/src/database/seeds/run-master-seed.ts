import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { runMasterSeeder } from './master-seeder';

// Load environment variables
config();

async function bootstrap() {
  console.log('===========================================');
  console.log('LexiFlow Master Database Seeding');
  console.log('===========================================\n');

  // Check for environment flag
  const args = process.argv.slice(2);
  const isTestEnv = args.includes('--env=test');

  if (isTestEnv) {
    console.log('Environment: TEST');
    process.env.DATABASE_NAME = process.env.DATABASE_NAME_TEST || 'lexiflow_test';
  } else {
    console.log('Environment: DEVELOPMENT');
  }

  console.log(`Database: ${process.env.DATABASE_NAME}\n`);

  // Create DataSource
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'lexiflow',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  try {
    // Initialize connection
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('✓ Connected to database\n');

    // Run master seeder
    await runMasterSeeder(dataSource);

    console.log('\n===========================================');
    console.log('✓ Master seeding completed successfully!');
    console.log('===========================================\n');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('✓ Database connection closed');
    }
  }
}

// Run the seeder
bootstrap();
