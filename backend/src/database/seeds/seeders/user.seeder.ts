import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { Organization } from '../../../entities/organization.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting user seeding...');

    try {
      // Check if users already exist
      const existingCount = await this.userRepository.count();
      if (existingCount > 0) {
        this.logger.log(`Users already exist (${existingCount}). Skipping seed.`);
        return;
      }

      // Load test data
      const usersPath = path.join(__dirname, '../test-data/users.json');
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

      // Load organizations for reference
      const orgsPath = path.join(__dirname, '../test-data/organizations.json');
      const orgsData = JSON.parse(fs.readFileSync(orgsPath, 'utf8'));

      // Create organization map for reference
      const orgMap = new Map();
      const organizations = await this.organizationRepository.find();
      organizations.forEach(org => {
        orgMap.set(org.id, org);
      });

      // Create users
      const users = [];
      for (const userData of usersData) {
        const user = this.userRepository.create(userData);
        users.push(user);
      }

      // Save in batches
      const batchSize = 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        await this.userRepository.save(batch);
        this.logger.log(`Saved users batch ${i / batchSize + 1}`);
      }

      this.logger.log(`Successfully seeded ${users.length} users`);
    } catch (error) {
      this.logger.error(`Error seeding users: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing users...');
    await this.userRepository.clear();
    this.logger.log('Users cleared');
  }
}
