const bcrypt = require('bcrypt');

async function testPassword() {
  const plainPassword = 'admin123';
  const storedHash = '$2b$10$2tlorh.BC1.7456789012345678901234567890123456789012';
  
  // This is the actual hash from the database (truncated in display)
  // Let's test with a fresh hash
  const freshHash = await bcrypt.hash('admin123', 10);
  console.log('Fresh hash:', freshHash);
  
  const isValid = await bcrypt.compare('admin123', freshHash);
  console.log('Fresh hash comparison:', isValid);
  
  // Now let's get the actual hash from the database
  const { Client } = require('pg');
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  const result = await client.query(
    'SELECT password, password_hash FROM users WHERE email = $1',
    ['admin@lexiflow.com']
  );
  
  if (result.rows.length > 0) {
    const dbPassword = result.rows[0].password;
    const dbPasswordHash = result.rows[0].password_hash;
    
    console.log('\nDatabase password column:', dbPassword ? dbPassword.substring(0, 30) + '...' : 'NULL');
    console.log('Database password_hash column:', dbPasswordHash ? dbPasswordHash.substring(0, 30) + '...' : 'NULL');
    
    console.log('\nTesting with password column:');
    const test1 = await bcrypt.compare('admin123', dbPassword);
    console.log('Result:', test1);
    
    console.log('\nTesting with password_hash column:');
    const test2 = await bcrypt.compare('admin123', dbPasswordHash);
    console.log('Result:', test2);
  }
  
  await client.end();
}

testPassword().catch(console.error);
