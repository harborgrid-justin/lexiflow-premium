const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function dropCamelCaseColumns() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // List of camelCase columns to drop (that have snake_case equivalents)
    const columnsToCheck = [
      { camel: 'firstName', snake: 'first_name' },
      { camel: 'lastName', snake: 'last_name' },
      { camel: 'avatarUrl', snake: 'avatar_url' },
      { camel: 'lastLoginAt', snake: 'last_login_at' },
      { camel: 'isVerified', snake: 'is_verified' },
      { camel: 'twoFactorEnabled', snake: 'two_factor_enabled' },
      { camel: 'twoFactorSecret', snake: 'totp_secret' }
    ];
    
    console.log('\n🔧 Dropping camelCase columns...');
    for (const col of columnsToCheck) {
      try {
        // Check if both columns exist
        const check = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name IN ($1, $2)
        `, [col.camel, col.snake]);
        
        const hasBoth = check.rows.length === 2;
        const hasCamel = check.rows.some(r => r.column_name === col.camel);
        const hasSnake = check.rows.some(r => r.column_name === col.snake);
        
        if (hasBoth) {
          // Drop the camelCase column since we have snake_case
          await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS "${col.camel}"`);
          console.log(`  ✅ Dropped ${col.camel} (using ${col.snake} instead)`);
        } else if (hasCamel && !hasSnake) {
          console.log(`  ⚠️  Only ${col.camel} exists (no ${col.snake})`);
        } else if (hasSnake) {
          console.log(`  ✓  ${col.snake} exists (${col.camel} already removed)`);
        }
      } catch (error) {
        console.log(`  ❌ Error with ${col.camel}: ${error.message}`);
      }
    }
    
    // Also drop other camelCase columns that might cause issues
    const otherCamelColumns = [
      'isActive', 'verificationToken', 'verificationTokenExpiry',
      'resetPasswordToken', 'resetPasswordExpiry', 'lastLoginIp',
      'loginAttempts', 'lockedUntil', 'employeeId', 'hireDate',
      'terminationDate', 'managerId', 'officeLocation', 'timeZone'
    ];
    
    console.log('\n🔧 Checking other camelCase columns...');
    for (const col of otherCamelColumns) {
      try {
        await client.query(`ALTER TABLE users DROP COLUMN IF EXISTS "${col}"`);
        console.log(`  ✅ Dropped ${col}`);
      } catch (error) {
        console.log(`  ⚠️  ${col}: ${error.message}`);
      }
    }
    
    // Verify final columns
    const finalColumns = await client.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY column_name
    `);
    
    console.log('\n📋 Final columns in users table:');
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

dropCamelCaseColumns();
