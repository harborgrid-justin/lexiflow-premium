const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkUser() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check admin user
    const user = await client.query(
      `SELECT id, email, password, password_hash, "firstName", "lastName", role, status, "isActive", "isVerified"
       FROM users WHERE email = $1`,
      ['admin@lexiflow.com']
    );
    
    if (user.rows.length === 0) {
      console.log('❌ Admin user not found!');
    } else {
      console.log('\n📋 Admin user in database:');
      console.log('ID:', user.rows[0].id);
      console.log('Email:', user.rows[0].email);
      console.log('Password hash (first 20 chars):', user.rows[0].password ? user.rows[0].password.substring(0, 20) + '...' : 'NULL');
      console.log('Password_hash (first 20 chars):', user.rows[0].password_hash ? user.rows[0].password_hash.substring(0, 20) + '...' : 'NULL');
      console.log('Role:', user.rows[0].role);
      console.log('Status:', user.rows[0].status);
      console.log('Is Active:', user.rows[0].isActive);
      console.log('Is Verified:', user.rows[0].isVerified);
      console.log('First Name:', user.rows[0].firstName);
      console.log('Last Name:', user.rows[0].lastName);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

checkUser();
