import dataSource from '@config/data-source';
import { seedUsers } from './user.seed';
import { seedClients } from './client.seed';

async function runSeeds() {
  try {
    // Initialize database connection
    await dataSource.initialize();
    console.log('📦 Database connection initialized');

    // Run all seeders in order
    console.log('🌱 Starting database seeding...\n');

    await seedUsers(dataSource);
    await seedClients(dataSource);

    console.log('\n✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runSeeds();
