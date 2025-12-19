require('dotenv').config();
const { DataSource } = require('typeorm');

async function addPortalTokenColumns() {
  // Load TypeORM data source configuration
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    } : false,
  });

  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    // Add portal token columns
    await AppDataSource.query(`
      ALTER TABLE clients 
      ADD COLUMN IF NOT EXISTS "portalToken" VARCHAR(500),
      ADD COLUMN IF NOT EXISTS "portalTokenExpiry" TIMESTAMP;
    `);
    
    console.log('✓ Portal token columns added to clients table');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addPortalTokenColumns();
