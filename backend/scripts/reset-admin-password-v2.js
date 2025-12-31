
const { DataSource } = require('typeorm');
const bcrypt = require('bcrypt');
const { User } = require('../dist/users/entities/user.entity');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'lexiflow',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [__dirname + '/../dist/**/*.entity.js'],
  synchronize: false,
});

async function resetPassword() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    console.log('Users found:', users.map(u => u.email));

    const adminUser = await userRepository.findOne({ where: { email: 'admin@lexiflow.com' } });

    if (adminUser) {
      console.log('Found admin user:', adminUser.email);
      const hashedPassword = await bcrypt.hash('Demo123!', 10);
      adminUser.password = hashedPassword;
      await userRepository.save(adminUser);
      console.log('Password updated successfully for admin@lexiflow.com');
      console.log('New hash:', hashedPassword);
    } else {
      console.log('Admin user not found');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPassword();
