const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function addColumns() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // First, check what columns currently exist
    const existingColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Current columns in users table:');
    existingColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Add missing columns one by one to avoid syntax errors
    const columnsToAdd = [
      { name: 'created_by', type: 'uuid' },
      { name: 'updated_by', type: 'uuid' },
      { name: 'password_hash', type: 'varchar' },
      { name: 'deletedAt', type: 'timestamp' },
      { name: 'first_name', type: 'varchar' },
      { name: 'last_name', type: 'varchar' },
      { name: 'phone', type: 'varchar' },
      { name: 'title', type: 'varchar' },
      { name: 'department', type: 'varchar' },
      { name: 'permissions', type: 'jsonb' },
      { name: 'preferences', type: 'jsonb' },
      { name: 'avatar_url', type: 'varchar' },
      { name: 'last_login_at', type: 'timestamp' },
      { name: 'is_verified', type: 'boolean DEFAULT false' },
      { name: 'two_factor_enabled', type: 'boolean DEFAULT false' },
      { name: 'totp_secret', type: 'varchar' }
    ];
    
    console.log('\n🔧 Adding missing columns...');
    for (const col of columnsToAdd) {
      try {
        await client.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}
        `);
        console.log(`  ✅ Added/verified: ${col.name}`);
      } catch (error) {
        console.log(`  ⚠️  ${col.name}: ${error.message}`);
      }
    }
    
    // Verify all columns
    const finalColumns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Final columns in users table:');
    finalColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

addColumns();
