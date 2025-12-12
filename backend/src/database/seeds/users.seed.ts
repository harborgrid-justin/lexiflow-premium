import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  console.log('Seeding users...');

  const userRepository = dataSource.getRepository('User');

  // Load users from JSON file
  const usersPath = path.join(__dirname, 'test-data', 'users.json');
  const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

  // Check if users already exist
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('Users already seeded, skipping...');
    return;
  }

  // Insert users
  for (const userData of usersData) {
    try {
      const user = userRepository.create({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepository.save(user);
    } catch (error) {
      console.error(`Error seeding user ${userData.email}:`, error.message);
    }
  }

  console.log(`✓ Seeded ${usersData.length} users`);
}
