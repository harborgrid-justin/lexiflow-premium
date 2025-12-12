import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../../documents/entities/document.entity';
import { Case } from '../../../cases/entities/case.entity';
import { User } from '../../../entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentSeeder {
  private readonly logger = new Logger(DocumentSeeder.name);

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting document seeding...');

    try {
      // Check if documents already exist
      const existingCount = await this.documentRepository.count();
      if (existingCount > 0) {
        this.logger.log(`Documents already exist (${existingCount}). Skipping seed.`);
        return;
      }

      // Load test data
      const documentsPath = path.join(__dirname, '../test-data/documents.json');
      const documentsData = JSON.parse(fs.readFileSync(documentsPath, 'utf8'));

      // Get cases and users for relationships
      const cases = await this.caseRepository.find();
      const users = await this.userRepository.find();

      // Create documents
      const documents = [];
      for (const docData of documentsData) {
        // Assign random case if not specified
        if (!docData.caseId && cases.length > 0) {
          const randomCase = cases[Math.floor(Math.random() * cases.length)];
          docData.caseId = randomCase.id;
        }

        // Assign random creator if not specified
        if (!docData.createdBy && users.length > 0) {
          const randomUser = users[Math.floor(Math.random() * users.length)];
          docData.createdBy = randomUser.id;
        }

        const document = this.documentRepository.create(docData);
        documents.push(document);
      }

      // Save in batches
      const batchSize = 100;
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        await this.documentRepository.save(batch);
        this.logger.log(`Saved documents batch ${i / batchSize + 1}`);
      }

      this.logger.log(`Successfully seeded ${documents.length} documents`);
    } catch (error) {
      this.logger.error(`Error seeding documents: ${error.message}`, error.stack);
      throw error;
    }
  }

  async clear(): Promise<void> {
    this.logger.log('Clearing documents...');
    await this.documentRepository.clear();
    this.logger.log('Documents cleared');
  }
}
