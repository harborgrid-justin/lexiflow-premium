import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscoveryProject } from './entities/discovery-project.entity';
import { ReviewDocument } from './entities/review-document.entity';
import { Custodian } from './custodians/entities/custodian.entity';

export interface CollectionSource {
  sourceId: string;
  sourceName: string;
  sourceType: 'email' | 'file_share' | 'database' | 'cloud_storage' | 'mobile' | 'archive' | 'other';
  location: string;
  credentials?: Record<string, unknown>;
  filters?: {
    dateRange?: { start: Date; end: Date };
    fileTypes?: string[];
    keywords?: string[];
    custodians?: string[];
  };
}

export interface CollectionJob {
  jobId: string;
  projectId: string;
  source: CollectionSource;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  itemsCollected: number;
  totalSize: number;
  errors: Array<{ timestamp: Date; error: string }>;
}

@Injectable()
export class CollectionService {
  private readonly logger = new Logger(CollectionService.name);

  constructor(
    @InjectRepository(DiscoveryProject)
    private readonly projectRepository: Repository<DiscoveryProject>,
    @InjectRepository(ReviewDocument)
    private readonly documentRepository: Repository<ReviewDocument>,
    @InjectRepository(Custodian)
    private readonly custodianRepository: Repository<Custodian>,
  ) {}

  /**
   * Initialize data collection for a discovery project
   */
  async initializeCollection(
    projectId: string,
    sources: CollectionSource[],
    userId: string,
  ): Promise<CollectionJob[]> {
    this.logger.log(`Initializing collection for project ${projectId}`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Discovery project ${projectId} not found`);
    }

    const jobs: CollectionJob[] = sources.map((source) => ({
      jobId: this.generateJobId(),
      projectId,
      source,
      status: 'pending',
      itemsCollected: 0,
      totalSize: 0,
      errors: [],
    }));

    // Update project status
    project.status = 'collection';
    project.collectionStartDate = new Date();
    project.dataSources = sources.map((s) => ({
      sourceId: s.sourceId,
      sourceName: s.sourceName,
      sourceType: s.sourceType,
      location: s.location,
      status: 'pending',
    }));
    project.updatedBy = userId;
    await this.projectRepository.save(project);

    return jobs;
  }

  /**
   * Collect data from email sources (Exchange, Gmail, IMAP, etc.)
   */
  async collectEmailData(
    job: CollectionJob,
    userId: string,
  ): Promise<CollectionJob> {
    this.logger.log(`Collecting email data for job ${job.jobId}`);

    job.status = 'running';
    job.startTime = new Date();

    try {
      // In a real implementation, this would:
      // 1. Connect to email server using credentials
      // 2. Apply filters (date range, custodians, keywords)
      // 3. Download emails and attachments
      // 4. Extract metadata
      // 5. Calculate hashes
      // 6. Store in document repository

      // Simulated collection
      const mockDocuments = await this.simulateEmailCollection(job);

      job.itemsCollected = mockDocuments.length;
      job.totalSize = mockDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
      job.status = 'completed';
      job.endTime = new Date();

      // Update project statistics
      await this.updateProjectStats(job.projectId, userId);

      return job;
    } catch (error) {
      this.logger.error(`Collection job ${job.jobId} failed:`, error);
      job.status = 'failed';
      job.errors.push({
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      job.endTime = new Date();
      return job;
    }
  }

  /**
   * Collect data from file shares (network drives, SharePoint, etc.)
   */
  async collectFileShareData(
    job: CollectionJob,
    userId: string,
  ): Promise<CollectionJob> {
    this.logger.log(`Collecting file share data for job ${job.jobId}`);

    job.status = 'running';
    job.startTime = new Date();

    try {
      // In a real implementation, this would:
      // 1. Connect to file share
      // 2. Scan directories based on filters
      // 3. Copy files preserving metadata
      // 4. Calculate hashes
      // 5. Extract metadata from files
      // 6. Store in document repository

      const mockDocuments = await this.simulateFileShareCollection(job);

      job.itemsCollected = mockDocuments.length;
      job.totalSize = mockDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
      job.status = 'completed';
      job.endTime = new Date();

      await this.updateProjectStats(job.projectId, userId);

      return job;
    } catch (error) {
      this.logger.error(`Collection job ${job.jobId} failed:`, error);
      job.status = 'failed';
      job.errors.push({
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      job.endTime = new Date();
      return job;
    }
  }

  /**
   * Collect data from cloud storage (Google Drive, OneDrive, Dropbox, etc.)
   */
  async collectCloudStorageData(
    job: CollectionJob,
    userId: string,
  ): Promise<CollectionJob> {
    this.logger.log(`Collecting cloud storage data for job ${job.jobId}`);

    job.status = 'running';
    job.startTime = new Date();

    try {
      // In a real implementation, this would:
      // 1. Authenticate with cloud provider API
      // 2. Query files based on filters
      // 3. Download files and metadata
      // 4. Handle versioning
      // 5. Store in document repository

      const mockDocuments = await this.simulateCloudStorageCollection(job);

      job.itemsCollected = mockDocuments.length;
      job.totalSize = mockDocuments.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);
      job.status = 'completed';
      job.endTime = new Date();

      await this.updateProjectStats(job.projectId, userId);

      return job;
    } catch (error) {
      this.logger.error(`Collection job ${job.jobId} failed:`, error);
      job.status = 'failed';
      job.errors.push({
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      job.endTime = new Date();
      return job;
    }
  }

  /**
   * Get collection statistics for a project
   */
  async getCollectionStats(projectId: string): Promise<{
    totalItems: number;
    totalSize: number;
    custodianBreakdown: Array<{ custodian: string; count: number; size: number }>;
    fileTypeBreakdown: Array<{ fileType: string; count: number; size: number }>;
    dateRangeBreakdown: Array<{ period: string; count: number }>;
  }> {
    const documents = await this.documentRepository.find({
      where: { projectId },
    });

    const totalItems = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

    // Custodian breakdown
    const custodianMap = new Map<string, { count: number; size: number }>();
    documents.forEach((doc) => {
      const custodian = doc.custodian || 'Unknown';
      const current = custodianMap.get(custodian) || { count: 0, size: 0 };
      custodianMap.set(custodian, {
        count: current.count + 1,
        size: current.size + (doc.fileSize || 0),
      });
    });

    // File type breakdown
    const fileTypeMap = new Map<string, { count: number; size: number }>();
    documents.forEach((doc) => {
      const fileType = doc.fileType || 'Unknown';
      const current = fileTypeMap.get(fileType) || { count: 0, size: 0 };
      fileTypeMap.set(fileType, {
        count: current.count + 1,
        size: current.size + (doc.fileSize || 0),
      });
    });

    return {
      totalItems,
      totalSize,
      custodianBreakdown: Array.from(custodianMap.entries()).map(([custodian, stats]) => ({
        custodian,
        ...stats,
      })),
      fileTypeBreakdown: Array.from(fileTypeMap.entries()).map(([fileType, stats]) => ({
        fileType,
        ...stats,
      })),
      dateRangeBreakdown: [], // Would implement date grouping logic
    };
  }

  /**
   * Verify collection integrity
   */
  async verifyCollectionIntegrity(projectId: string): Promise<{
    totalDocuments: number;
    documentsWithHashes: number;
    duplicateHashes: number;
    missingFiles: number;
    corruptedFiles: number;
    issues: Array<{ documentId: string; issue: string }>;
  }> {
    const documents = await this.documentRepository.find({
      where: { projectId },
    });

    const hashSet = new Set<string>();
    let duplicateHashes = 0;
    let documentsWithHashes = 0;
    const issues: Array<{ documentId: string; issue: string }> = [];

    documents.forEach((doc) => {
      if (doc.md5Hash) {
        documentsWithHashes++;
        if (hashSet.has(doc.md5Hash)) {
          duplicateHashes++;
          issues.push({
            documentId: doc.id,
            issue: `Duplicate hash: ${doc.md5Hash}`,
          });
        } else {
          hashSet.add(doc.md5Hash);
        }
      } else {
        issues.push({
          documentId: doc.id,
          issue: 'Missing hash',
        });
      }
    });

    return {
      totalDocuments: documents.length,
      documentsWithHashes,
      duplicateHashes,
      missingFiles: 0, // Would implement file system check
      corruptedFiles: 0, // Would implement hash verification
      issues,
    };
  }

  // Helper methods

  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private async updateProjectStats(projectId: string, userId: string): Promise<void> {
    const documents = await this.documentRepository.find({
      where: { projectId },
    });

    const totalItems = documents.length;
    const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

    await this.projectRepository.update(projectId, {
      totalItemsCollected: totalItems,
      totalSizeBytes: totalSize,
      updatedBy: userId,
    });
  }

  private async simulateEmailCollection(job: CollectionJob): Promise<ReviewDocument[]> {
    // Simulate email collection - in production this would connect to real email sources
    const mockCount = Math.floor(Math.random() * 100) + 50;
    return Array.from({ length: mockCount }, (_, i) => ({
      projectId: job.projectId,
      fileName: `email_${i + 1}.eml`,
      fileType: 'email',
      fileSize: Math.floor(Math.random() * 1000000) + 10000,
      custodian: job.source.filters?.custodians?.[0] || 'Unknown',
      documentDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    })) as any;
  }

  private async simulateFileShareCollection(job: CollectionJob): Promise<ReviewDocument[]> {
    // Simulate file share collection
    const mockCount = Math.floor(Math.random() * 200) + 100;
    return Array.from({ length: mockCount }, (_, i) => ({
      projectId: job.projectId,
      fileName: `document_${i + 1}.pdf`,
      fileType: 'pdf',
      fileSize: Math.floor(Math.random() * 5000000) + 50000,
      custodian: job.source.filters?.custodians?.[0] || 'Unknown',
      documentDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    })) as any;
  }

  private async simulateCloudStorageCollection(job: CollectionJob): Promise<ReviewDocument[]> {
    // Simulate cloud storage collection
    const mockCount = Math.floor(Math.random() * 150) + 75;
    return Array.from({ length: mockCount }, (_, i) => ({
      projectId: job.projectId,
      fileName: `cloud_doc_${i + 1}.docx`,
      fileType: 'docx',
      fileSize: Math.floor(Math.random() * 2000000) + 20000,
      custodian: job.source.filters?.custodians?.[0] || 'Unknown',
      documentDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    })) as any;
  }
}
