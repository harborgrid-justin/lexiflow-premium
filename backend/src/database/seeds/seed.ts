import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { seedUsers } from './users.seed';
import { seedClients } from './clients.seed';
import { seedCases } from './cases.seed';
import { seedDocuments } from './documents.seed';
import { seedTimeEntries } from './time-entries.seed';

// Load environment variables
config();

async function bootstrap() {
  console.log('===========================================');
  console.log('LexiFlow Database Seeding');
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

    // Run seeds in order (respecting foreign key dependencies)
    await seedUsers(dataSource);
    await seedClients(dataSource);
    await seedCases(dataSource);
    await seedDocuments(dataSource);
    await seedTimeEntries(dataSource);

    console.log('\n===========================================');
    console.log('✓ Database seeding completed successfully!');
    console.log('===========================================\n');

    // Print summary
    const userCount = await dataSource.getRepository('User').count();
    const clientCount = await dataSource.getRepository('Client').count();
    const caseCount = await dataSource.getRepository('Case').count();
    const documentCount = await dataSource.getRepository('Document').count();
    const timeEntryCount = await dataSource.getRepository('TimeEntry').count();

    console.log('Summary:');
    console.log(`  Users:        ${userCount}`);
    console.log(`  Clients:      ${clientCount}`);
    console.log(`  Cases:        ${caseCount}`);
    console.log(`  Documents:    ${documentCount}`);
    console.log(`  Time Entries: ${timeEntryCount}`);
    console.log('');

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
