const { Client } = require('pg');

async function checkTables() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check for advisors table
    const advisorsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='advisors'
      ORDER BY ordinal_position
    `;
    
    const advisorsResult = await client.query(advisorsQuery);
    console.log('\n=== ADVISORS TABLE ===');
    if (advisorsResult.rows.length > 0) {
      console.log('Columns:', advisorsResult.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    } else {
      console.log('⚠️  Table does not exist!');
    }
    
    // Check for experts table
    const expertsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='experts'
      ORDER BY ordinal_position
    `;
    
    const expertsResult = await client.query(expertsQuery);
    console.log('\n=== EXPERTS TABLE ===');
    if (expertsResult.rows.length > 0) {
      console.log('Columns:', expertsResult.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    } else {
      console.log('⚠️  Table does not exist!');
    }
    
    // Check for case_strategies table
    const strategiesQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='case_strategies'
      ORDER BY ordinal_position
    `;
    
    const strategiesResult = await client.query(strategiesQuery);
    console.log('\n=== CASE_STRATEGIES TABLE ===');
    if (strategiesResult.rows.length > 0) {
      console.log('Columns:', strategiesResult.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    } else {
      console.log('⚠️  Table does not exist!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nDatabase connection closed');
  }
}

checkTables();
