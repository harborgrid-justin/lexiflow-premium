const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function seedAdmin() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check if admin user exists
    const existingAdmin = await client.query(
      `SELECT id, email FROM users WHERE email = $1`,
      ['admin@lexiflow.com']
    );
    
    if (existingAdmin.rows.length > 0) {
      console.log('ℹ️  Admin user already exists');
      console.log(`   Email: ${existingAdmin.rows[0].email}`);
      console.log(`   ID: ${existingAdmin.rows[0].id}`);
      
      // Update the password for existing admin
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      await client.query(
        `UPDATE users 
         SET password_hash = $1,
             "password" = $1,
             status = 'active',
             "isActive" = true,
             "isVerified" = true,
             role = 'super_admin'
         WHERE email = $2`,
        [hashedPassword, 'admin@lexiflow.com']
      );
      console.log('✅ Updated admin user password to: Password123!');
    } else {
      // Create new admin user
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      
      await client.query(`
        INSERT INTO users (
          email,
          password,
          password_hash,
          "firstName",
          "lastName",
          role,
          status,
          "isActive",
          "isVerified",
          first_name,
          last_name
        ) VALUES (
          $1, $2, $2, $3, $4, $5, $6, $7, $8, $3, $4
        )
      `, [
        'admin@lexiflow.com',
        hashedPassword,
        'Admin',
        'User',
        'super_admin',
        'active',
        true,
        true
      ]);
      
      console.log('✅ Created admin user:');
      console.log('   Email: admin@lexiflow.com');
      console.log('   Password: Password123!');
    }
    
    // Verify the user
    const user = await client.query(
      `SELECT id, email, "firstName", "lastName", role, status, "isActive", "isVerified" 
       FROM users WHERE email = $1`,
      ['admin@lexiflow.com']
    );
    
    console.log('\n📋 Admin user details:');
    console.log(user.rows[0]);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

seedAdmin();
