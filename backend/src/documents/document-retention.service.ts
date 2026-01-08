import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In } from 'typeorm';
import {
  RetentionPolicy,
  RetentionAction,
  PolicyStatus,
} from './entities/retention-policy.entity';
import { Document } from './entities/document.entity';
import { DocumentClassification } from './entities/document-classification.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Document Retention Result
 */
export interface RetentionActionResult {
  documentId: string;
  action: RetentionAction;
  policyId: string;
  success: boolean;
  error?: string;
  executedAt: Date;
}

/**
 * Document Retention Service
 *
 * Manages document retention policies and automated actions:
 * - Policy creation and management
 * - Automatic policy application
 * - Retention period tracking
 * - Scheduled cleanup jobs
 * - Legal hold management
 */
@Injectable()
export class DocumentRetentionService {
  private readonly logger = new Logger(DocumentRetentionService.name);

  constructor(
    @InjectRepository(RetentionPolicy)
    private policyRepository: Repository<RetentionPolicy>,
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentClassification)
    private classificationRepository: Repository<DocumentClassification>,
  ) {}

  /**
   * Create a retention policy
   */
  async createPolicy(
    data: {
      name: string;
      description?: string;
      retentionDays: number;
      action: RetentionAction;
      appliesTo: string[];
      jurisdictions?: string[];
      practiceAreas?: string[];
      priority?: number;
      autoApply?: boolean;
      notificationSettings?: {
        notifyBefore?: number;
        notifyUsers?: string[];
        notifyRoles?: string[];
      };
    },
    createdById: string,
  ): Promise<RetentionPolicy> {
    this.logger.log(`Creating retention policy: ${data.name}`);

    const policy = this.policyRepository.create({
      ...data,
      createdById,
      status: PolicyStatus.ACTIVE,
      effectiveDate: new Date(),
    });

    const saved = await this.policyRepository.save(policy);

    // If auto-apply, apply to existing documents
    if (data.autoApply !== false) {
      this.applyPolicyToExistingDocuments(saved.id);
    }

    return saved;
  }

  /**
   * Get all active policies
   */
  async getActivePolicies(): Promise<RetentionPolicy[]> {
    return this.policyRepository.find({
      where: { status: PolicyStatus.ACTIVE },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Get policy by ID
   */
  async getPolicy(policyId: string): Promise<RetentionPolicy | null> {
    return this.policyRepository.findOne({
      where: { id: policyId },
      relations: ['createdByUser', 'updatedByUser'],
    });
  }

  /**
   * Update a policy
   */
  async updatePolicy(
    policyId: string,
    updates: Partial<RetentionPolicy>,
    updatedById: string,
  ): Promise<RetentionPolicy> {
    const policy = await this.getPolicy(policyId);
    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }

    Object.assign(policy, updates, { updatedById });
    return this.policyRepository.save(policy);
  }

  /**
   * Delete a policy
   */
  async deletePolicy(policyId: string): Promise<void> {
    await this.policyRepository.softDelete(policyId);
  }

  /**
   * Apply a policy to existing documents
   */
  private async applyPolicyToExistingDocuments(
    policyId: string,
  ): Promise<void> {
    this.logger.log(`Applying policy ${policyId} to existing documents`);

    const policy = await this.getPolicy(policyId);
    if (!policy) {
      return;
    }

    // Find documents matching policy criteria
    const classifications = await this.classificationRepository.find({
      where: {
        category: In(policy.appliesTo),
      },
      relations: ['document'],
    });

    this.logger.log(
      `Found ${classifications.length} documents matching policy criteria`,
    );

    // Update policy document count
    policy.documentsCount = classifications.length;
    await this.policyRepository.save(policy);
  }

  /**
   * Get applicable policies for a document
   */
  async getApplicablePolicies(documentId: string): Promise<RetentionPolicy[]> {
    const classification = await this.classificationRepository.findOne({
      where: { documentId },
    });

    if (!classification) {
      return [];
    }

    const policies = await this.policyRepository.find({
      where: { status: PolicyStatus.ACTIVE },
      order: { priority: 'DESC' },
    });

    // Filter policies that apply to this document's category
    return policies.filter((policy) =>
      policy.appliesTo.includes(classification.category),
    );
  }

  /**
   * Check if document should be retained or actioned
   */
  async checkDocumentRetention(documentId: string): Promise<{
    shouldAction: boolean;
    policy: RetentionPolicy | null;
    daysUntilAction: number;
    action: RetentionAction | null;
  }> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    const policies = await this.getApplicablePolicies(documentId);

    if (policies.length === 0) {
      return {
        shouldAction: false,
        policy: null,
        daysUntilAction: -1,
        action: null,
      };
    }

    // Get highest priority policy
    const policy = policies[0];

    // Check if under legal hold
    if (policy.isLegalHold) {
      return {
        shouldAction: false,
        policy,
        daysUntilAction: -1,
        action: null,
      };
    }

    // Calculate days since document creation
    const daysSinceCreation = Math.floor(
      (Date.now() - document.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const daysUntilAction = policy.retentionDays - daysSinceCreation;
    const shouldAction = daysUntilAction <= 0;

    return {
      shouldAction,
      policy,
      daysUntilAction,
      action: shouldAction ? policy.action : null,
    };
  }

  /**
   * Execute retention action on a document
   */
  async executeRetentionAction(
    documentId: string,
    policyId: string,
  ): Promise<RetentionActionResult> {
    this.logger.log(
      `Executing retention action for document ${documentId} with policy ${policyId}`,
    );

    const policy = await this.getPolicy(policyId);
    if (!policy) {
      return {
        documentId,
        action: RetentionAction.DELETE,
        policyId,
        success: false,
        error: 'Policy not found',
        executedAt: new Date(),
      };
    }

    try {
      switch (policy.action) {
        case RetentionAction.DELETE:
          await this.documentRepository.softDelete(documentId);
          break;

        case RetentionAction.ARCHIVE:
          await this.archiveDocument(documentId, policy.archiveLocation);
          break;

        case RetentionAction.REVIEW:
          await this.markForReview(documentId, policy.reviewWorkflowId);
          break;

        case RetentionAction.NOTIFY:
          await this.notifyRetention(documentId, policy);
          break;

        case RetentionAction.TRANSFER:
          await this.transferDocument(documentId, policy.transferDestination);
          break;
      }

      // Update policy last executed
      policy.lastExecutedAt = new Date();
      await this.policyRepository.save(policy);

      return {
        documentId,
        action: policy.action,
        policyId,
        success: true,
        executedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to execute retention action for document ${documentId}`,
        error,
      );

      return {
        documentId,
        action: policy.action,
        policyId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date(),
      };
    }
  }

  /**
   * Archive a document
   */
  private async archiveDocument(
    documentId: string,
    archiveLocation?: string,
  ): Promise<void> {
    this.logger.log(`Archiving document ${documentId}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Update document status or move to archive location
    // Implementation depends on your archive strategy
    document.status = 'archived' as any;
    if (archiveLocation) {
      document.customFields = {
        ...document.customFields,
        archivedLocation: archiveLocation,
        archivedAt: new Date().toISOString(),
      };
    }

    await this.documentRepository.save(document);
  }

  /**
   * Mark document for review
   */
  private async markForReview(
    documentId: string,
    workflowId?: string,
  ): Promise<void> {
    this.logger.log(`Marking document ${documentId} for review`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    document.customFields = {
      ...document.customFields,
      pendingReview: true,
      reviewWorkflowId: workflowId,
      reviewRequiredAt: new Date().toISOString(),
    };

    await this.documentRepository.save(document);
  }

  /**
   * Notify about retention
   */
  private async notifyRetention(
    documentId: string,
    policy: RetentionPolicy,
  ): Promise<void> {
    this.logger.log(`Sending retention notification for document ${documentId}`);

    // Implementation would send notifications via email/system notifications
    // For now, just log
    this.logger.log(
      `Notification would be sent to users: ${policy.notificationSettings?.notifyUsers?.join(', ')}`,
    );
  }

  /**
   * Transfer document
   */
  private async transferDocument(
    documentId: string,
    destination?: string,
  ): Promise<void> {
    this.logger.log(`Transferring document ${documentId} to ${destination}`);

    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    document.customFields = {
      ...document.customFields,
      transferredTo: destination,
      transferredAt: new Date().toISOString(),
    };

    await this.documentRepository.save(document);
  }

  /**
   * Scheduled job to process retention policies (runs daily)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processRetentionPolicies(): Promise<void> {
    this.logger.log('Starting scheduled retention policy processing');

    const policies = await this.getActivePolicies();
    const results: RetentionActionResult[] = [];

    for (const policy of policies) {
      // Find documents matching this policy's criteria
      const classifications = await this.classificationRepository.find({
        where: {
          category: In(policy.appliesTo),
        },
        relations: ['document'],
      });

      for (const classification of classifications) {
        const document = classification.document;

        // Skip if under legal hold
        if (policy.isLegalHold) {
          continue;
        }

        // Check retention period
        const daysSinceCreation = Math.floor(
          (Date.now() - document.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysSinceCreation >= policy.retentionDays) {
          const result = await this.executeRetentionAction(
            document.id,
            policy.id,
          );
          results.push(result);
        }
      }
    }

    this.logger.log(
      `Retention policy processing complete. Processed ${results.length} documents`,
    );
  }

  /**
   * Place legal hold on documents
   */
  async placeLegalHold(
    policyId: string,
    reason: string,
    endDate?: Date,
  ): Promise<RetentionPolicy> {
    const policy = await this.getPolicy(policyId);
    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }

    policy.isLegalHold = true;
    policy.legalHoldReason = reason;
    policy.legalHoldStart = new Date();
    policy.legalHoldEnd = endDate;

    return this.policyRepository.save(policy);
  }

  /**
   * Release legal hold
   */
  async releaseLegalHold(policyId: string): Promise<RetentionPolicy> {
    const policy = await this.getPolicy(policyId);
    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }

    policy.isLegalHold = false;
    policy.legalHoldEnd = new Date();

    return this.policyRepository.save(policy);
  }

  /**
   * Get retention statistics
   */
  async getStatistics(): Promise<{
    totalPolicies: number;
    activePolicies: number;
    documentsUnderRetention: number;
    documentsUnderLegalHold: number;
    upcomingActions: number;
  }> {
    const allPolicies = await this.policyRepository.find();
    const activePolicies = allPolicies.filter(
      (p) => p.status === PolicyStatus.ACTIVE,
    );
    const legalHoldPolicies = allPolicies.filter((p) => p.isLegalHold);

    // Count documents under legal hold
    let documentsUnderLegalHold = 0;
    for (const policy of legalHoldPolicies) {
      documentsUnderLegalHold += policy.documentsCount;
    }

    // Count upcoming actions (documents expiring within 30 days)
    let upcomingActions = 0;
    for (const policy of activePolicies) {
      if (policy.isLegalHold) continue;

      const classifications = await this.classificationRepository.find({
        where: {
          category: In(policy.appliesTo),
        },
        relations: ['document'],
      });

      for (const classification of classifications) {
        const daysSinceCreation = Math.floor(
          (Date.now() - classification.document.createdAt.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        const daysUntilAction = policy.retentionDays - daysSinceCreation;

        if (daysUntilAction >= 0 && daysUntilAction <= 30) {
          upcomingActions++;
        }
      }
    }

    return {
      totalPolicies: allPolicies.length,
      activePolicies: activePolicies.length,
      documentsUnderRetention: activePolicies.reduce(
        (sum, p) => sum + p.documentsCount,
        0,
      ),
      documentsUnderLegalHold,
      upcomingActions,
    };
  }
}
