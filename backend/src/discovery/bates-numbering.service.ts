import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscoveryProject } from './entities/discovery-project.entity';
import { ReviewDocument } from './entities/review-document.entity';
import { Production } from './productions/entities/production.entity';

export interface BatesNumberingOptions {
  prefix: string;
  startNumber: number;
  numberLength: number; // Total digits (e.g., 7 for "0000001")
  suffix?: string;
  includePageNumbers: boolean;
}

export interface BatesRange {
  start: string;
  end: string;
  documentCount: number;
  pageCount: number;
}

export interface BatesNumberingJob {
  jobId: string;
  projectId: string;
  productionId?: string;
  options: BatesNumberingOptions;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  documentsNumbered: number;
  totalDocuments: number;
  batesRange?: BatesRange;
  errors: Array<{ documentId: string; error: string }>;
}

@Injectable()
export class BatesNumberingService {
  private readonly logger = new Logger(BatesNumberingService.name);

  constructor(
    @InjectRepository(DiscoveryProject)
    private readonly projectRepository: Repository<DiscoveryProject>,
    @InjectRepository(ReviewDocument)
    private readonly documentRepository: Repository<ReviewDocument>,
    @InjectRepository(Production)
    private readonly productionRepository: Repository<Production>,
  ) {}

  /**
   * Apply Bates numbering to documents
   */
  async applyBatesNumbering(
    projectId: string,
    documentIds: string[],
    options: BatesNumberingOptions,
    productionId?: string,
    userId?: string,
  ): Promise<BatesNumberingJob> {
    this.logger.log(`Applying Bates numbering to ${documentIds.length} documents`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Discovery project ${projectId} not found`);
    }

    // Validate options
    this.validateBatesOptions(options);

    const job: BatesNumberingJob = {
      jobId: this.generateJobId(),
      projectId,
      productionId,
      options,
      status: 'pending',
      documentsNumbered: 0,
      totalDocuments: documentIds.length,
      errors: [],
    };

    // Start async numbering
    this.numberDocumentsAsync(job, documentIds, userId).catch((error) => {
      this.logger.error(`Bates numbering job ${job.jobId} failed:`, error);
    });

    return job;
  }

  /**
   * Generate Bates numbers for a production set
   */
  async numberProductionSet(
    productionId: string,
    options: BatesNumberingOptions,
    userId?: string,
  ): Promise<BatesNumberingJob> {
    this.logger.log(`Numbering production set ${productionId}`);

    const production = await this.productionRepository.findOne({
      where: { id: productionId },
    });

    if (!production) {
      throw new NotFoundException(`Production ${productionId} not found`);
    }

    // Get documents for production (would typically be based on search criteria)
    const documents = await this.documentRepository.find({
      where: {
        projectId: production.caseId, // Note: using caseId as projectId
        responsivenessCode: 'responsive' as any,
        privilegeCode: 'none' as any,
      },
      order: { documentDate: 'ASC', createdAt: 'ASC' },
    });

    const documentIds = documents.map((doc) => doc.id);

    return this.applyBatesNumbering(
      production.caseId,
      documentIds,
      options,
      productionId,
      userId,
    );
  }

  /**
   * Generate Bates number
   */
  generateBatesNumber(
    prefix: string,
    number: number,
    length: number,
    suffix?: string,
    pageNumber?: number,
  ): string {
    const paddedNumber = number.toString().padStart(length, '0');
    let batesNumber = `${prefix}${paddedNumber}`;

    if (suffix) {
      batesNumber += suffix;
    }

    if (pageNumber !== undefined) {
      const paddedPage = pageNumber.toString().padStart(4, '0');
      batesNumber += `.${paddedPage}`;
    }

    return batesNumber;
  }

  /**
   * Parse Bates number to extract components
   */
  parseBatesNumber(batesNumber: string): {
    prefix: string;
    number: number;
    suffix?: string;
    pageNumber?: number;
  } | null {
    // Example formats:
    // ABC0001234
    // ABC0001234-XYZ
    // ABC0001234.0001

    const match = batesNumber.match(/^([A-Z]+)(\d+)(?:([A-Z]+))?(?:\.(\d+))?$/);

    if (!match) {
      return null;
    }

    return {
      prefix: match[1],
      number: parseInt(match[2], 10),
      suffix: match[3],
      pageNumber: match[4] ? parseInt(match[4], 10) : undefined,
    };
  }

  /**
   * Validate Bates number sequence
   */
  async validateBatesSequence(
    projectId: string,
  ): Promise<{
    isValid: boolean;
    gaps: Array<{ expectedBates: string; missingBates: string }>;
    duplicates: Array<{ batesNumber: string; documentIds: string[] }>;
    invalidNumbers: Array<{ documentId: string; batesNumber: string; reason: string }>;
  }> {
    this.logger.log(`Validating Bates sequence for project ${projectId}`);

    const documents = await this.documentRepository.find({
      where: { projectId },
      order: { batesNumber: 'ASC' },
    });

    const gaps: Array<{ expectedBates: string; missingBates: string }> = [];
    const duplicates: Array<{ batesNumber: string; documentIds: string[] }> = [];
    const invalidNumbers: Array<{ documentId: string; batesNumber: string; reason: string }> =
      [];

    // Check for duplicates
    const batesMap = new Map<string, string[]>();
    documents.forEach((doc) => {
      if (doc.batesNumber) {
        const ids = batesMap.get(doc.batesNumber) || [];
        ids.push(doc.id);
        batesMap.set(doc.batesNumber, ids);
      }
    });

    batesMap.forEach((ids, batesNumber) => {
      if (ids.length > 1) {
        duplicates.push({ batesNumber, documentIds: ids });
      }
    });

    // Check for gaps and invalid numbers
    for (let i = 0; i < documents.length - 1; i++) {
      const current = documents[i];
      const next = documents[i + 1];

      if (!current.batesNumber || !next.batesNumber) continue;

      const currentParsed = this.parseBatesNumber(current.batesNumber);
      const nextParsed = this.parseBatesNumber(next.batesNumber);

      if (!currentParsed) {
        invalidNumbers.push({
          documentId: current.id,
          batesNumber: current.batesNumber,
          reason: 'Invalid format',
        });
        continue;
      }

      if (!nextParsed) {
        invalidNumbers.push({
          documentId: next.id,
          batesNumber: next.batesNumber,
          reason: 'Invalid format',
        });
        continue;
      }

      // Check for gaps in sequence
      if (
        currentParsed.prefix === nextParsed.prefix &&
        nextParsed.number - currentParsed.number > 1
      ) {
        const expectedNumber = currentParsed.number + 1;
        const expectedBates = this.generateBatesNumber(
          currentParsed.prefix,
          expectedNumber,
          nextParsed.number.toString().length,
          currentParsed.suffix,
        );

        gaps.push({
          expectedBates,
          missingBates: `${expectedBates} to ${this.generateBatesNumber(
            currentParsed.prefix,
            nextParsed.number - 1,
            nextParsed.number.toString().length,
            currentParsed.suffix,
          )}`,
        });
      }
    }

    return {
      isValid: gaps.length === 0 && duplicates.length === 0 && invalidNumbers.length === 0,
      gaps,
      duplicates,
      invalidNumbers,
    };
  }

  /**
   * Get Bates range for a set of documents
   */
  async getBatesRange(documentIds: string[]): Promise<BatesRange | null> {
    const documents = await this.documentRepository.find({
      where: { id: documentIds as any },
      order: { batesNumber: 'ASC' },
    });

    const documentsWithBates = documents.filter((doc) => doc.batesNumber);

    if (documentsWithBates.length === 0) {
      return null;
    }

    const firstDoc = documentsWithBates[0];
    const lastDoc = documentsWithBates[documentsWithBates.length - 1];

    const totalPages = documents.reduce((sum, doc) => sum + (doc.pageCount || 0), 0);

    return {
      start: firstDoc.batesNumber,
      end: lastDoc.batesNumber,
      documentCount: documentsWithBates.length,
      pageCount: totalPages,
    };
  }

  /**
   * Re-number documents (update existing Bates numbers)
   */
  async renumberDocuments(
    documentIds: string[],
    newOptions: BatesNumberingOptions,
    userId?: string,
  ): Promise<BatesNumberingJob> {
    this.logger.log(`Re-numbering ${documentIds.length} documents`);

    // Get first document to determine project
    const firstDoc = await this.documentRepository.findOne({
      where: { id: documentIds[0] },
    });

    if (!firstDoc) {
      throw new NotFoundException('Documents not found');
    }

    return this.applyBatesNumbering(
      firstDoc.projectId,
      documentIds,
      newOptions,
      undefined,
      userId,
    );
  }

  /**
   * Export Bates number register
   */
  async exportBatesRegister(
    projectId: string,
    productionId?: string,
  ): Promise<Array<{
    batesNumber: string;
    fileName: string;
    custodian: string;
    documentDate: Date;
    pageCount: number;
    privilegeCode: string;
  }>> {
    this.logger.log(`Exporting Bates register for project ${projectId}`);

    const whereClause: any = { projectId };
    if (productionId) {
      // Would filter by production set
    }

    const documents = await this.documentRepository.find({
      where: whereClause,
      order: { batesNumber: 'ASC' },
    });

    return documents
      .filter((doc) => doc.batesNumber)
      .map((doc) => ({
        batesNumber: doc.batesNumber,
        fileName: doc.fileName || '',
        custodian: doc.custodian || '',
        documentDate: doc.documentDate,
        pageCount: doc.pageCount || 0,
        privilegeCode: doc.privilegeCode,
      }));
  }

  // Helper methods

  private async numberDocumentsAsync(
    job: BatesNumberingJob,
    documentIds: string[],
    userId?: string,
  ): Promise<void> {
    job.status = 'running';
    job.startTime = new Date();

    try {
      // Get documents in order
      const documents = await this.documentRepository.find({
        where: { id: documentIds as any },
        order: { documentDate: 'ASC', createdAt: 'ASC' },
      });

      let currentNumber = job.options.startNumber;
      const batesNumbers: string[] = [];

      for (const doc of documents) {
        try {
          let batesStart: string;
          let batesEnd: string;

          if (job.options.includePageNumbers && doc.pageCount) {
            // Number each page
            batesStart = this.generateBatesNumber(
              job.options.prefix,
              currentNumber,
              job.options.numberLength,
              job.options.suffix,
              1,
            );

            batesEnd = this.generateBatesNumber(
              job.options.prefix,
              currentNumber,
              job.options.numberLength,
              job.options.suffix,
              doc.pageCount,
            );

            currentNumber++;
          } else {
            // Number document only
            const batesNumber = this.generateBatesNumber(
              job.options.prefix,
              currentNumber,
              job.options.numberLength,
              job.options.suffix,
            );

            batesStart = batesNumber;
            batesEnd = batesNumber;
            currentNumber++;
          }

          batesNumbers.push(batesStart);

          // Update document
          await this.documentRepository.update(doc.id, {
            batesNumber: batesStart,
            batesRangeStart: batesStart,
            batesRangeEnd: batesEnd,
            updatedBy: userId,
          });

          job.documentsNumbered++;
        } catch (error) {
          this.logger.error(`Failed to number document ${doc.id}:`, error);
          job.errors.push({
            documentId: doc.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Set Bates range
      if (batesNumbers.length > 0) {
        job.batesRange = {
          start: batesNumbers[0],
          end: batesNumbers[batesNumbers.length - 1],
          documentCount: job.documentsNumbered,
          pageCount: documents.reduce((sum, doc) => sum + (doc.pageCount || 0), 0),
        };
      }

      // Update production if applicable
      if (job.productionId && job.batesRange) {
        await this.productionRepository.update(job.productionId, {
          batesPrefix: job.options.prefix,
          batesStart: job.options.startNumber,
          batesEnd: currentNumber - 1,
          totalDocuments: job.documentsNumbered,
          updatedBy: userId,
        });
      }

      job.status = 'completed';
      job.endTime = new Date();
    } catch (error) {
      this.logger.error(`Bates numbering job failed:`, error);
      job.status = 'failed';
      job.endTime = new Date();
    }
  }

  private validateBatesOptions(options: BatesNumberingOptions): void {
    if (!options.prefix || options.prefix.length === 0) {
      throw new BadRequestException('Bates prefix is required');
    }

    if (!/^[A-Z]+$/.test(options.prefix)) {
      throw new BadRequestException('Bates prefix must contain only uppercase letters');
    }

    if (options.startNumber < 0) {
      throw new BadRequestException('Start number must be non-negative');
    }

    if (options.numberLength < 4 || options.numberLength > 10) {
      throw new BadRequestException('Number length must be between 4 and 10 digits');
    }

    if (options.suffix && !/^[A-Z]+$/.test(options.suffix)) {
      throw new BadRequestException('Bates suffix must contain only uppercase letters');
    }
  }

  private generateJobId(): string {
    return `bates_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
