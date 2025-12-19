import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../src/config/data-source';

async function initializeSchema() {
  console.log('🔄 Initializing database schema...');
  
  const dataSource = new DataSource({
    ...dataSourceOptions,
    synchronize: true,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database schema initialized successfully!');
    console.log('📊 All tables and indexes have been created.');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing schema:', error);
    process.exit(1);
  }
}

initializeSchema();
