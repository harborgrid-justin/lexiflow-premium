import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Organization } from '../../../entities/organization.entity';
import { User } from '../../../entities/user.entity';
import { Client } from '../../../entities/client.entity';
import { Case } from '../../../cases/entities/case.entity';
import { Document } from '../../../documents/entities/document.entity';
import { Party } from '../../../entities/party.entity';
import { Motion } from '../../../entities/motion.entity';
import { TimeEntry } from '../../../billing/time-entries/entities/time-entry.entity';
import { Invoice } from '../../../billing/invoices/entities/invoice.entity';
import { Expense } from '../../../billing/expenses/entities/expense.entity';
import { UserSeeder } from './user.seeder';
import { CaseSeeder } from './case.seeder';
import { DocumentSeeder } from './document.seeder';
import { BillingSeeder } from './billing.seeder';
import { DiscoverySeeder } from './discovery.seeder';
import { ComplianceSeeder } from './compliance.seeder';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MasterSeeder {
  private readonly logger = new Logger(MasterSeeder.name);

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Party)
    private readonly partyRepository: Repository<Party>,
    @InjectRepository(Motion)
    private readonly motionRepository: Repository<Motion>,
    private readonly userSeeder: UserSeeder,
    private readonly caseSeeder: CaseSeeder,
    private readonly documentSeeder: DocumentSeeder,
    private readonly billingSeeder: BillingSeeder,
    private readonly discoverySeeder: DiscoverySeeder,
    private readonly complianceSeeder: ComplianceSeeder,
  ) {}

  /**
   * Run all seeders in the correct order
   */
  async seedAll(clearExisting: boolean = false): Promise<void> {
    this.logger.log('='.repeat(80));
    this.logger.log('Starting Master Database Seeding Process');
    this.logger.log('='.repeat(80));

    try {
      if (clearExisting) {
        await this.clearAll();
      }

      // Seed in dependency order
      await this.seedOrganizations();
      await this.userSeeder.seed();
      await this.seedClients();
      await this.caseSeeder.seed();
      await this.seedParties();
      await this.documentSeeder.seed();
      await this.seedMotions();
      await this.billingSeeder.seed();
      await this.discoverySeeder.seed();
      await this.complianceSeeder.seed();
      await this.seedAdditionalData();

      this.logger.log('='.repeat(80));
      this.logger.log('Master Database Seeding Completed Successfully!');
      this.logger.log('='.repeat(80));

      await this.logSeedingStatistics();
    } catch (error) {
      this.logger.error('Error during master seeding process', error.stack);
      throw error;
    }
  }

  /**
   * Seed organizations (foundation data)
   */
  private async seedOrganizations(): Promise<void> {
    this.logger.log('Seeding organizations...');

    const existingCount = await this.organizationRepository.count();
    if (existingCount > 0) {
      this.logger.log(`Organizations already exist (${existingCount}). Skipping seed.`);
      return;
    }

    const orgsPath = path.join(__dirname, '../test-data/organizations.json');
    const orgsData = JSON.parse(fs.readFileSync(orgsPath, 'utf8'));

    const organizations = orgsData.map(org => this.organizationRepository.create(org));
    await this.organizationRepository.save(organizations);

    this.logger.log(`Seeded ${organizations.length} organizations`);
  }

  /**
   * Seed clients
   */
  private async seedClients(): Promise<void> {
    this.logger.log('Seeding clients...');

    const existingCount = await this.clientRepository.count();
    if (existingCount > 0) {
      this.logger.log(`Clients already exist (${existingCount}). Skipping seed.`);
      return;
    }

    const clientsPath = path.join(__dirname, '../test-data/clients.json');
    if (!fs.existsSync(clientsPath)) {
      this.logger.log('Clients data file not found. Skipping.');
      return;
    }

    const clientsData = JSON.parse(fs.readFileSync(clientsPath, 'utf8'));

    const clients = clientsData.map(client => this.clientRepository.create(client));
    await this.clientRepository.save(clients);

    this.logger.log(`Seeded ${clients.length} clients`);
  }

  /**
   * Seed parties
   */
  private async seedParties(): Promise<void> {
    this.logger.log('Seeding parties...');

    const existingCount = await this.partyRepository.count();
    if (existingCount > 0) {
      this.logger.log(`Parties already exist (${existingCount}). Skipping seed.`);
      return;
    }

    const partiesPath = path.join(__dirname, '../test-data/parties.json');
    if (!fs.existsSync(partiesPath)) {
      this.logger.log('Parties data file not found. Skipping.');
      return;
    }

    const partiesData = JSON.parse(fs.readFileSync(partiesPath, 'utf8'));
    const cases = await this.caseRepository.find();

    const parties = [];
    for (const partyData of partiesData) {
      if (!partyData.caseId && cases.length > 0) {
        partyData.caseId = cases[Math.floor(Math.random() * cases.length)].id;
      }
      const party = this.partyRepository.create(partyData);
      parties.push(party);
    }

    await this.partyRepository.save(parties);
    this.logger.log(`Seeded ${parties.length} parties`);
  }

  /**
   * Seed motions
   */
  private async seedMotions(): Promise<void> {
    this.logger.log('Seeding motions...');

    const existingCount = await this.motionRepository.count();
    if (existingCount > 0) {
      this.logger.log(`Motions already exist (${existingCount}). Skipping seed.`);
      return;
    }

    const motionsPath = path.join(__dirname, '../test-data/motions.json');
    if (!fs.existsSync(motionsPath)) {
      this.logger.log('Motions data file not found. Skipping.');
      return;
    }

    const motionsData = JSON.parse(fs.readFileSync(motionsPath, 'utf8'));
    const cases = await this.caseRepository.find();

    const motions = [];
    for (const motionData of motionsData) {
      if (!motionData.caseId && cases.length > 0) {
        motionData.caseId = cases[Math.floor(Math.random() * cases.length)].id;
      }
      const motion = this.motionRepository.create(motionData);
      motions.push(motion);
    }

    await this.motionRepository.save(motions);
    this.logger.log(`Seeded ${motions.length} motions`);
  }

  /**
   * Seed additional data from JSON files
   */
  private async seedAdditionalData(): Promise<void> {
    this.logger.log('Seeding additional test data...');

    const testDataDir = path.join(__dirname, '../test-data');
    const additionalFiles = [
      'docket-entries.json',
      'depositions.json',
      'discovery-requests.json',
      'notifications.json',
      'audit-logs.json',
    ];

    for (const filename of additionalFiles) {
      const filePath = path.join(testDataDir, filename);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        this.logger.log(`Loaded ${data.length} records from ${filename}`);
      }
    }
  }

  /**
   * Clear all seeded data
   */
  async clearAll(): Promise<void> {
    this.logger.log('Clearing all seeded data...');

    // Clear in reverse dependency order
    await this.billingSeeder.clear();
    await this.documentSeeder.clear();
    await this.motionRepository.clear();
    await this.partyRepository.clear();
    await this.caseSeeder.clear();
    await this.clientRepository.clear();
    await this.userSeeder.clear();
    await this.organizationRepository.clear();

    this.logger.log('All seeded data cleared');
  }

  /**
   * Log seeding statistics
   */
  private async logSeedingStatistics(): Promise<void> {
    this.logger.log('-'.repeat(80));
    this.logger.log('Seeding Statistics:');
    this.logger.log(`  Organizations: ${await this.organizationRepository.count()}`);
    this.logger.log(`  Users: ${await this.userRepository.count()}`);
    this.logger.log(`  Clients: ${await this.clientRepository.count()}`);
    this.logger.log(`  Cases: ${await this.caseRepository.count()}`);
    this.logger.log(`  Documents: ${await this.documentRepository.count()}`);
    this.logger.log(`  Parties: ${await this.partyRepository.count()}`);
    this.logger.log(`  Motions: ${await this.motionRepository.count()}`);
    this.logger.log('-'.repeat(80));
  }
}
