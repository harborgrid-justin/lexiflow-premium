import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from '../../../entities/organization.entity';
import { User } from '../../../entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ComplianceSeeder {
  private readonly logger = new Logger(ComplianceSeeder.name);

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting compliance seeding...');

    try {
      // Note: Compliance audit data is available in test-data/compliance-audits.json
      // This seeder is a placeholder for compliance-specific seeding logic
      // Actual compliance audit entity would need to be created

      const complianceAuditsPath = path.join(__dirname, '../test-data/compliance-audits.json');
      if (fs.existsSync(complianceAuditsPath)) {
        const auditsData = JSON.parse(fs.readFileSync(complianceAuditsPath, 'utf8'));
        this.logger.log(`Loaded ${auditsData.length} compliance audit records from test data`);
      }

      this.logger.log('Compliance seeding completed');
    } catch (error) {
      this.logger.error(`Error seeding compliance data: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing compliance data...');
    // Clear compliance-related data here
    this.logger.log('Compliance data cleared');
  }
}
