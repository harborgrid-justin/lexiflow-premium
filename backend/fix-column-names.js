const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixColumnNames() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check current column names
    const columns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('firstName', 'lastName', 'first_name', 'last_name')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Current name columns:');
    columns.rows.forEach(row => console.log(`  - ${row.column_name}`));
    
    // Copy data from camelCase to snake_case columns if needed
    const hasCamelCase = columns.rows.some(r => r.column_name === 'firstName');
    const hasSnakeCase = columns.rows.some(r => r.column_name === 'first_name');
    
    if (hasCamelCase && hasSnakeCase) {
      console.log('\n🔧 Copying data from camelCase to snake_case columns...');
      await client.query(`
        UPDATE users 
        SET 
          first_name = COALESCE(first_name, "firstName"),
          last_name = COALESCE(last_name, "lastName")
        WHERE "firstName" IS NOT NULL OR "lastName" IS NOT NULL
      `);
      console.log('✅ Data copied');
    }
    
    // Make snake_case columns NOT NULL only if they have data
    console.log('\n🔧 Ensuring snake_case columns are NOT NULL...');
    
    // Update any NULL values with empty string first
    await client.query(`
      UPDATE users 
      SET 
        first_name = COALESCE(first_name, "firstName", ''),
        last_name = COALESCE(last_name, "lastName", '')
      WHERE first_name IS NULL OR last_name IS NULL
    `);
    
    // Now set NOT NULL constraint
    await client.query(`
      ALTER TABLE users 
      ALTER COLUMN first_name SET NOT NULL,
      ALTER COLUMN last_name SET NOT NULL
    `);
    console.log('✅ Constraints set');
    
    // Verify final state
    const finalColumns = await client.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('firstName', 'lastName', 'first_name', 'last_name')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Final name columns:');
    finalColumns.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
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

fixColumnNames();
