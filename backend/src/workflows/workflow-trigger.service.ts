import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowEngineService } from './workflow-engine.service';

/**
 * Trigger definition
 */
export interface WorkflowTrigger {
  id: string;
  name: string;
  workflowDefinitionId: string;
  workflowName: string;
  triggerType: TriggerType;
  enabled: boolean;
  config: TriggerConfig;
  conditions?: TriggerCondition[];
  createdAt: Date;
  lastTriggeredAt?: Date;
  triggerCount: number;
}

export enum TriggerType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  EVENT = 'event',
  WEBHOOK = 'webhook',
  ENTITY_CREATED = 'entity_created',
  ENTITY_UPDATED = 'entity_updated',
  ENTITY_DELETED = 'entity_deleted',
  STATUS_CHANGED = 'status_changed',
  DEADLINE_APPROACHING = 'deadline_approaching',
  DOCUMENT_UPLOADED = 'document_uploaded',
}

export interface TriggerConfig {
  // For SCHEDULED triggers
  cronExpression?: string;
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };

  // For EVENT triggers
  eventName?: string;
  eventSource?: string;

  // For ENTITY triggers
  entityType?: string;
  entityFields?: string[];

  // For WEBHOOK triggers
  webhookUrl?: string;
  webhookSecret?: string;

  // For DEADLINE triggers
  deadlineField?: string;
  advanceNoticeDays?: number;
}

export interface TriggerCondition {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  value: any;
}

/**
 * Workflow Trigger Service
 * Handles event-based workflow triggering
 */
@Injectable()
export class WorkflowTriggerService {
  private readonly logger = new Logger(WorkflowTriggerService.name);
  private triggers: Map<string, WorkflowTrigger> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly workflowEngine: WorkflowEngineService,
  ) {
    this.initializeDefaultTriggers();
  }

  /**
   * Initialize default triggers
   */
  private initializeDefaultTriggers(): void {
    // Case created trigger
    this.registerTrigger({
      id: 'case-created-default',
      name: 'Case Created - Default Workflow',
      workflowDefinitionId: 'default-case-workflow',
      workflowName: 'Default Case Workflow',
      triggerType: TriggerType.ENTITY_CREATED,
      enabled: true,
      config: {
        entityType: 'case',
      },
      triggerCount: 0,
      createdAt: new Date(),
    });

    // Document uploaded trigger
    this.registerTrigger({
      id: 'document-uploaded-review',
      name: 'Document Uploaded - Review Workflow',
      workflowDefinitionId: 'document-review-workflow',
      workflowName: 'Document Review Workflow',
      triggerType: TriggerType.DOCUMENT_UPLOADED,
      enabled: true,
      config: {
        entityType: 'document',
      },
      triggerCount: 0,
      createdAt: new Date(),
    });
  }

  /**
   * Register a new trigger
   */
  registerTrigger(trigger: WorkflowTrigger): void {
    this.triggers.set(trigger.id, trigger);

    // Setup scheduled triggers
    if (
      trigger.triggerType === TriggerType.SCHEDULED &&
      trigger.enabled &&
      trigger.config.schedule
    ) {
      this.setupScheduledTrigger(trigger);
    }

    this.logger.log(`Registered trigger: ${trigger.name} (${trigger.id})`);
  }

  /**
   * Unregister a trigger
   */
  unregisterTrigger(triggerId: string): void {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      this.triggers.delete(triggerId);

      // Cancel scheduled job if exists
      const job = this.scheduledJobs.get(triggerId);
      if (job) {
        clearTimeout(job);
        this.scheduledJobs.delete(triggerId);
      }

      this.logger.log(`Unregistered trigger: ${triggerId}`);
    }
  }

  /**
   * Handle event and trigger matching workflows
   */
  async handleEvent(
    eventType: TriggerType,
    eventData: {
      entityType?: string;
      entityId?: string;
      fieldChanges?: Record<string, any>;
      metadata?: Record<string, any>;
    },
  ): Promise<string[]> {
    const triggeredWorkflows: string[] = [];

    // Find matching triggers
    const matchingTriggers = Array.from(this.triggers.values()).filter(
      (trigger) =>
        trigger.enabled &&
        trigger.triggerType === eventType &&
        this.matchesTriggerConditions(trigger, eventData),
    );

    // Execute workflows for matching triggers
    for (const trigger of matchingTriggers) {
      try {
        const instance = await this.workflowEngine.startWorkflow(
          trigger.workflowDefinitionId,
          trigger.workflowName,
          {
            entityType: eventData.entityType,
            entityId: eventData.entityId,
            variables: {
              triggerEvent: eventType,
              eventData: eventData.metadata,
              triggeredBy: trigger.id,
            },
          },
        );

        triggeredWorkflows.push(instance.id);

        // Update trigger stats
        trigger.lastTriggeredAt = new Date();
        trigger.triggerCount++;

        this.logger.log(
          `Triggered workflow ${trigger.workflowName} (instance: ${instance.id}) by trigger ${trigger.name}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to trigger workflow for trigger ${trigger.name}:`,
          error,
        );
      }
    }

    return triggeredWorkflows;
  }

  /**
   * Setup scheduled trigger
   */
  private setupScheduledTrigger(trigger: WorkflowTrigger): void {
    const schedule = trigger.config.schedule;
    if (!schedule) return;

    let intervalMs: number;

    switch (schedule.frequency) {
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        intervalMs = 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        return;
    }

    const job = setInterval(async () => {
      try {
        await this.workflowEngine.startWorkflow(
          trigger.workflowDefinitionId,
          trigger.workflowName,
          {
            variables: {
              scheduledTrigger: true,
              triggerId: trigger.id,
            },
          },
        );

        trigger.lastTriggeredAt = new Date();
        trigger.triggerCount++;

        this.logger.log(`Scheduled trigger executed: ${trigger.name}`);
      } catch (error) {
        this.logger.error(`Scheduled trigger failed: ${trigger.name}`, error);
      }
    }, intervalMs);

    this.scheduledJobs.set(trigger.id, job as any);
  }

  /**
   * Check if event matches trigger conditions
   */
  private matchesTriggerConditions(
    trigger: WorkflowTrigger,
    eventData: any,
  ): boolean {
    // Check entity type match
    if (trigger.config.entityType && eventData.entityType) {
      if (trigger.config.entityType !== eventData.entityType) {
        return false;
      }
    }

    // Check custom conditions
    if (trigger.conditions && trigger.conditions.length > 0) {
      for (const condition of trigger.conditions) {
        if (!this.evaluateCondition(condition, eventData)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(condition: TriggerCondition, data: any): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;

      case 'notEquals':
        return fieldValue !== condition.value;

      case 'contains':
        return (
          typeof fieldValue === 'string' &&
          fieldValue.includes(condition.value)
        );

      case 'greaterThan':
        return fieldValue > condition.value;

      case 'lessThan':
        return fieldValue < condition.value;

      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);

      default:
        return false;
    }
  }

  /**
   * Get nested object value by path
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Trigger workflow on case created
   */
  async onCaseCreated(caseId: string, caseData: any): Promise<string[]> {
    return this.handleEvent(TriggerType.ENTITY_CREATED, {
      entityType: 'case',
      entityId: caseId,
      metadata: caseData,
    });
  }

  /**
   * Trigger workflow on case updated
   */
  async onCaseUpdated(
    caseId: string,
    changes: Record<string, any>,
  ): Promise<string[]> {
    return this.handleEvent(TriggerType.ENTITY_UPDATED, {
      entityType: 'case',
      entityId: caseId,
      fieldChanges: changes,
    });
  }

  /**
   * Trigger workflow on status changed
   */
  async onStatusChanged(
    entityType: string,
    entityId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<string[]> {
    return this.handleEvent(TriggerType.STATUS_CHANGED, {
      entityType,
      entityId,
      metadata: {
        oldStatus,
        newStatus,
      },
    });
  }

  /**
   * Trigger workflow on document uploaded
   */
  async onDocumentUploaded(
    documentId: string,
    documentData: any,
  ): Promise<string[]> {
    return this.handleEvent(TriggerType.DOCUMENT_UPLOADED, {
      entityType: 'document',
      entityId: documentId,
      metadata: documentData,
    });
  }

  /**
   * Get all triggers
   */
  getAllTriggers(): WorkflowTrigger[] {
    return Array.from(this.triggers.values());
  }

  /**
   * Get trigger by ID
   */
  getTrigger(triggerId: string): WorkflowTrigger | undefined {
    return this.triggers.get(triggerId);
  }

  /**
   * Enable trigger
   */
  enableTrigger(triggerId: string): void {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.enabled = true;
      if (trigger.triggerType === TriggerType.SCHEDULED) {
        this.setupScheduledTrigger(trigger);
      }
    }
  }

  /**
   * Disable trigger
   */
  disableTrigger(triggerId: string): void {
    const trigger = this.triggers.get(triggerId);
    if (trigger) {
      trigger.enabled = false;
      const job = this.scheduledJobs.get(triggerId);
      if (job) {
        clearTimeout(job);
        this.scheduledJobs.delete(triggerId);
      }
    }
  }
}
