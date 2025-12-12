import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

export enum RetentionPeriod {
  DAYS_30 = '30_DAYS',
  DAYS_90 = '90_DAYS',
  MONTHS_6 = '6_MONTHS',
  YEAR_1 = '1_YEAR',
  YEARS_3 = '3_YEARS',
  YEARS_7 = '7_YEARS',
  YEARS_10 = '10_YEARS',
  PERMANENT = 'PERMANENT',
}

export enum DataCategory {
  CLIENT_COMMUNICATIONS = 'CLIENT_COMMUNICATIONS',
  LEGAL_DOCUMENTS = 'LEGAL_DOCUMENTS',
  BILLING_RECORDS = 'BILLING_RECORDS',
  AUDIT_LOGS = 'AUDIT_LOGS',
  SYSTEM_LOGS = 'SYSTEM_LOGS',
  TEMPORARY_FILES = 'TEMPORARY_FILES',
  CASE_FILES = 'CASE_FILES',
  DISCOVERY_MATERIALS = 'DISCOVERY_MATERIALS',
  RESEARCH_MEMOS = 'RESEARCH_MEMOS',
  EMAIL_ARCHIVES = 'EMAIL_ARCHIVES',
}

export interface RetentionPolicy {
  id: string;
  dataCategory: DataCategory;
  retentionPeriod: RetentionPeriod;
  description: string;
  legalBasis: string;
  jurisdiction: string[];
  autoDelete: boolean;
  requiresApproval: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RetentionSchedule {
  policyId: string;
  entityType: string;
  entityId: string;
  retentionEndDate: Date;
  deletionScheduledDate?: Date;
  legalHoldApplied: boolean;
  approvedForDeletion: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface DataRetentionReport {
  totalRecords: number;
  recordsByCategory: Record<DataCategory, number>;
  scheduledForDeletion: number;
  onLegalHold: number;
  pendingApproval: number;
  deletedThisMonth: number;
  storageReclaimed: number;
  complianceScore: number;
}

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);
  private retentionPolicies: Map<string, RetentionPolicy> = new Map();
  private retentionSchedules: Map<string, RetentionSchedule> = new Map();

  constructor(
    // @InjectRepository would be used for actual database entities
  ) {
    this.initializeDefaultPolicies();
  }

  /**
   * Initialize default retention policies based on legal requirements
   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: RetentionPolicy[] = [
      {
        id: 'policy-legal-docs',
        dataCategory: DataCategory.LEGAL_DOCUMENTS,
        retentionPeriod: RetentionPeriod.YEARS_7,
        description: 'Legal documents and court filings',
        legalBasis: 'ABA Model Rules, state bar requirements',
        jurisdiction: ['US', 'ALL_STATES'],
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'policy-billing',
        dataCategory: DataCategory.BILLING_RECORDS,
        retentionPeriod: RetentionPeriod.YEARS_7,
        description: 'Billing and financial records',
        legalBasis: 'IRS requirements, SOX compliance',
        jurisdiction: ['US'],
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'policy-audit-logs',
        dataCategory: DataCategory.AUDIT_LOGS,
        retentionPeriod: RetentionPeriod.YEARS_7,
        description: 'Security and compliance audit logs',
        legalBasis: 'SOX, HIPAA, compliance requirements',
        jurisdiction: ['US'],
        autoDelete: false,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'policy-client-comms',
        dataCategory: DataCategory.CLIENT_COMMUNICATIONS,
        retentionPeriod: RetentionPeriod.YEARS_7,
        description: 'Attorney-client communications',
        legalBasis: 'Attorney-client privilege, professional responsibility',
        jurisdiction: ['US', 'ALL_STATES'],
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'policy-system-logs',
        dataCategory: DataCategory.SYSTEM_LOGS,
        retentionPeriod: RetentionPeriod.DAYS_90,
        description: 'System operation and debug logs',
        legalBasis: 'Internal policy',
        jurisdiction: ['US'],
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'policy-temp-files',
        dataCategory: DataCategory.TEMPORARY_FILES,
        retentionPeriod: RetentionPeriod.DAYS_30,
        description: 'Temporary files and cache',
        legalBasis: 'Internal policy',
        jurisdiction: ['US'],
        autoDelete: true,
        requiresApproval: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'policy-case-files',
        dataCategory: DataCategory.CASE_FILES,
        retentionPeriod: RetentionPeriod.YEARS_10,
        description: 'Active and closed case files',
        legalBasis: 'State bar requirements, malpractice protection',
        jurisdiction: ['US', 'ALL_STATES'],
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'policy-discovery',
        dataCategory: DataCategory.DISCOVERY_MATERIALS,
        retentionPeriod: RetentionPeriod.YEARS_7,
        description: 'Discovery materials and evidence',
        legalBasis: 'FRCP, state civil procedure rules',
        jurisdiction: ['US', 'ALL_STATES'],
        autoDelete: false,
        requiresApproval: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultPolicies.forEach(policy => {
      this.retentionPolicies.set(policy.id, policy);
    });

    this.logger.log(`Initialized ${defaultPolicies.length} default retention policies`);
  }

  /**
   * Create or update retention policy
   */
  async createRetentionPolicy(policyData: Partial<RetentionPolicy>): Promise<RetentionPolicy> {
    const policy: RetentionPolicy = {
      id: policyData.id || `policy-${Date.now()}`,
      dataCategory: policyData.dataCategory!,
      retentionPeriod: policyData.retentionPeriod!,
      description: policyData.description || '',
      legalBasis: policyData.legalBasis || '',
      jurisdiction: policyData.jurisdiction || ['US'],
      autoDelete: policyData.autoDelete ?? false,
      requiresApproval: policyData.requiresApproval ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.retentionPolicies.set(policy.id, policy);
    this.logger.log(`Created retention policy: ${policy.id} for ${policy.dataCategory}`);

    return policy;
  }

  /**
   * Get all retention policies
   */
  async getRetentionPolicies(): Promise<RetentionPolicy[]> {
    return Array.from(this.retentionPolicies.values());
  }

  /**
   * Get policy by data category
   */
  async getPolicyByCategory(category: DataCategory): Promise<RetentionPolicy | null> {
    const policies = Array.from(this.retentionPolicies.values());
    return policies.find(p => p.dataCategory === category) || null;
  }

  /**
   * Calculate retention end date based on policy
   */
  calculateRetentionEndDate(createdDate: Date, retentionPeriod: RetentionPeriod): Date {
    const endDate = new Date(createdDate);

    switch (retentionPeriod) {
      case RetentionPeriod.DAYS_30:
        endDate.setDate(endDate.getDate() + 30);
        break;
      case RetentionPeriod.DAYS_90:
        endDate.setDate(endDate.getDate() + 90);
        break;
      case RetentionPeriod.MONTHS_6:
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case RetentionPeriod.YEAR_1:
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case RetentionPeriod.YEARS_3:
        endDate.setFullYear(endDate.getFullYear() + 3);
        break;
      case RetentionPeriod.YEARS_7:
        endDate.setFullYear(endDate.getFullYear() + 7);
        break;
      case RetentionPeriod.YEARS_10:
        endDate.setFullYear(endDate.getFullYear() + 10);
        break;
      case RetentionPeriod.PERMANENT:
        endDate.setFullYear(endDate.getFullYear() + 100);
        break;
    }

    return endDate;
  }

  /**
   * Schedule data for retention/deletion
   */
  async scheduleRetention(
    policyId: string,
    entityType: string,
    entityId: string,
    createdDate: Date,
  ): Promise<RetentionSchedule> {
    const policy = this.retentionPolicies.get(policyId);
    if (!policy) {
      throw new Error(`Retention policy not found: ${policyId}`);
    }

    const retentionEndDate = this.calculateRetentionEndDate(createdDate, policy.retentionPeriod);

    const schedule: RetentionSchedule = {
      policyId,
      entityType,
      entityId,
      retentionEndDate,
      legalHoldApplied: false,
      approvedForDeletion: false,
    };

    // Auto-schedule deletion if policy allows
    if (policy.autoDelete && !policy.requiresApproval) {
      schedule.deletionScheduledDate = retentionEndDate;
      schedule.approvedForDeletion = true;
    }

    const scheduleKey = `${entityType}:${entityId}`;
    this.retentionSchedules.set(scheduleKey, schedule);

    this.logger.log(
      `Scheduled retention for ${entityType}:${entityId}, expires: ${retentionEndDate.toISOString()}`,
    );

    return schedule;
  }

  /**
   * Get items scheduled for deletion
   */
  async getItemsScheduledForDeletion(beforeDate?: Date): Promise<RetentionSchedule[]> {
    const cutoffDate = beforeDate || new Date();
    const schedules = Array.from(this.retentionSchedules.values());

    return schedules.filter(
      schedule =>
        schedule.approvedForDeletion &&
        !schedule.legalHoldApplied &&
        schedule.deletionScheduledDate &&
        schedule.deletionScheduledDate <= cutoffDate,
    );
  }

  /**
   * Apply legal hold to prevent deletion
   */
  async applyLegalHold(entityType: string, entityId: string): Promise<void> {
    const scheduleKey = `${entityType}:${entityId}`;
    const schedule = this.retentionSchedules.get(scheduleKey);

    if (schedule) {
      schedule.legalHoldApplied = true;
      schedule.deletionScheduledDate = undefined;
      this.retentionSchedules.set(scheduleKey, schedule);

      this.logger.warn(`Legal hold applied to ${scheduleKey}`);
    }
  }

  /**
   * Approve deletion (for policies requiring approval)
   */
  async approveDeletion(
    entityType: string,
    entityId: string,
    approvedBy: string,
  ): Promise<void> {
    const scheduleKey = `${entityType}:${entityId}`;
    const schedule = this.retentionSchedules.get(scheduleKey);

    if (!schedule) {
      throw new Error(`Retention schedule not found: ${scheduleKey}`);
    }

    if (schedule.legalHoldApplied) {
      throw new Error(`Cannot approve deletion: legal hold applied to ${scheduleKey}`);
    }

    const now = new Date();
    schedule.approvedForDeletion = true;
    schedule.approvedBy = approvedBy;
    schedule.approvedAt = now;
    schedule.deletionScheduledDate = schedule.retentionEndDate;

    this.retentionSchedules.set(scheduleKey, schedule);

    this.logger.log(`Deletion approved for ${scheduleKey} by ${approvedBy}`);
  }

  /**
   * Execute scheduled deletions
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async executeScheduledDeletions(): Promise<number> {
    this.logger.log('Executing scheduled deletions...');

    const itemsToDelete = await this.getItemsScheduledForDeletion();
    let deletedCount = 0;

    for (const schedule of itemsToDelete) {
      try {
        // In production, this would call the appropriate service to delete the entity
        const scheduleKey = `${schedule.entityType}:${schedule.entityId}`;
        this.retentionSchedules.delete(scheduleKey);

        deletedCount++;
        this.logger.log(`Deleted ${scheduleKey} per retention policy`);
      } catch (error) {
        this.logger.error(
          `Failed to delete ${schedule.entityType}:${schedule.entityId}`,
          error,
        );
      }
    }

    this.logger.log(`Completed scheduled deletions: ${deletedCount} items deleted`);
    return deletedCount;
  }

  /**
   * Generate data retention report
   */
  async generateRetentionReport(): Promise<DataRetentionReport> {
    const schedules = Array.from(this.retentionSchedules.values());

    const recordsByCategory: Record<DataCategory, number> = {} as any;
    Object.values(DataCategory).forEach(category => {
      recordsByCategory[category] = 0;
    });

    // Count records by category
    for (const schedule of schedules) {
      const policy = this.retentionPolicies.get(schedule.policyId);
      if (policy) {
        recordsByCategory[policy.dataCategory]++;
      }
    }

    const now = new Date();
    const scheduledForDeletion = schedules.filter(
      s => s.approvedForDeletion && !s.legalHoldApplied,
    ).length;

    const onLegalHold = schedules.filter(s => s.legalHoldApplied).length;

    const pendingApproval = schedules.filter(
      s => !s.approvedForDeletion && s.retentionEndDate < now,
    ).length;

    // Calculate compliance score (100 = perfect compliance)
    const totalExpired = schedules.filter(s => s.retentionEndDate < now).length;
    const properlyHandled = scheduledForDeletion + onLegalHold;
    const complianceScore = totalExpired > 0
      ? Math.round((properlyHandled / totalExpired) * 100)
      : 100;

    return {
      totalRecords: schedules.length,
      recordsByCategory,
      scheduledForDeletion,
      onLegalHold,
      pendingApproval,
      deletedThisMonth: 0, // Would query deleted records from last 30 days
      storageReclaimed: 0, // Would calculate based on deleted file sizes
      complianceScore,
    };
  }

  /**
   * Get retention status for specific entity
   */
  async getRetentionStatus(entityType: string, entityId: string): Promise<RetentionSchedule | null> {
    const scheduleKey = `${entityType}:${entityId}`;
    return this.retentionSchedules.get(scheduleKey) || null;
  }

  /**
   * Extend retention period (e.g., for ongoing matters)
   */
  async extendRetention(
    entityType: string,
    entityId: string,
    extensionDays: number,
    reason: string,
  ): Promise<RetentionSchedule> {
    const scheduleKey = `${entityType}:${entityId}`;
    const schedule = this.retentionSchedules.get(scheduleKey);

    if (!schedule) {
      throw new Error(`Retention schedule not found: ${scheduleKey}`);
    }

    const newEndDate = new Date(schedule.retentionEndDate);
    newEndDate.setDate(newEndDate.getDate() + extensionDays);

    schedule.retentionEndDate = newEndDate;
    schedule.deletionScheduledDate = undefined;
    schedule.approvedForDeletion = false;

    this.retentionSchedules.set(scheduleKey, schedule);

    this.logger.log(
      `Extended retention for ${scheduleKey} by ${extensionDays} days. Reason: ${reason}`,
    );

    return schedule;
  }
}
