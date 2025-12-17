const fs = require('fs');
const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'neondb',
  ssl: { rejectUnauthorized: false },
});

async function runScript() {
  try {
    await AppDataSource.initialize();
    console.log('✓ Database connected');

    const sql = fs.readFileSync('./create-pleading-templates.sql', 'utf8');
    await AppDataSource.query(sql);
    
    console.log('✓ Pleading templates table created and seeded');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

runScript();
