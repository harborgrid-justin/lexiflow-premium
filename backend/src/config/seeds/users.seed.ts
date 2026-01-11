import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as PathsConfig from '@config/paths.config';

export async function seedUsers(dataSource: DataSource): Promise<void> {
  console.log('Seeding users...');

  const userRepository = dataSource.getRepository('User');

  // Load users from JSON file
  const usersPath = path.join(PathsConfig.TEST_DATA_DIR, 'users.json');
  const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8')) as Array<Record<string, unknown>>;

  // Check if users already exist
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('Users already seeded, skipping...');
    return;
  }

  // Insert users
  for (const userData of usersData) {
    try {
      const roleMapping: Record<string, string> = {
        ADMIN: 'admin',
        ATTORNEY: 'senior_associate',
        PARALEGAL: 'paralegal',
        LEGAL_SECRETARY: 'legal_assistant',
        CLIENT: 'user',
        GUEST: 'user',
      };

      const userRole = String(userData.role || 'GUEST');
      const user = userRepository.create({
        ...userData,
        role: roleMapping[userRole] || 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await userRepository.save(user);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error seeding user ${String(userData.email || 'unknown')}:`, message);
    }
  }

  const userCount = Array.isArray(usersData) ? usersData.length : 0;
  console.log(`✓ Seeded ${userCount} users`);
}
