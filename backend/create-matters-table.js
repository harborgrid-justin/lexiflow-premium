const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function createMattersTable() {
  // Use DATABASE_URL from .env (Neon connection)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL database');

    const sqlFile = path.join(__dirname, 'create-matters-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    console.log('Executing SQL script...');
    await client.query(sql);
    
    console.log('✅ Matters table created successfully!');
  } catch (error) {
    console.error('❌ Error creating matters table:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

createMattersTable();
