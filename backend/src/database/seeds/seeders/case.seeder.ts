import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../../../cases/entities/case.entity';
import { Client } from '../../../entities/client.entity';
import { User } from '../../../entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CaseSeeder {
  private readonly logger = new Logger(CaseSeeder.name);

  constructor(
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting case seeding...');

    try {
      // Check if cases already exist
      const existingCount = await this.caseRepository.count();
      if (existingCount > 0) {
        this.logger.log(`Cases already exist (${existingCount}). Skipping seed.`);
        return;
      }

      // Load test data
      const casesPath = path.join(__dirname, '../test-data/cases.json');
      const casesData = JSON.parse(fs.readFileSync(casesPath, 'utf8'));

      // Get clients and users for relationships
      const clients = await this.clientRepository.find();
      const users = await this.userRepository.find();

      // Create cases
      const cases = [];
      for (const caseData of casesData) {
        // Assign random client if not specified
        if (!caseData.clientId && clients.length > 0) {
          const randomClient = clients[Math.floor(Math.random() * clients.length)];
          caseData.clientId = randomClient.id;
        }

        // Assign random lead attorney if not specified
        if (!caseData.leadAttorneyId && users.length > 0) {
          const attorneys = users.filter(u => ['partner', 'senior_associate', 'associate'].includes(u.role));
          if (attorneys.length > 0) {
            const randomAttorney = attorneys[Math.floor(Math.random() * attorneys.length)];
            caseData.leadAttorneyId = randomAttorney.id;
          }
        }

        const caseEntity = this.caseRepository.create(caseData);
        cases.push(caseEntity);
      }

      // Save in batches
      const batchSize = 50;
      for (let i = 0; i < cases.length; i += batchSize) {
        const batch = cases.slice(i, i + batchSize);
        await this.caseRepository.save(batch);
        this.logger.log(`Saved cases batch ${i / batchSize + 1}`);
      }

      this.logger.log(`Successfully seeded ${cases.length} cases`);
    } catch (error) {
      this.logger.error(`Error seeding cases: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing cases...');
    await this.caseRepository.clear();
    this.logger.log('Cases cleared');
  }
}
