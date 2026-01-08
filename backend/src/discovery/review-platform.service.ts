import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscoveryProject } from './entities/discovery-project.entity';
import {
  ReviewDocument,
  ReviewStatus,
  ResponsivenessCode,
  PrivilegeCode,
  ConfidentialityLevel,
} from './entities/review-document.entity';

export interface ReviewAssignment {
  assignmentId: string;
  projectId: string;
  reviewerId: string;
  reviewerName: string;
  documentIds: string[];
  assignedDate: Date;
  dueDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  documentsReviewed: number;
  totalDocuments: number;
}

export interface CodingDecision {
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  responsivenessCode: ResponsivenessCode;
  privilegeCode: PrivilegeCode;
  confidentialityLevel: ConfidentialityLevel;
  issueTags: Array<{ issueId: string; issueName: string; relevance: string }>;
  tags: string[];
  hotDocument: boolean;
  redactionRequired: boolean;
  notes: string;
  reviewTimeSeconds: number;
}

export interface QCReview {
  documentId: string;
  originalReviewerId: string;
  qcReviewerId: string;
  qcReviewerName: string;
  originalDecision: CodingDecision;
  qcDecision: CodingDecision;
  disagreements: Array<{ field: string; originalValue: string; qcValue: string }>;
  qcApproved: boolean;
  qcNotes: string;
}

@Injectable()
export class ReviewPlatformService {
  private readonly logger = new Logger(ReviewPlatformService.name);

  constructor(
    @InjectRepository(DiscoveryProject)
    private readonly projectRepository: Repository<DiscoveryProject>,
    @InjectRepository(ReviewDocument)
    private readonly documentRepository: Repository<ReviewDocument>,
  ) {}

  /**
   * Assign documents to reviewers
   */
  async assignDocumentsToReviewer(
    projectId: string,
    reviewerId: string,
    reviewerName: string,
    documentCount: number,
    assignmentStrategy: 'sequential' | 'random' | 'priority' | 'tar_guided' = 'sequential',
    dueDate?: Date,
  ): Promise<ReviewAssignment> {
    this.logger.log(`Assigning ${documentCount} documents to reviewer ${reviewerId}`);

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Discovery project ${projectId} not found`);
    }

    // Get unassigned documents based on strategy
    let documents: ReviewDocument[];

    switch (assignmentStrategy) {
      case 'random':
        documents = await this.getRandomUnassignedDocuments(projectId, documentCount);
        break;
      case 'priority':
        documents = await this.getPriorityDocuments(projectId, documentCount);
        break;
      case 'tar_guided':
        documents = await this.getTARGuidedDocuments(projectId, documentCount);
        break;
      default:
        documents = await this.getSequentialDocuments(projectId, documentCount);
    }

    // Update documents with reviewer assignment
    const documentIds = documents.map((doc) => doc.id);
    await this.documentRepository.update(
      { id: documentIds as any },
      {
        reviewerId,
        reviewerName,
        reviewStatus: ReviewStatus.IN_PROGRESS,
      },
    );

    const assignment: ReviewAssignment = {
      assignmentId: this.generateAssignmentId(),
      projectId,
      reviewerId,
      reviewerName,
      documentIds,
      assignedDate: new Date(),
      dueDate,
      status: 'pending',
      documentsReviewed: 0,
      totalDocuments: documentIds.length,
    };

    return assignment;
  }

  /**
   * Apply coding decision to a document
   */
  async applyCodeing(
    decision: CodingDecision,
  ): Promise<ReviewDocument> {
    this.logger.log(`Applying coding decision to document ${decision.documentId}`);

    const document = await this.documentRepository.findOne({
      where: { id: decision.documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${decision.documentId} not found`);
    }

    // Update document with coding decision
    document.responsivenessCode = decision.responsivenessCode;
    document.privilegeCode = decision.privilegeCode;
    document.confidentialityLevel = decision.confidentialityLevel;
    document.issueTags = decision.issueTags;
    document.tags = decision.tags;
    document.hotDocument = decision.hotDocument;
    document.redactionRequired = decision.redactionRequired;
    document.reviewerNotes = decision.notes;
    document.reviewDate = new Date();
    document.reviewTimeSeconds = decision.reviewTimeSeconds;
    document.reviewStatus = ReviewStatus.REVIEWED;

    const saved = await this.documentRepository.save(document);

    // Update project statistics
    await this.updateProjectReviewStats(document.projectId);

    return saved;
  }

  /**
   * Batch apply coding decisions
   */
  async batchApplyCoding(
    decisions: CodingDecision[],
  ): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
    this.logger.log(`Applying ${decisions.length} coding decisions`);

    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const decision of decisions) {
      try {
        await this.applyCodeing(decision);
        successCount++;
      } catch (error) {
        failureCount++;
        errors.push(
          `Failed to code document ${decision.documentId}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      }
    }

    return { successCount, failureCount, errors };
  }

  /**
   * Perform QC review on a document
   */
  async performQCReview(qcReview: QCReview): Promise<ReviewDocument> {
    this.logger.log(`Performing QC review on document ${qcReview.documentId}`);

    const document = await this.documentRepository.findOne({
      where: { id: qcReview.documentId },
    });

    if (!document) {
      throw new NotFoundException(`Document ${qcReview.documentId} not found`);
    }

    // Apply QC decision
    if (qcReview.qcApproved) {
      // QC approved - keep original coding or apply QC modifications
      document.qcReviewerId = qcReview.qcReviewerId;
      document.qcReviewerName = qcReview.qcReviewerName;
      document.qcReviewDate = new Date();
      document.qcNotes = qcReview.qcNotes;
      document.qcApproved = true;
      document.reviewStatus = ReviewStatus.QC_COMPLETE;

      // Apply QC corrections if any
      if (qcReview.disagreements.length > 0) {
        document.responsivenessCode = qcReview.qcDecision.responsivenessCode;
        document.privilegeCode = qcReview.qcDecision.privilegeCode;
        document.confidentialityLevel = qcReview.qcDecision.confidentialityLevel;
        document.issueTags = qcReview.qcDecision.issueTags;
        document.tags = qcReview.qcDecision.tags;
        document.hotDocument = qcReview.qcDecision.hotDocument;
        document.redactionRequired = qcReview.qcDecision.redactionRequired;
      }
    } else {
      // QC rejected - mark for re-review
      document.qcReviewerId = qcReview.qcReviewerId;
      document.qcReviewerName = qcReview.qcReviewerName;
      document.qcReviewDate = new Date();
      document.qcNotes = qcReview.qcNotes;
      document.qcApproved = false;
      document.reviewStatus = ReviewStatus.DISPUTED;
    }

    return this.documentRepository.save(document);
  }

  /**
   * Get next document for review
   */
  async getNextDocumentForReview(
    projectId: string,
    reviewerId: string,
    reviewMode: 'assigned' | 'tar_guided' | 'priority' = 'assigned',
  ): Promise<ReviewDocument | null> {
    this.logger.log(`Getting next document for reviewer ${reviewerId}`);

    let document: ReviewDocument | null = null;

    switch (reviewMode) {
      case 'tar_guided':
        // Get document with highest TAR uncertainty
        document = await this.documentRepository
          .createQueryBuilder('doc')
          .where('doc.projectId = :projectId', { projectId })
          .andWhere('doc.reviewerId = :reviewerId', { reviewerId })
          .andWhere('doc.reviewStatus IN (:...statuses)', {
            statuses: [ReviewStatus.NOT_STARTED, ReviewStatus.IN_PROGRESS],
          })
          .orderBy('ABS(doc.tarScore - 0.5)', 'ASC') // Documents closest to 0.5 are most uncertain
          .limit(1)
          .getOne();
        break;

      case 'priority':
        // Get hot documents first
        document = await this.documentRepository
          .createQueryBuilder('doc')
          .where('doc.projectId = :projectId', { projectId })
          .andWhere('doc.reviewerId = :reviewerId', { reviewerId })
          .andWhere('doc.reviewStatus IN (:...statuses)', {
            statuses: [ReviewStatus.NOT_STARTED, ReviewStatus.IN_PROGRESS],
          })
          .orderBy('doc.hotDocument', 'DESC')
          .addOrderBy('doc.createdAt', 'ASC')
          .limit(1)
          .getOne();
        break;

      default:
        // Get next assigned document sequentially
        document = await this.documentRepository
          .createQueryBuilder('doc')
          .where('doc.projectId = :projectId', { projectId })
          .andWhere('doc.reviewerId = :reviewerId', { reviewerId })
          .andWhere('doc.reviewStatus IN (:...statuses)', {
            statuses: [ReviewStatus.NOT_STARTED, ReviewStatus.IN_PROGRESS],
          })
          .orderBy('doc.createdAt', 'ASC')
          .limit(1)
          .getOne();
    }

    return document;
  }

  /**
   * Get review statistics for a project
   */
  async getReviewStatistics(projectId: string): Promise<{
    totalDocuments: number;
    reviewedDocuments: number;
    qcCompleteDocuments: number;
    notStartedDocuments: number;
    inProgressDocuments: number;
    disputedDocuments: number;
    responsivenessBreakdown: Record<string, number>;
    privilegeBreakdown: Record<string, number>;
    reviewerPerformance: Array<{
      reviewerId: string;
      reviewerName: string;
      documentsReviewed: number;
      avgReviewTimeSeconds: number;
      qcAccuracy: number;
    }>;
  }> {
    const documents = await this.documentRepository.find({
      where: { projectId },
    });

    const totalDocuments = documents.length;
    const reviewedDocuments = documents.filter(
      (doc) => doc.reviewStatus === ReviewStatus.REVIEWED ||
               doc.reviewStatus === ReviewStatus.QC_COMPLETE,
    ).length;
    const qcCompleteDocuments = documents.filter(
      (doc) => doc.reviewStatus === ReviewStatus.QC_COMPLETE,
    ).length;
    const notStartedDocuments = documents.filter(
      (doc) => doc.reviewStatus === ReviewStatus.NOT_STARTED,
    ).length;
    const inProgressDocuments = documents.filter(
      (doc) => doc.reviewStatus === ReviewStatus.IN_PROGRESS,
    ).length;
    const disputedDocuments = documents.filter(
      (doc) => doc.reviewStatus === ReviewStatus.DISPUTED,
    ).length;

    // Responsiveness breakdown
    const responsivenessBreakdown: Record<string, number> = {};
    documents.forEach((doc) => {
      const code = doc.responsivenessCode;
      responsivenessBreakdown[code] = (responsivenessBreakdown[code] || 0) + 1;
    });

    // Privilege breakdown
    const privilegeBreakdown: Record<string, number> = {};
    documents.forEach((doc) => {
      const code = doc.privilegeCode;
      privilegeBreakdown[code] = (privilegeBreakdown[code] || 0) + 1;
    });

    // Reviewer performance
    const reviewerMap = new Map<
      string,
      { count: number; totalTime: number; qcApproved: number; qcTotal: number }
    >();

    documents.forEach((doc) => {
      if (doc.reviewerId) {
        const stats = reviewerMap.get(doc.reviewerId) || {
          count: 0,
          totalTime: 0,
          qcApproved: 0,
          qcTotal: 0,
        };

        stats.count++;
        stats.totalTime += doc.reviewTimeSeconds || 0;

        if (doc.qcReviewerId) {
          stats.qcTotal++;
          if (doc.qcApproved) {
            stats.qcApproved++;
          }
        }

        reviewerMap.set(doc.reviewerId, stats);
      }
    });

    const reviewerPerformance = Array.from(reviewerMap.entries()).map(
      ([reviewerId, stats]) => ({
        reviewerId,
        reviewerName: documents.find((d) => d.reviewerId === reviewerId)?.reviewerName || '',
        documentsReviewed: stats.count,
        avgReviewTimeSeconds: stats.count > 0 ? stats.totalTime / stats.count : 0,
        qcAccuracy: stats.qcTotal > 0 ? (stats.qcApproved / stats.qcTotal) * 100 : 100,
      }),
    );

    return {
      totalDocuments,
      reviewedDocuments,
      qcCompleteDocuments,
      notStartedDocuments,
      inProgressDocuments,
      disputedDocuments,
      responsivenessBreakdown,
      privilegeBreakdown,
      reviewerPerformance,
    };
  }

  /**
   * Bulk tag documents
   */
  async bulkTagDocuments(
    documentIds: string[],
    tags: string[],
    userId: string,
  ): Promise<{ successCount: number; failureCount: number }> {
    let successCount = 0;
    let failureCount = 0;

    for (const documentId of documentIds) {
      try {
        const document = await this.documentRepository.findOne({
          where: { id: documentId },
        });

        if (document) {
          const existingTags = document.tags || [];
          document.tags = [...new Set([...existingTags, ...tags])];
          document.updatedBy = userId;
          await this.documentRepository.save(document);
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        this.logger.error(`Failed to tag document ${documentId}:`, error);
        failureCount++;
      }
    }

    return { successCount, failureCount };
  }

  // Helper methods

  private async getSequentialDocuments(
    projectId: string,
    count: number,
  ): Promise<ReviewDocument[]> {
    return this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.projectId = :projectId', { projectId })
      .andWhere('doc.reviewerId IS NULL')
      .andWhere('doc.reviewStatus = :status', { status: ReviewStatus.NOT_STARTED })
      .orderBy('doc.createdAt', 'ASC')
      .limit(count)
      .getMany();
  }

  private async getRandomUnassignedDocuments(
    projectId: string,
    count: number,
  ): Promise<ReviewDocument[]> {
    return this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.projectId = :projectId', { projectId })
      .andWhere('doc.reviewerId IS NULL')
      .andWhere('doc.reviewStatus = :status', { status: ReviewStatus.NOT_STARTED })
      .orderBy('RANDOM()')
      .limit(count)
      .getMany();
  }

  private async getPriorityDocuments(
    projectId: string,
    count: number,
  ): Promise<ReviewDocument[]> {
    return this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.projectId = :projectId', { projectId })
      .andWhere('doc.reviewerId IS NULL')
      .andWhere('doc.reviewStatus = :status', { status: ReviewStatus.NOT_STARTED })
      .orderBy('doc.hotDocument', 'DESC')
      .addOrderBy('doc.documentDate', 'DESC')
      .limit(count)
      .getMany();
  }

  private async getTARGuidedDocuments(
    projectId: string,
    count: number,
  ): Promise<ReviewDocument[]> {
    return this.documentRepository
      .createQueryBuilder('doc')
      .where('doc.projectId = :projectId', { projectId })
      .andWhere('doc.reviewerId IS NULL')
      .andWhere('doc.reviewStatus = :status', { status: ReviewStatus.NOT_STARTED })
      .orderBy('ABS(doc.tarScore - 0.5)', 'ASC') // Most uncertain documents
      .limit(count)
      .getMany();
  }

  private async updateProjectReviewStats(projectId: string): Promise<void> {
    const documents = await this.documentRepository.find({
      where: { projectId },
    });

    const reviewedCount = documents.filter(
      (doc) => doc.reviewStatus === ReviewStatus.REVIEWED ||
               doc.reviewStatus === ReviewStatus.QC_COMPLETE,
    ).length;

    const responsiveCount = documents.filter(
      (doc) => doc.responsivenessCode === ResponsivenessCode.RESPONSIVE ||
               doc.responsivenessCode === ResponsivenessCode.PARTIALLY_RESPONSIVE,
    ).length;

    const privilegedCount = documents.filter(
      (doc) => doc.privilegeCode !== PrivilegeCode.NONE,
    ).length;

    const responsivenessRate = documents.length > 0
      ? (responsiveCount / documents.length) * 100
      : 0;

    const privilegeRate = documents.length > 0
      ? (privilegedCount / documents.length) * 100
      : 0;

    await this.projectRepository.update(projectId, {
      totalItemsReviewed: reviewedCount,
      responsivenessRate,
      privilegeRate,
    });
  }

  private generateAssignmentId(): string {
    return `assign_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
