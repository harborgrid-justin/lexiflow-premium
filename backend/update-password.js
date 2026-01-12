const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_u71zdejvgHOR@ep-morning-violet-ahjfqnv2-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

const passwordHash = '$2b$12$ijqutJdYT88LZvoaOc.cMO30/n9nvSRGLANIQrGQbv6i4J/EbDMxq';

pool.query(
  'UPDATE "users" SET "password_hash" = $1 WHERE email = $2',
  [passwordHash, 'admin@lexiflow.com'],
  (err, res) => {
    if (err) {
      console.error('Error updating password:', err);
      process.exit(1);
    }
    console.log('✓ Password updated successfully');
    console.log('Rows affected:', res.rowCount);
    pool.end();
  }
);
