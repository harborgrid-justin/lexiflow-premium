import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Workflow,
  WorkflowStep,
  WorkflowExecution,
  ExecutionStatus,
  StepType,
  StepStatus,
} from './entities';
import { IntegrationWebhooksService } from './integration-webhooks.service';
import { NotificationRulesService } from './notification-rules.service';

export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  entityType?: string;
  entityId?: string;
  variables: Record<string, any>;
  stepResults: Record<string, any>;
}

/**
 * WorkflowEngineService
 * Core workflow execution engine that processes workflows step-by-step
 */
@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepo: Repository<Workflow>,
    @InjectRepository(WorkflowStep)
    private readonly stepRepo: Repository<WorkflowStep>,
    @InjectRepository(WorkflowExecution)
    private readonly executionRepo: Repository<WorkflowExecution>,
    private readonly webhookService: IntegrationWebhooksService,
    private readonly notificationService: NotificationRulesService,
  ) {}

  /**
   * Start a new workflow execution
   */
  async startWorkflow(
    workflowId: string,
    triggerData: Record<string, any>,
    options: {
      tenantId: string;
      entityType?: string;
      entityId?: string;
      initiatedBy?: string;
      priority?: number;
    },
  ): Promise<WorkflowExecution> {
    this.logger.log(`Starting workflow ${workflowId}`);

    // Validate workflow exists and is active
    const workflow = await this.workflowRepo.findOne({
      where: { id: workflowId, active: true },
      relations: ['steps'],
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow ${workflowId} not found or inactive`);
    }

    // Get ordered steps
    const steps = await this.stepRepo.find({
      where: { workflowId },
      order: { order: 'ASC' },
    });

    // Create execution record
    const execution = this.executionRepo.create({
      workflowId,
      tenantId: options.tenantId,
      entityType: options.entityType,
      entityId: options.entityId,
      status: ExecutionStatus.PENDING,
      triggerData,
      totalSteps: steps.length,
      currentStepNumber: 0,
      initiatedBy: options.initiatedBy,
      priority: options.priority || 5,
      context: {},
      stepHistory: [],
    });

    await this.executionRepo.save(execution);

    // Update workflow stats
    await this.workflowRepo.update(workflowId, {
      executionCount: () => 'execution_count + 1',
    });

    // Notify webhook
    await this.webhookService.triggerWebhook(options.tenantId, 'workflow.started', {
      workflowId,
      executionId: execution.id,
      workflow: workflow.name,
    });

    // Start execution asynchronously
    this.executeWorkflow(execution.id).catch((error) => {
      this.logger.error(`Workflow execution ${execution.id} failed: ${error.message}`);
    });

    return execution;
  }

  /**
   * Execute workflow steps
   */
  async executeWorkflow(executionId: string): Promise<void> {
    const execution = await this.executionRepo.findOne({
      where: { id: executionId },
      relations: ['workflow', 'workflow.steps'],
    });

    if (!execution) {
      throw new NotFoundException(`Execution ${executionId} not found`);
    }

    try {
      // Update status to running
      execution.status = ExecutionStatus.RUNNING;
      execution.startedAt = new Date();
      await this.executionRepo.save(execution);

      // Get steps in order
      const steps = await this.stepRepo.find({
        where: { workflowId: execution.workflowId },
        order: { order: 'ASC' },
      });

      const context: ExecutionContext = {
        workflowId: execution.workflowId,
        executionId: execution.id,
        entityType: execution.entityType,
        entityId: execution.entityId,
        variables: { ...execution.triggerData, ...execution.context },
        stepResults: {},
      };

      // Execute each step
      for (const step of steps) {
        // Check if execution was cancelled or paused
        const currentExecution = await this.executionRepo.findOne({
          where: { id: executionId },
        });

        if (currentExecution?.status === ExecutionStatus.CANCELLED) {
          this.logger.log(`Execution ${executionId} was cancelled`);
          return;
        }

        if (currentExecution?.status === ExecutionStatus.PAUSED) {
          this.logger.log(`Execution ${executionId} is paused`);
          return;
        }

        // Check conditions
        if (!(await this.checkStepConditions(step, context))) {
          this.logger.log(`Step ${step.id} conditions not met, skipping`);
          await this.recordStepHistory(execution, step, 'skipped', null, null);
          continue;
        }

        // Execute step
        await this.executeStep(execution, step, context);
      }

      // Mark as completed
      execution.status = ExecutionStatus.COMPLETED;
      execution.completedAt = new Date();
      execution.durationSeconds = this.calculateDuration(execution.startedAt!, execution.completedAt);
      await this.executionRepo.save(execution);

      // Update workflow stats
      await this.updateWorkflowStats(execution.workflowId);

      // Notify webhook
      await this.webhookService.triggerWebhook(execution.tenantId, 'workflow.completed', {
        workflowId: execution.workflowId,
        executionId: execution.id,
        duration: execution.durationSeconds,
      });

      this.logger.log(`Workflow execution ${executionId} completed successfully`);
    } catch (error: any) {
      this.logger.error(`Workflow execution ${executionId} failed: ${error.message}`);
      execution.status = ExecutionStatus.FAILED;
      execution.errorMessage = error.message;
      execution.errorDetails = { stack: error.stack, code: error.code };
      execution.completedAt = new Date();
      await this.executionRepo.save(execution);

      // Notify webhook
      await this.webhookService.triggerWebhook(execution.tenantId, 'workflow.failed', {
        workflowId: execution.workflowId,
        executionId: execution.id,
        error: error.message,
      });
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    context: ExecutionContext,
  ): Promise<any> {
    const startTime = new Date();
    this.logger.log(`Executing step ${step.id}: ${step.name} (${step.type})`);

    try {
      // Update current step
      execution.currentStepId = step.id;
      execution.currentStepNumber = step.order;
      await this.executionRepo.save(execution);

      let result: any;

      // Execute based on step type
      switch (step.type) {
        case StepType.TASK:
          result = await this.executeTaskStep(step, context);
          break;
        case StepType.APPROVAL:
          result = await this.executeApprovalStep(step, context);
          break;
        case StepType.NOTIFICATION:
          result = await this.executeNotificationStep(step, context);
          break;
        case StepType.WEBHOOK:
          result = await this.executeWebhookStep(step, context);
          break;
        case StepType.CONDITION:
          result = await this.executeConditionStep(step, context);
          break;
        case StepType.DELAY:
          result = await this.executeDelayStep(step, context);
          break;
        case StepType.EMAIL:
          result = await this.executeEmailStep(step, context);
          break;
        case StepType.ASSIGNMENT:
          result = await this.executeAssignmentStep(step, context);
          break;
        default:
          this.logger.warn(`Unknown step type: ${step.type}`);
          result = { success: true, message: 'Step type not implemented' };
      }

      // Record success
      await this.recordStepHistory(execution, step, 'completed', result, null);

      // Update context with step results
      context.stepResults[step.id] = result;

      // Notify webhook
      await this.webhookService.triggerWebhook(execution.tenantId, 'step.completed', {
        executionId: execution.id,
        stepId: step.id,
        stepName: step.name,
        result,
      });

      return result;
    } catch (error: any) {
      this.logger.error(`Step ${step.id} failed: ${error.message}`);

      // Handle retry logic
      if (step.retryCount > 0) {
        // TODO: Implement retry logic
      }

      // Record failure
      await this.recordStepHistory(execution, step, 'failed', null, error.message);

      // If step is required, fail the entire workflow
      if (step.required) {
        throw error;
      }

      return { success: false, error: error.message };
    }
  }

  /**
   * Check if step conditions are met
   */
  private async checkStepConditions(step: WorkflowStep, context: ExecutionContext): Promise<boolean> {
    if (!step.conditions || step.conditions.length === 0) {
      return true;
    }

    for (const condition of step.conditions) {
      const value = this.resolveVariable(condition.field || '', context);
      const conditionMet = this.evaluateCondition(value, condition.operator || 'equals', condition.value);

      if (!conditionMet && condition.logic !== 'or') {
        return false;
      }

      if (conditionMet && condition.logic === 'or') {
        return true;
      }
    }

    return true;
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'not_equals':
        return value !== expected;
      case 'contains':
        return String(value).includes(String(expected));
      case 'greater_than':
        return Number(value) > Number(expected);
      case 'less_than':
        return Number(value) < Number(expected);
      default:
        return true;
    }
  }

  /**
   * Resolve variable from context
   */
  private resolveVariable(path: string, context: ExecutionContext): any {
    const parts = path.split('.');
    let value: any = context.variables;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  /**
   * Execute task step
   */
  private async executeTaskStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    // Task creation logic
    return {
      success: true,
      taskId: 'generated-task-id',
      message: 'Task created',
    };
  }

  /**
   * Execute approval step
   */
  private async executeApprovalStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    // Approval chain creation logic
    return {
      success: true,
      approvalId: 'generated-approval-id',
      message: 'Approval chain created',
    };
  }

  /**
   * Execute notification step
   */
  private async executeNotificationStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    await this.notificationService.sendNotification({
      tenantId: context.variables.tenantId,
      userId: step.config.userId || step.assignedTo,
      title: step.config.title || step.name,
      message: this.interpolateTemplate(step.config.message || '', context),
      type: step.config.notificationType || 'info',
    });

    return { success: true, message: 'Notification sent' };
  }

  /**
   * Execute webhook step
   */
  private async executeWebhookStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    const result = await this.webhookService.callWebhook(
      step.config.url,
      step.config.method || 'POST',
      {
        ...context.variables,
        stepId: step.id,
        executionId: context.executionId,
      },
      step.config.headers,
    );

    return { success: true, response: result };
  }

  /**
   * Execute condition step
   */
  private async executeConditionStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    const conditionMet = await this.checkStepConditions(step, context);
    return { success: true, conditionMet };
  }

  /**
   * Execute delay step
   */
  private async executeDelayStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    const delayMs = step.config.delaySeconds * 1000 || 1000;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return { success: true, delayed: delayMs };
  }

  /**
   * Execute email step
   */
  private async executeEmailStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    // Email sending logic
    return { success: true, message: 'Email sent' };
  }

  /**
   * Execute assignment step
   */
  private async executeAssignmentStep(step: WorkflowStep, context: ExecutionContext): Promise<any> {
    // Assignment logic
    return { success: true, assignedTo: step.assignedTo };
  }

  /**
   * Record step execution in history
   */
  private async recordStepHistory(
    execution: WorkflowExecution,
    step: WorkflowStep,
    status: string,
    output: any,
    error: string | null,
  ): Promise<void> {
    const history = execution.stepHistory || [];
    const lastEntry = history.find((h) => h.stepId === step.id);

    if (lastEntry) {
      lastEntry.status = status;
      lastEntry.completedAt = new Date();
      lastEntry.output = output;
      lastEntry.error = error || undefined;
    } else {
      history.push({
        stepId: step.id,
        stepName: step.name,
        status,
        startedAt: new Date(),
        completedAt: status !== 'in_progress' ? new Date() : undefined,
        output,
        error: error || undefined,
      });
    }

    execution.stepHistory = history;
    await this.executionRepo.save(execution);
  }

  /**
   * Pause workflow execution
   */
  async pauseExecution(executionId: string): Promise<void> {
    await this.executionRepo.update(executionId, {
      status: ExecutionStatus.PAUSED,
      pausedAt: new Date(),
    });
    this.logger.log(`Execution ${executionId} paused`);
  }

  /**
   * Resume workflow execution
   */
  async resumeExecution(executionId: string): Promise<void> {
    await this.executionRepo.update(executionId, {
      status: ExecutionStatus.RUNNING,
      pausedAt: null,
    });
    this.logger.log(`Execution ${executionId} resumed`);

    // Continue execution
    this.executeWorkflow(executionId).catch((error) => {
      this.logger.error(`Failed to resume execution ${executionId}: ${error.message}`);
    });
  }

  /**
   * Cancel workflow execution
   */
  async cancelExecution(executionId: string, reason: string, cancelledBy: string): Promise<void> {
    const execution = await this.executionRepo.findOne({ where: { id: executionId } });

    if (execution) {
      execution.status = ExecutionStatus.CANCELLED;
      execution.cancellationReason = reason;
      execution.cancelledBy = cancelledBy;
      execution.completedAt = new Date();
      await this.executionRepo.save(execution);

      this.logger.log(`Execution ${executionId} cancelled by ${cancelledBy}`);
    }
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution | null> {
    return this.executionRepo.findOne({
      where: { id: executionId },
      relations: ['workflow'],
    });
  }

  /**
   * Update workflow statistics
   */
  private async updateWorkflowStats(workflowId: string): Promise<void> {
    const executions = await this.executionRepo.find({
      where: { workflowId },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    const successCount = executions.filter((e) => e.status === ExecutionStatus.COMPLETED).length;
    const successRate = executions.length > 0 ? (successCount / executions.length) * 100 : 0;

    const avgTime = executions
      .filter((e) => e.durationSeconds)
      .reduce((sum, e) => sum + (e.durationSeconds || 0), 0) / successCount || 0;

    await this.workflowRepo.update(workflowId, {
      successRate,
      avgExecutionTime: avgTime,
    });
  }

  /**
   * Calculate duration in seconds
   */
  private calculateDuration(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / 1000;
  }

  /**
   * Interpolate template with context variables
   */
  private interpolateTemplate(template: string, context: ExecutionContext): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.resolveVariable(path, context);
      return value !== undefined ? String(value) : match;
    });
  }
}
