// Make clientId nullable in cases table
const { DataSource } = require('typeorm');

const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'lexiflow_user',
  password: 'lexiflow_secure_2024',
  database: 'lexiflow_db',
  synchronize: false,
  logging: true,
});

async function run() {
  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    const result = await dataSource.query(`
      ALTER TABLE cases ALTER COLUMN "clientId" DROP NOT NULL;
    `);

    console.log('✅ Successfully made clientId nullable:', result);
    
    await dataSource.destroy();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error making clientId nullable:', error.message);
    process.exit(1);
  }
}

run();
