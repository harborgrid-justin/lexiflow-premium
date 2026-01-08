import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataRetentionRule, RetentionAction, RetentionRuleStatus } from './entities/data-retention-rule.entity';
import { AuditTrailService } from './services/auditTrail.service';

export interface RetentionExecutionResult {
  ruleId: string;
  ruleName: string;
  startedAt: Date;
  completedAt: Date;
  status: 'success' | 'partial' | 'failed';
  resourcesProcessed: number;
  resourcesSucceeded: number;
  resourcesFailed: number;
  errors: string[];
  summary: string;
}

export interface RetentionSummary {
  totalRules: number;
  activeRules: number;
  inactiveRules: number;
  resourcesPendingAction: number;
  nextScheduledExecution: Date | null;
  recentExecutions: RetentionExecutionResult[];
}

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(
    @InjectRepository(DataRetentionRule)
    private readonly retentionRuleRepository: Repository<DataRetentionRule>,
    private readonly auditTrailService: AuditTrailService,
  ) {}

  /**
   * Create a new data retention rule
   */
  async createRetentionRule(data: Partial<DataRetentionRule>): Promise<DataRetentionRule> {
    this.logger.log(`Creating retention rule: ${data.name}`);

    const rule = this.retentionRuleRepository.create({
      ...data,
      status: data.status || RetentionRuleStatus.ACTIVE,
      effectiveDate: data.effectiveDate || new Date(),
      nextExecutionDate: this.calculateNextExecutionDate(data.executionFrequency || 'daily'),
    });

    const saved = await this.retentionRuleRepository.save(rule);

    await this.auditTrailService.createAuditEntry({
      userId: data.createdBy || 'system',
      action: 'create',
      entityType: 'data_retention_rule',
      entityId: saved.id,
      description: `Created data retention rule: ${saved.name}`,
      result: 'success',
    } as any);

    return saved;
  }

  /**
   * Update an existing retention rule
   */
  async updateRetentionRule(
    id: string,
    data: Partial<DataRetentionRule>,
    userId: string
  ): Promise<DataRetentionRule> {
    this.logger.log(`Updating retention rule: ${id}`);

    const existing = await this.retentionRuleRepository.findOne({ where: { id } });
    if (!existing) {
      throw new Error(`Retention rule not found: ${id}`);
    }

    // Track changes for audit
    const changes: any[] = [];
    Object.keys(data).forEach(key => {
      if (existing[key] !== data[key]) {
        changes.push({
          changedAt: new Date(),
          changedBy: userId,
          field: key,
          oldValue: existing[key],
          newValue: data[key],
        });
      }
    });

    const updated = await this.retentionRuleRepository.save({
      ...existing,
      ...data,
      changeHistory: [...(existing.changeHistory || []), ...changes],
      updatedBy: userId,
    });

    await this.auditTrailService.createAuditEntry({
      userId,
      action: 'update',
      entityType: 'data_retention_rule',
      entityId: id,
      description: `Updated data retention rule: ${updated.name}`,
      result: 'success',
      changes: changes,
    } as any);

    return updated;
  }

  /**
   * Execute a specific retention rule
   */
  async executeRetentionRule(ruleId: string, userId?: string): Promise<RetentionExecutionResult> {
    this.logger.log(`Executing retention rule: ${ruleId}`);

    const rule = await this.retentionRuleRepository.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new Error(`Retention rule not found: ${ruleId}`);
    }

    if (rule.status !== RetentionRuleStatus.ACTIVE) {
      throw new Error(`Cannot execute inactive rule: ${rule.name}`);
    }

    const startedAt = new Date();
    const result: RetentionExecutionResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      startedAt,
      completedAt: new Date(),
      status: 'success',
      resourcesProcessed: 0,
      resourcesSucceeded: 0,
      resourcesFailed: 0,
      errors: [],
      summary: '',
    };

    try {
      // Find resources that match the retention criteria
      const eligibleResources = await this.findEligibleResources(rule);
      result.resourcesProcessed = eligibleResources.length;

      this.logger.log(`Found ${eligibleResources.length} resources eligible for retention action`);

      // Execute the retention action on each resource
      for (const resource of eligibleResources) {
        try {
          await this.executeRetentionAction(rule, resource);
          result.resourcesSucceeded++;
        } catch (error) {
          result.resourcesFailed++;
          result.errors.push(`Failed to process ${resource.id}: ${error.message}`);
          this.logger.error(`Error processing resource ${resource.id}:`, error);
        }
      }

      result.completedAt = new Date();
      result.status = result.resourcesFailed === 0 ? 'success' : 'partial';
      result.summary = `Processed ${result.resourcesProcessed} resources: ${result.resourcesSucceeded} succeeded, ${result.resourcesFailed} failed`;

      // Update rule execution statistics
      await this.retentionRuleRepository.update(ruleId, {
        lastExecutionDate: startedAt,
        nextExecutionDate: this.calculateNextExecutionDate(rule.executionFrequency),
        resourcesProcessed: rule.resourcesProcessed + result.resourcesProcessed,
        lastExecutionResults: result,
      });

      // Create audit log entry
      await this.auditTrailService.createAuditEntry({
        userId: userId || 'system',
        action: 'other',
        entityType: 'data_retention_rule',
        entityId: ruleId,
        description: `Executed retention rule: ${rule.name}`,
        result: result.status === 'success' ? 'success' : 'warning',
        details: JSON.stringify(result),
      } as any);

      this.logger.log(`Retention rule execution completed: ${result.summary}`);
    } catch (error) {
      result.completedAt = new Date();
      result.status = 'failed';
      result.errors.push(error.message);
      result.summary = `Execution failed: ${error.message}`;

      await this.auditTrailService.createAuditEntry({
        userId: userId || 'system',
        action: 'other',
        entityType: 'data_retention_rule',
        entityId: ruleId,
        description: `Failed to execute retention rule: ${rule.name}`,
        result: 'failure',
        errorMessage: error.message,
      } as any);

      throw error;
    }

    return result;
  }

  /**
   * Find resources eligible for retention action
   */
  private async findEligibleResources(rule: DataRetentionRule): Promise<any[]> {
    // This is a placeholder - actual implementation would query the appropriate
    // entity repository based on rule.resourceType
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - rule.retentionPeriodDays);

    this.logger.debug(
      `Finding ${rule.resourceType} resources older than ${rule.retentionPeriodDays} days (before ${cutoffDate.toISOString()})`
    );

    // TODO: Implement actual resource finding logic based on resourceType
    // This would involve querying different repositories (documents, cases, etc.)
    // and checking against the rule's conditions and exceptions

    return [];
  }

  /**
   * Execute the retention action on a resource
   */
  private async executeRetentionAction(rule: DataRetentionRule, resource: any): Promise<void> {
    this.logger.debug(`Executing ${rule.action} on resource ${resource.id}`);

    switch (rule.action) {
      case RetentionAction.ARCHIVE:
        await this.archiveResource(resource, rule);
        break;
      case RetentionAction.DELETE:
        await this.deleteResource(resource, rule);
        break;
      case RetentionAction.ANONYMIZE:
        await this.anonymizeResource(resource, rule);
        break;
      case RetentionAction.ENCRYPT:
        await this.encryptResource(resource, rule);
        break;
      case RetentionAction.EXPORT:
        await this.exportResource(resource, rule);
        break;
      case RetentionAction.RETAIN:
        // No action needed, just logging
        this.logger.debug(`Retaining resource ${resource.id}`);
        break;
      default:
        throw new Error(`Unknown retention action: ${rule.action}`);
    }

    // Create audit entry for the action
    await this.auditTrailService.createAuditEntry({
      userId: 'system',
      action: 'other',
      entityType: rule.resourceType,
      entityId: resource.id,
      description: `Retention action ${rule.action} applied by rule ${rule.name}`,
      result: 'success',
      metadata: { ruleId: rule.id, ruleName: rule.name },
    } as any);
  }

  private async archiveResource(resource: any, rule: DataRetentionRule): Promise<void> {
    // TODO: Implement archival logic
    this.logger.debug(`Archiving resource ${resource.id}`);
  }

  private async deleteResource(resource: any, rule: DataRetentionRule): Promise<void> {
    // TODO: Implement deletion logic with backup if configured
    if (rule.backupBeforeAction) {
      await this.backupResource(resource, rule);
    }
    this.logger.debug(`Deleting resource ${resource.id}`);
  }

  private async anonymizeResource(resource: any, rule: DataRetentionRule): Promise<void> {
    // TODO: Implement anonymization logic
    this.logger.debug(`Anonymizing resource ${resource.id}`);
  }

  private async encryptResource(resource: any, rule: DataRetentionRule): Promise<void> {
    // TODO: Implement encryption logic
    this.logger.debug(`Encrypting resource ${resource.id}`);
  }

  private async exportResource(resource: any, rule: DataRetentionRule): Promise<void> {
    // TODO: Implement export logic
    this.logger.debug(`Exporting resource ${resource.id}`);
  }

  private async backupResource(resource: any, rule: DataRetentionRule): Promise<void> {
    // TODO: Implement backup logic based on rule.backupConfig
    this.logger.debug(`Backing up resource ${resource.id}`);
  }

  /**
   * Calculate next execution date based on frequency
   */
  private calculateNextExecutionDate(frequency: string): Date {
    const now = new Date();
    const next = new Date(now);

    switch (frequency.toLowerCase()) {
      case 'hourly':
        next.setHours(next.getHours() + 1);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        next.setDate(next.getDate() + 1); // Default to daily
    }

    return next;
  }

  /**
   * Get retention summary statistics
   */
  async getRetentionSummary(): Promise<RetentionSummary> {
    const [total, active, inactive] = await Promise.all([
      this.retentionRuleRepository.count(),
      this.retentionRuleRepository.count({ where: { status: RetentionRuleStatus.ACTIVE } }),
      this.retentionRuleRepository.count({ where: { status: RetentionRuleStatus.INACTIVE } }),
    ]);

    const nextRule = await this.retentionRuleRepository.findOne({
      where: { status: RetentionRuleStatus.ACTIVE },
      order: { nextExecutionDate: 'ASC' },
    });

    const recentExecutions = await this.getRecentExecutions(10);

    return {
      totalRules: total,
      activeRules: active,
      inactiveRules: inactive,
      resourcesPendingAction: 0, // TODO: Calculate from actual resources
      nextScheduledExecution: nextRule?.nextExecutionDate || null,
      recentExecutions,
    };
  }

  /**
   * Get recent execution results
   */
  async getRecentExecutions(limit: number = 10): Promise<RetentionExecutionResult[]> {
    const rules = await this.retentionRuleRepository.find({
      where: { lastExecutionDate: LessThanOrEqual(new Date()) },
      order: { lastExecutionDate: 'DESC' },
      take: limit,
    });

    return rules
      .filter(rule => rule.lastExecutionResults)
      .map(rule => rule.lastExecutionResults as RetentionExecutionResult);
  }

  /**
   * Scheduled job to execute retention rules automatically
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async executeScheduledRetentionRules(): Promise<void> {
    this.logger.log('Starting scheduled retention rule execution');

    const now = new Date();
    const rulesToExecute = await this.retentionRuleRepository.find({
      where: {
        status: RetentionRuleStatus.ACTIVE,
        autoExecute: true,
        nextExecutionDate: LessThanOrEqual(now),
      },
    });

    this.logger.log(`Found ${rulesToExecute.length} rules scheduled for execution`);

    for (const rule of rulesToExecute) {
      try {
        // Check if approval is required
        if (rule.requireApproval && !rule.approvedAt) {
          this.logger.warn(`Skipping rule ${rule.name} - approval required but not granted`);
          continue;
        }

        // Send notifications if configured
        if (rule.notifyBeforeDays && rule.notificationRecipients.length > 0) {
          // TODO: Implement notification logic
          this.logger.log(`Sending notifications for rule ${rule.name}`);
        }

        await this.executeRetentionRule(rule.id, 'system');
      } catch (error) {
        this.logger.error(`Failed to execute scheduled rule ${rule.name}:`, error);
      }
    }

    this.logger.log('Scheduled retention rule execution completed');
  }

  /**
   * Get retention rules by resource type
   */
  async getRulesByResourceType(resourceType: string): Promise<DataRetentionRule[]> {
    return this.retentionRuleRepository.find({
      where: { resourceType, status: RetentionRuleStatus.ACTIVE },
      order: { priority: 'DESC' },
    });
  }

  /**
   * Approve a retention rule for execution
   */
  async approveRule(ruleId: string, userId: string, notes?: string): Promise<DataRetentionRule> {
    const rule = await this.retentionRuleRepository.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new Error(`Retention rule not found: ${ruleId}`);
    }

    const updated = await this.retentionRuleRepository.save({
      ...rule,
      approvedBy: userId,
      approvedAt: new Date(),
      approvalNotes: notes,
    });

    await this.auditTrailService.createAuditEntry({
      userId,
      action: 'approve',
      entityType: 'data_retention_rule',
      entityId: ruleId,
      description: `Approved retention rule: ${rule.name}`,
      result: 'success',
      details: notes,
    } as any);

    return updated;
  }

  /**
   * Suspend a retention rule
   */
  async suspendRule(ruleId: string, userId: string, reason?: string): Promise<DataRetentionRule> {
    const rule = await this.retentionRuleRepository.findOne({ where: { id: ruleId } });
    if (!rule) {
      throw new Error(`Retention rule not found: ${ruleId}`);
    }

    const updated = await this.retentionRuleRepository.save({
      ...rule,
      status: RetentionRuleStatus.SUSPENDED,
      notes: `${rule.notes || ''}\n\nSuspended: ${reason || 'No reason provided'}`,
      updatedBy: userId,
    });

    await this.auditTrailService.createAuditEntry({
      userId,
      action: 'update',
      entityType: 'data_retention_rule',
      entityId: ruleId,
      description: `Suspended retention rule: ${rule.name}`,
      result: 'success',
      details: reason,
    } as any);

    return updated;
  }
}
