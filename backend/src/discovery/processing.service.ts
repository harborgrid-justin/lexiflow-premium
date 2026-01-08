import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscoveryProject } from './entities/discovery-project.entity';
import { ReviewDocument } from './entities/review-document.entity';

export interface ProcessingOptions {
  deduplication: boolean;
  deduplicationMethod: 'md5' | 'sha256' | 'fuzzy' | 'near_duplicate';
  emailThreading: boolean;
  languageDetection: boolean;
  textExtraction: boolean;
  metadataExtraction: boolean;
  virusScanning: boolean;
  fileTypeIdentification: boolean;
}

export interface ProcessingJob {
  jobId: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  documentsProcessed: number;
  duplicatesFound: number;
  errors: Array<{ documentId: string; error: string }>;
}

export interface DuplicateGroup {
  groupId: string;
  hash: string;
  documents: Array<{
    documentId: string;
    batesNumber: string;
    fileName: string;
    custodian: string;
  }>;
  custodian: string; // Primary custodian
}

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @InjectRepository(DiscoveryProject)
    private readonly projectRepository: Repository<DiscoveryProject>,
    @InjectRepository(ReviewDocument)
    private readonly documentRepository: Repository<ReviewDocument>,
  ) {}

  /**
   * Start processing workflow for collected documents
   */
  async startProcessing(
    projectId: string,
    options: ProcessingOptions,
    userId: string,
  ): Promise<ProcessingJob> {
    this.logger.log(`Starting processing for project ${projectId}`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Discovery project ${projectId} not found`);
    }

    const job: ProcessingJob = {
      jobId: this.generateJobId(),
      projectId,
      status: 'pending',
      documentsProcessed: 0,
      duplicatesFound: 0,
      errors: [],
    };

    // Update project status
    project.status = 'processing';
    project.processingStartDate = new Date();
    project.updatedBy = userId;
    await this.projectRepository.save(project);

    // Start async processing
    this.processDocumentsAsync(job, options, userId).catch((error) => {
      this.logger.error(`Processing job ${job.jobId} failed:`, error);
    });

    return job;
  }

  /**
   * Perform deduplication on documents
   */
  async deduplicateDocuments(
    projectId: string,
    method: 'md5' | 'sha256' | 'fuzzy' | 'near_duplicate' = 'md5',
    userId: string,
  ): Promise<{
    totalDocuments: number;
    uniqueDocuments: number;
    duplicateDocuments: number;
    duplicateGroups: DuplicateGroup[];
  }> {
    this.logger.log(`Deduplicating documents for project ${projectId} using ${method}`);

    const documents = await this.documentRepository.find({
      where: { projectId },
    });

    const hashMap = new Map<string, ReviewDocument[]>();
    const duplicateGroups: DuplicateGroup[] = [];

    // Group documents by hash
    documents.forEach((doc) => {
      const hash = method === 'sha256' ? doc.sha256Hash : doc.md5Hash;
      if (!hash) return;

      const group = hashMap.get(hash) || [];
      group.push(doc);
      hashMap.set(hash, group);
    });

    // Identify duplicates and mark them
    let duplicateCount = 0;
    for (const [hash, group] of hashMap.entries()) {
      if (group.length > 1) {
        const groupId = this.generateGroupId();

        // Keep the first document as original, mark others as duplicates
        for (let i = 1; i < group.length; i++) {
          await this.documentRepository.update(group[i].id, {
            isDuplicate: true,
            duplicateGroupId: groupId,
            parentDocumentId: group[0].id,
            updatedBy: userId,
          });
          duplicateCount++;
        }

        // Update the original document with duplicate group ID
        await this.documentRepository.update(group[0].id, {
          duplicateGroupId: groupId,
          updatedBy: userId,
        });

        duplicateGroups.push({
          groupId,
          hash,
          documents: group.map((doc) => ({
            documentId: doc.id,
            batesNumber: doc.batesNumber,
            fileName: doc.fileName || '',
            custodian: doc.custodian || '',
          })),
          custodian: group[0].custodian || '',
        });
      }
    }

    // Update project deduplication rate
    const deduplicationRate = (duplicateCount / documents.length) * 100;
    await this.projectRepository.update(projectId, {
      deduplicationRate,
      totalItemsProcessed: documents.length,
      updatedBy: userId,
    });

    return {
      totalDocuments: documents.length,
      uniqueDocuments: documents.length - duplicateCount,
      duplicateDocuments: duplicateCount,
      duplicateGroups,
    };
  }

  /**
   * Extract text from documents
   */
  async extractText(
    projectId: string,
    documentIds?: string[],
    userId?: string,
  ): Promise<{
    documentsProcessed: number;
    successCount: number;
    failureCount: number;
  }> {
    this.logger.log(`Extracting text for project ${projectId}`);

    const whereClause: any = { projectId };
    if (documentIds && documentIds.length > 0) {
      whereClause.id = documentIds;
    }

    const documents = await this.documentRepository.find({
      where: whereClause,
    });

    let successCount = 0;
    let failureCount = 0;

    for (const doc of documents) {
      try {
        // In a real implementation, this would:
        // 1. Use OCR for images/scanned PDFs
        // 2. Extract text from native files (PDF, Word, Excel, etc.)
        // 3. Parse emails and extract content
        // 4. Handle special formats

        const extractedText = await this.simulateTextExtraction(doc);

        await this.documentRepository.update(doc.id, {
          extractedText,
          updatedBy: userId,
        });

        successCount++;
      } catch (error) {
        this.logger.error(`Failed to extract text from document ${doc.id}:`, error);
        failureCount++;
      }
    }

    return {
      documentsProcessed: documents.length,
      successCount,
      failureCount,
    };
  }

  /**
   * Filter documents based on criteria
   */
  async filterDocuments(
    projectId: string,
    filters: {
      dateRange?: { start: Date; end: Date };
      fileTypes?: string[];
      custodians?: string[];
      keywords?: string[];
      minFileSize?: number;
      maxFileSize?: number;
    },
  ): Promise<ReviewDocument[]> {
    this.logger.log(`Filtering documents for project ${projectId}`);

    const queryBuilder = this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.projectId = :projectId', { projectId });

    if (filters.dateRange) {
      queryBuilder.andWhere(
        'doc.documentDate BETWEEN :startDate AND :endDate',
        {
          startDate: filters.dateRange.start,
          endDate: filters.dateRange.end,
        },
      );
    }

    if (filters.fileTypes && filters.fileTypes.length > 0) {
      queryBuilder.andWhere('doc.fileType IN (:...fileTypes)', {
        fileTypes: filters.fileTypes,
      });
    }

    if (filters.custodians && filters.custodians.length > 0) {
      queryBuilder.andWhere('doc.custodian IN (:...custodians)', {
        custodians: filters.custodians,
      });
    }

    if (filters.keywords && filters.keywords.length > 0) {
      const keywordConditions = filters.keywords.map(
        (_, index) => `doc.extractedText ILIKE :keyword${index}`,
      );
      queryBuilder.andWhere(`(${keywordConditions.join(' OR ')})`,
        filters.keywords.reduce((acc, keyword, index) => {
          acc[`keyword${index}`] = `%${keyword}%`;
          return acc;
        }, {} as Record<string, string>),
      );
    }

    if (filters.minFileSize) {
      queryBuilder.andWhere('doc.fileSize >= :minFileSize', {
        minFileSize: filters.minFileSize,
      });
    }

    if (filters.maxFileSize) {
      queryBuilder.andWhere('doc.fileSize <= :maxFileSize', {
        maxFileSize: filters.maxFileSize,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * Perform email threading
   */
  async threadEmails(
    projectId: string,
    userId: string,
  ): Promise<{
    totalEmails: number;
    threadsCreated: number;
    orphanedEmails: number;
  }> {
    this.logger.log(`Threading emails for project ${projectId}`);

    const emails = await this.documentRepository.find({
      where: { projectId, fileType: 'email' },
    });

    // In a real implementation, this would:
    // 1. Parse email headers (Message-ID, In-Reply-To, References)
    // 2. Group emails into conversation threads
    // 3. Identify thread parents and children
    // 4. Update document relationships

    // Simulated threading
    const threadsCreated = Math.floor(emails.length * 0.7);
    const orphanedEmails = emails.length - threadsCreated;

    return {
      totalEmails: emails.length,
      threadsCreated,
      orphanedEmails,
    };
  }

  /**
   * Identify file types
   */
  async identifyFileTypes(
    projectId: string,
    userId: string,
  ): Promise<{
    documentsProcessed: number;
    fileTypeStats: Record<string, number>;
  }> {
    this.logger.log(`Identifying file types for project ${projectId}`);

    const documents = await this.documentRepository.find({
      where: { projectId },
    });

    const fileTypeStats: Record<string, number> = {};

    for (const doc of documents) {
      // In a real implementation, this would:
      // 1. Read file signatures (magic numbers)
      // 2. Verify file extensions match actual content
      // 3. Detect potential file type mismatches

      const fileType = doc.fileType || this.detectFileType(doc.fileName || '');

      if (!doc.fileType) {
        await this.documentRepository.update(doc.id, {
          fileType,
          updatedBy: userId,
        });
      }

      fileTypeStats[fileType] = (fileTypeStats[fileType] || 0) + 1;
    }

    return {
      documentsProcessed: documents.length,
      fileTypeStats,
    };
  }

  // Helper methods

  private async processDocumentsAsync(
    job: ProcessingJob,
    options: ProcessingOptions,
    userId: string,
  ): Promise<void> {
    job.status = 'running';
    job.startTime = new Date();

    try {
      // File type identification
      if (options.fileTypeIdentification) {
        await this.identifyFileTypes(job.projectId, userId);
      }

      // Deduplication
      if (options.deduplication) {
        await this.deduplicateDocuments(
          job.projectId,
          options.deduplicationMethod,
          userId,
        );
      }

      // Text extraction
      if (options.textExtraction) {
        await this.extractText(job.projectId, undefined, userId);
      }

      // Email threading
      if (options.emailThreading) {
        await this.threadEmails(job.projectId, userId);
      }

      job.status = 'completed';
      job.endTime = new Date();

      // Update project
      await this.projectRepository.update(job.projectId, {
        status: 'review',
        processingEndDate: new Date(),
        updatedBy: userId,
      });
    } catch (error) {
      this.logger.error(`Processing failed:`, error);
      job.status = 'failed';
      job.endTime = new Date();
    }
  }

  private generateJobId(): string {
    return `proc_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private generateGroupId(): string {
    return `grp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private async simulateTextExtraction(doc: ReviewDocument): Promise<string> {
    // Simulate text extraction
    return `Extracted text from ${doc.fileName}. This would contain the actual document text in production.`;
  }

  private detectFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      pdf: 'pdf',
      doc: 'doc',
      docx: 'docx',
      xls: 'xls',
      xlsx: 'xlsx',
      ppt: 'ppt',
      pptx: 'pptx',
      txt: 'txt',
      eml: 'email',
      msg: 'email',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      tiff: 'image',
      tif: 'image',
    };
    return typeMap[extension] || 'unknown';
  }
}
