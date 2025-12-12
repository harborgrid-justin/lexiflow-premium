import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../../../cases/entities/case.entity';
import { User } from '../../../entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DiscoverySeeder {
  private readonly logger = new Logger(DiscoverySeeder.name);

  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting discovery seeding...');

    try {
      // Note: Discovery entities are loaded from test-data files
      // This seeder is a placeholder for future discovery-specific seeding logic

      this.logger.log('Discovery seeding completed');
    } catch (error) {
      this.logger.error(`Error seeding discovery data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing discovery data...');
    // Clear discovery-related data here
    this.logger.log('Discovery data cleared');
  }
}
