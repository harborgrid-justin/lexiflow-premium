const bcrypt = require('bcrypt');

const password = 'Demo123!';
const rounds = 12;

bcrypt.hash(password, rounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Password hash:');
  console.log(hash);
  console.log('\nSQL UPDATE statement:');
  console.log(`UPDATE "users" SET "password_hash" = '${hash}' WHERE email = 'admin@lexiflow.com';`);
});
