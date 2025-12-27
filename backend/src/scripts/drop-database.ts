import dataSource from '@config/data-source';

async function dropDatabase() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    
    console.log('Dropping all tables...');
    await dataSource.dropDatabase();
    
    console.log('✅ Database dropped successfully!');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping database:', error);
    process.exit(1);
  }
}

dropDatabase();
