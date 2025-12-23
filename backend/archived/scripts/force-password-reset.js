const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function resetPassword() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Generate a fresh hash
    const password = 'Password123!';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Generated hash:', hashedPassword);
    console.log('Hash length:', hashedPassword.length);
    
    // Verify the hash works
    const testMatch = await bcrypt.compare(password, hashedPassword);
    console.log('Hash verification test:', testMatch ? '✅ PASS' : '❌ FAIL');
    
    if (!testMatch) {
      console.error('❌ Hash generation failed verification!');
      process.exit(1);
    }
    
    // Update the database
    const result = await client.query(
      `UPDATE users 
       SET password_hash = $1
       WHERE email = $2
       RETURNING id, email, password_hash`,
      [hashedPassword, 'admin@lexiflow.com']
    );
    
    if (result.rows.length === 0) {
      console.error('❌ No user found with email admin@lexiflow.com');
      process.exit(1);
    }
    
    console.log('\n✅ Password updated successfully!');
    console.log('Email:', result.rows[0].email);
    console.log('ID:', result.rows[0].id);
    console.log('Hash in DB:', result.rows[0].password_hash.substring(0, 20) + '...');
    console.log('\n📋 Login credentials:');
    console.log('   Email: admin@lexiflow.com');
    console.log('   Password: Password123!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

resetPassword();
