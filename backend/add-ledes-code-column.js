const { Client } = require('pg');

async function addLedesCodeColumn() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if column exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='time_entries' 
        AND column_name='ledesCode'
    `;
    
    const checkResult = await client.query(checkQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✓ ledesCode column already exists in time_entries table');
    } else {
      console.log('Adding ledesCode column to time_entries table...');
      
      const alterQuery = `
        ALTER TABLE time_entries 
        ADD COLUMN "ledesCode" character varying(20) NULL
      `;
      
      await client.query(alterQuery);
      console.log('✓ Successfully added ledesCode column');
    }
    
    // Verify
    const verifyQuery = `
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name='time_entries' 
        AND column_name='ledesCode'
    `;
    
    const verifyResult = await client.query(verifyQuery);
    console.log('\nColumn details:', verifyResult.rows[0]);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

addLedesCodeColumn();
