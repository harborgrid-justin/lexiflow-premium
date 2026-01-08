import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { AutomationRule, RuleTrigger, ActionType, AutomationCondition, AutomationAction } from './entities/automation-rule.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface TriggerEvent {
  trigger: RuleTrigger;
  tenantId: string;
  entityType?: string;
  entityId?: string;
  data: Record<string, any>;
  userId?: string;
}

/**
 * TaskAutomationService
 * Executes automation rules based on triggers and conditions
 */
@Injectable()
export class TaskAutomationService {
  private readonly logger = new Logger(TaskAutomationService.name);

  constructor(
    @InjectRepository(AutomationRule)
    private readonly ruleRepo: Repository<AutomationRule>,
  ) {}

  /**
   * Process a trigger event and execute matching automation rules
   */
  async processTriggerEvent(event: TriggerEvent): Promise<void> {
    this.logger.log(`Processing trigger event: ${event.trigger} for tenant ${event.tenantId}`);

    try {
      // Find matching automation rules
      const rules = await this.findMatchingRules(event);

      if (rules.length === 0) {
        this.logger.debug(`No matching rules found for trigger: ${event.trigger}`);
        return;
      }

      // Sort by priority (highest first)
      rules.sort((a, b) => b.priority - a.priority);

      // Execute rules
      for (const rule of rules) {
        try {
          await this.executeRule(rule, event);

          // If rule has stopOnMatch, don't process further rules
          if (rule.stopOnMatch) {
            this.logger.log(`Rule ${rule.id} has stopOnMatch=true, stopping rule processing`);
            break;
          }
        } catch (error: any) {
          this.logger.error(`Error executing rule ${rule.id}: ${error.message}`);
          await this.recordRuleFailure(rule, error);
        }
      }
    } catch (error: any) {
      this.logger.error(`Error processing trigger event: ${error.message}`);
    }
  }

  /**
   * Find automation rules matching the trigger event
   */
  private async findMatchingRules(event: TriggerEvent): Promise<AutomationRule[]> {
    const rules = await this.ruleRepo.find({
      where: {
        tenantId: event.tenantId,
        trigger: event.trigger,
        active: true,
      },
      order: { priority: 'DESC' },
    });

    // Filter by conditions
    const matchingRules: AutomationRule[] = [];

    for (const rule of rules) {
      if (await this.evaluateConditions(rule.conditions || [], event.data)) {
        matchingRules.push(rule);
      }
    }

    return matchingRules;
  }

  /**
   * Evaluate rule conditions against event data
   */
  private async evaluateConditions(conditions: AutomationCondition[], data: Record<string, any>): Promise<boolean> {
    if (conditions.length === 0) {
      return true;
    }

    let result = true;
    let hasOr = false;

    for (const condition of conditions) {
      const value = this.getNestedValue(data, condition.field);
      const conditionMet = this.evaluateCondition(value, condition.operator, condition.value);

      if (condition.logic === 'or') {
        hasOr = true;
        if (conditionMet) {
          return true; // Any OR condition met = pass
        }
      } else {
        // AND logic (default)
        if (!conditionMet) {
          result = false;
          if (!hasOr) {
            return false; // Early exit if AND fails and no OR exists
          }
        }
      }
    }

    return result;
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      case 'contains':
        return String(value).toLowerCase().includes(String(expected).toLowerCase());
      case 'not_contains':
        return !String(value).toLowerCase().includes(String(expected).toLowerCase());
      case 'greater_than':
        return Number(value) > Number(expected);
      case 'less_than':
        return Number(value) < Number(expected);
      case 'in':
        return Array.isArray(expected) && expected.includes(value);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(value);
      default:
        this.logger.warn(`Unknown operator: ${operator}`);
        return true;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * Execute automation rule
   */
  private async executeRule(rule: AutomationRule, event: TriggerEvent): Promise<void> {
    this.logger.log(`Executing rule ${rule.id}: ${rule.name}`);

    const startTime = Date.now();

    try {
      // Sort actions by order
      const sortedActions = [...rule.actions].sort((a, b) => a.order - b.order);

      // Execute actions
      for (const action of sortedActions) {
        try {
          await this.executeAction(action, event, rule);
        } catch (error: any) {
          this.logger.error(`Error executing action ${action.type}: ${error.message}`);

          if (!action.continueOnError) {
            throw error;
          }
        }
      }

      // Record success
      await this.recordRuleSuccess(rule, Date.now() - startTime);
    } catch (error: any) {
      this.logger.error(`Rule execution failed: ${error.message}`);
      await this.recordRuleFailure(rule, error);
      throw error;
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: AutomationAction, event: TriggerEvent, rule: AutomationRule): Promise<void> {
    this.logger.debug(`Executing action: ${action.type}`);

    switch (action.type) {
      case ActionType.SEND_EMAIL:
        await this.executeSendEmail(action.config, event);
        break;

      case ActionType.CREATE_TASK:
        await this.executeCreateTask(action.config, event);
        break;

      case ActionType.UPDATE_STATUS:
        await this.executeUpdateStatus(action.config, event);
        break;

      case ActionType.ASSIGN_USER:
        await this.executeAssignUser(action.config, event);
        break;

      case ActionType.GENERATE_DOCUMENT:
        await this.executeGenerateDocument(action.config, event);
        break;

      case ActionType.SEND_NOTIFICATION:
        await this.executeSendNotification(action.config, event);
        break;

      case ActionType.WEBHOOK:
        await this.executeWebhook(action.config, event);
        break;

      case ActionType.RUN_WORKFLOW:
        await this.executeRunWorkflow(action.config, event);
        break;

      case ActionType.UPDATE_FIELD:
        await this.executeUpdateField(action.config, event);
        break;

      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute send email action
   */
  private async executeSendEmail(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing send email action');
    // Email sending implementation would go here
    // This would typically integrate with an email service
  }

  /**
   * Execute create task action
   */
  private async executeCreateTask(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing create task action');
    // Task creation implementation would go here
    // This would create a task in the task management system
  }

  /**
   * Execute update status action
   */
  private async executeUpdateStatus(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing update status action');
    // Status update implementation would go here
  }

  /**
   * Execute assign user action
   */
  private async executeAssignUser(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing assign user action');
    // User assignment implementation would go here
  }

  /**
   * Execute generate document action
   */
  private async executeGenerateDocument(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing generate document action');
    // Document generation implementation would go here
  }

  /**
   * Execute send notification action
   */
  private async executeSendNotification(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing send notification action');
    // Notification sending implementation would go here
  }

  /**
   * Execute webhook action
   */
  private async executeWebhook(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing webhook action');
    // Webhook call implementation would go here
  }

  /**
   * Execute run workflow action
   */
  private async executeRunWorkflow(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing run workflow action');
    // Workflow execution implementation would go here
  }

  /**
   * Execute update field action
   */
  private async executeUpdateField(config: Record<string, any>, event: TriggerEvent): Promise<void> {
    this.logger.debug('Executing update field action');
    // Field update implementation would go here
  }

  /**
   * Record successful rule execution
   */
  private async recordRuleSuccess(rule: AutomationRule, executionTime: number): Promise<void> {
    await this.ruleRepo.update(rule.id, {
      executionCount: () => 'execution_count + 1',
      successCount: () => 'success_count + 1',
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'success',
      lastExecutionError: null,
    });
  }

  /**
   * Record failed rule execution
   */
  private async recordRuleFailure(rule: AutomationRule, error: Error): Promise<void> {
    await this.ruleRepo.update(rule.id, {
      executionCount: () => 'execution_count + 1',
      failureCount: () => 'failure_count + 1',
      lastExecutedAt: new Date(),
      lastExecutionStatus: 'failed',
      lastExecutionError: error.message,
    });
  }

  /**
   * Create automation rule
   */
  async createRule(ruleData: Partial<AutomationRule>): Promise<AutomationRule> {
    const rule = this.ruleRepo.create(ruleData);
    return this.ruleRepo.save(rule);
  }

  /**
   * Update automation rule
   */
  async updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule | null> {
    await this.ruleRepo.update(ruleId, updates);
    return this.ruleRepo.findOne({ where: { id: ruleId } });
  }

  /**
   * Delete automation rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    await this.ruleRepo.delete(ruleId);
  }

  /**
   * Get automation rule
   */
  async getRule(ruleId: string): Promise<AutomationRule | null> {
    return this.ruleRepo.findOne({ where: { id: ruleId } });
  }

  /**
   * List automation rules for tenant
   */
  async listRules(tenantId: string, filters?: { active?: boolean; trigger?: RuleTrigger }): Promise<AutomationRule[]> {
    const query = this.ruleRepo.createQueryBuilder('rule').where('rule.tenantId = :tenantId', { tenantId });

    if (filters?.active !== undefined) {
      query.andWhere('rule.active = :active', { active: filters.active });
    }

    if (filters?.trigger) {
      query.andWhere('rule.trigger = :trigger', { trigger: filters.trigger });
    }

    return query.orderBy('rule.priority', 'DESC').addOrderBy('rule.createdAt', 'DESC').getMany();
  }

  /**
   * Activate/deactivate rule
   */
  async toggleRuleActive(ruleId: string, active: boolean): Promise<void> {
    await this.ruleRepo.update(ruleId, { active });
  }

  /**
   * Process time-based automation rules (scheduled)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledRules(): Promise<void> {
    this.logger.debug('Processing scheduled automation rules');

    try {
      const rules = await this.ruleRepo.find({
        where: {
          trigger: RuleTrigger.TIME_BASED,
          active: true,
        },
      });

      for (const rule of rules) {
        // Check if rule should run based on schedule
        if (rule.schedule && this.shouldRunScheduledRule(rule)) {
          const event: TriggerEvent = {
            trigger: RuleTrigger.TIME_BASED,
            tenantId: rule.tenantId,
            data: { scheduledRun: true, schedule: rule.schedule },
          };

          await this.executeRule(rule, event);
        }
      }
    } catch (error: any) {
      this.logger.error(`Error processing scheduled rules: ${error.message}`);
    }
  }

  /**
   * Check if scheduled rule should run
   */
  private shouldRunScheduledRule(rule: AutomationRule): boolean {
    // Simplified check - in production, use proper cron parser
    if (!rule.schedule || !rule.lastExecutedAt) {
      return true;
    }

    // Don't run if executed within last minute
    const lastRun = rule.lastExecutedAt.getTime();
    const now = Date.now();
    const minutesSinceLastRun = (now - lastRun) / (1000 * 60);

    return minutesSinceLastRun >= 1;
  }
}
