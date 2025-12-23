const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixStatusColumn() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Create the user_status_enum type if it doesn't exist
    console.log('\n🔧 Creating user_status_enum type...');
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "user_status_enum" AS ENUM ('active', 'inactive', 'suspended', 'pending');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('✅ user_status_enum type ready');
    
    // Check if status column exists
    const statusCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'status'
    `);
    
    if (statusCheck.rows.length === 0) {
      console.log('\n🔧 Adding status column...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN status "user_status_enum" DEFAULT 'active'::user_status_enum
      `);
      console.log('✅ status column added');
      
      // Copy data from isActive to status
      console.log('\n🔧 Migrating data from isActive to status...');
      await client.query(`
        UPDATE users 
        SET status = CASE 
          WHEN "isActive" = true THEN 'active'::user_status_enum
          ELSE 'inactive'::user_status_enum
        END
      `);
      console.log('✅ Data migrated');
    } else {
      console.log('\n✅ status column already exists');
    }
    
    // Verify final structure
    const columns = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('status', 'isActive', 'role')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Status-related columns:');
    columns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.udt_name})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

fixStatusColumn();
