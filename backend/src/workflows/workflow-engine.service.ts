import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkflowInstance,
  WorkflowStatus,
  StepExecutionRecord,
} from './entities/workflow-instance.entity';
import { WorkflowStep, StepType, StepStatus } from './entities/workflow-step.entity';

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  instanceId: string;
  workflowDefinitionId: string;
  variables: Record<string, any>;
  currentStep?: WorkflowStep;
  previousSteps: string[];
  metadata: Record<string, any>;
}

/**
 * Workflow execution result
 */
export interface ExecutionResult {
  success: boolean;
  nextStepId?: string;
  output?: any;
  errorMessage?: string;
  shouldWait?: boolean;
  waitCondition?: string;
}

/**
 * BPMN-style Workflow Engine Service
 * Implements sophisticated workflow execution logic
 */
@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectRepository(WorkflowInstance)
    private readonly instanceRepository: Repository<WorkflowInstance>,
    @InjectRepository(WorkflowStep)
    private readonly stepRepository: Repository<WorkflowStep>,
  ) {}

  /**
   * Start a new workflow instance
   */
  async startWorkflow(
    workflowDefinitionId: string,
    workflowName: string,
    options: {
      caseId?: string;
      documentId?: string;
      entityType?: string;
      entityId?: string;
      initiatedBy?: string;
      initiatedByName?: string;
      variables?: Record<string, any>;
      priority?: number;
      dueDate?: Date;
    },
  ): Promise<WorkflowInstance> {
    // Get workflow steps
    const steps = await this.stepRepository.find({
      where: { workflowDefinitionId, isActive: true },
      order: { orderIndex: 'ASC' },
    });

    if (steps.length === 0) {
      throw new BadRequestException('Workflow has no active steps');
    }

    // Find start step
    const startStep = steps.find((s) => s.type === StepType.START) || steps[0];

    // Create workflow instance
    const instance = this.instanceRepository.create({
      workflowDefinitionId,
      workflowName,
      caseId: options.caseId,
      documentId: options.documentId,
      entityType: options.entityType,
      entityId: options.entityId,
      status: WorkflowStatus.ACTIVE,
      currentStepId: startStep.id,
      currentStepName: startStep.name,
      initiatedBy: options.initiatedBy,
      initiatedByName: options.initiatedByName,
      startedAt: new Date(),
      variables: options.variables || {},
      executionHistory: [],
      completedSteps: 0,
      totalSteps: steps.length,
      priority: options.priority || 0,
      dueDate: options.dueDate,
      metadata: {},
    });

    const savedInstance = await this.instanceRepository.save(instance);

    this.logger.log(
      `Workflow ${workflowName} (${workflowDefinitionId}) started with instance ID ${savedInstance.id}`,
    );

    // Auto-execute if start step
    if (startStep.type === StepType.START) {
      await this.executeNextStep(savedInstance.id);
    }

    return savedInstance;
  }

  /**
   * Execute the next step in workflow
   */
  async executeNextStep(instanceId: string): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new BadRequestException('Workflow instance not found');
    }

    if (
      instance.status === WorkflowStatus.COMPLETED ||
      instance.status === WorkflowStatus.FAILED ||
      instance.status === WorkflowStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot execute workflow in ${instance.status} status`,
      );
    }

    if (!instance.currentStepId) {
      throw new BadRequestException('No current step to execute');
    }

    // Get current step
    const currentStep = await this.stepRepository.findOne({
      where: { id: instance.currentStepId },
    });

    if (!currentStep) {
      throw new BadRequestException('Current step not found');
    }

    this.logger.log(
      `Executing step ${currentStep.name} (${currentStep.type}) for instance ${instanceId}`,
    );

    // Create execution record
    const executionRecord: StepExecutionRecord = {
      stepId: currentStep.id,
      stepName: currentStep.name,
      startedAt: new Date(),
      status: 'in_progress',
      retryCount: 0,
    };

    // Execute step based on type
    let result: ExecutionResult;
    try {
      result = await this.executeStep(currentStep, instance);

      executionRecord.completedAt = new Date();
      executionRecord.duration =
        executionRecord.completedAt.getTime() -
        executionRecord.startedAt.getTime();

      if (result.success) {
        executionRecord.status = 'completed';
        executionRecord.result = result.output;
      } else {
        executionRecord.status = 'failed';
        executionRecord.errorMessage = result.errorMessage;
      }
    } catch (error) {
      executionRecord.completedAt = new Date();
      executionRecord.status = 'failed';
      executionRecord.errorMessage = error.message;
      result = {
        success: false,
        errorMessage: error.message,
      };
    }

    // Update execution history
    const executionHistory = [...(instance.executionHistory || []), executionRecord];

    // Determine next step
    let nextStepId: string | undefined;
    let workflowStatus = instance.status;
    let completedAt: Date | undefined;

    if (result.success) {
      if (result.shouldWait) {
        // Workflow is waiting for external event/condition
        workflowStatus = WorkflowStatus.PAUSED;
        nextStepId = instance.currentStepId; // Stay on same step
      } else if (result.nextStepId) {
        nextStepId = result.nextStepId;
      } else if (currentStep.nextStepId) {
        nextStepId = currentStep.nextStepId;
      } else if (currentStep.type === StepType.END) {
        // Workflow completed
        workflowStatus = WorkflowStatus.COMPLETED;
        completedAt = new Date();
      } else {
        // No next step defined, workflow completed
        workflowStatus = WorkflowStatus.COMPLETED;
        completedAt = new Date();
      }
    } else {
      // Step failed
      if (currentStep.errorHandlerStepId) {
        nextStepId = currentStep.errorHandlerStepId;
      } else {
        workflowStatus = WorkflowStatus.FAILED;
        instance.errorMessage = result.errorMessage;
      }
    }

    // Get next step name
    let nextStepName: string | undefined;
    if (nextStepId) {
      const nextStep = await this.stepRepository.findOne({
        where: { id: nextStepId },
      });
      nextStepName = nextStep?.name;
    }

    // Update instance
    instance.currentStepId = nextStepId;
    instance.currentStepName = nextStepName;
    instance.status = workflowStatus;
    instance.executionHistory = executionHistory;
    instance.completedSteps = executionHistory.filter(
      (r) => r.status === 'completed',
    ).length;
    instance.completedAt = completedAt;

    if (completedAt) {
      instance.executionTimeMs =
        completedAt.getTime() - new Date(instance.startedAt!).getTime();
    }

    const updatedInstance = await this.instanceRepository.save(instance);

    // Auto-execute next step if it's automated
    if (
      nextStepId &&
      workflowStatus === WorkflowStatus.ACTIVE &&
      this.isAutomatedStep(currentStep)
    ) {
      // Schedule async execution
      setImmediate(() => this.executeNextStep(instanceId));
    }

    return updatedInstance;
  }

  /**
   * Execute a single workflow step
   */
  private async executeStep(
    step: WorkflowStep,
    instance: WorkflowInstance,
  ): Promise<ExecutionResult> {
    const context: WorkflowContext = {
      instanceId: instance.id,
      workflowDefinitionId: instance.workflowDefinitionId,
      variables: instance.variables || {},
      currentStep: step,
      previousSteps: (instance.executionHistory || []).map((r) => r.stepId),
      metadata: instance.metadata || {},
    };

    switch (step.type) {
      case StepType.START:
        return this.executeStartStep(step, context);

      case StepType.TASK:
        return this.executeTaskStep(step, context);

      case StepType.DECISION:
        return this.executeDecisionStep(step, context);

      case StepType.PARALLEL:
        return this.executeParallelStep(step, context);

      case StepType.WAIT:
        return this.executeWaitStep(step, context);

      case StepType.NOTIFICATION:
        return this.executeNotificationStep(step, context);

      case StepType.SCRIPT:
        return this.executeScriptStep(step, context);

      case StepType.END:
        return this.executeEndStep(step, context);

      default:
        return {
          success: false,
          errorMessage: `Unknown step type: ${step.type}`,
        };
    }
  }

  /**
   * Execute START step
   */
  private async executeStartStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<ExecutionResult> {
    return { success: true };
  }

  /**
   * Execute TASK step
   */
  private async executeTaskStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<ExecutionResult> {
    // Task steps require human interaction
    // They will be completed via completeTask method
    return {
      success: true,
      shouldWait: true,
      waitCondition: 'task_completion',
    };
  }

  /**
   * Execute DECISION step
   */
  private async executeDecisionStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<ExecutionResult> {
    const config = step.config;
    if (!config?.branches || config.branches.length === 0) {
      return {
        success: false,
        errorMessage: 'Decision step has no branches defined',
      };
    }

    // Evaluate each branch condition
    for (const branch of config.branches) {
      try {
        const conditionMet = this.evaluateCondition(
          branch.condition,
          context.variables,
        );

        if (conditionMet) {
          return {
            success: true,
            nextStepId: branch.nextStepId,
          };
        }
      } catch (error) {
        this.logger.error(
          `Error evaluating condition for branch ${branch.label}:`,
          error,
        );
      }
    }

    // No branch matched
    return {
      success: false,
      errorMessage: 'No decision branch condition was met',
    };
  }

  /**
   * Execute PARALLEL step
   */
  private async executeParallelStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<ExecutionResult> {
    const config = step.config;
    if (!config?.parallelBranches || config.parallelBranches.length === 0) {
      return {
        success: false,
        errorMessage: 'Parallel step has no branches defined',
      };
    }

    // Create sub-instances for each branch
    // This is a simplified implementation
    // Real implementation would create actual parallel execution paths

    return {
      success: true,
      shouldWait: true,
      waitCondition: 'parallel_branches_completion',
    };
  }

  /**
   * Execute WAIT step
   */
  private async executeWaitStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<ExecutionResult> {
    const config = step.config;

    if (config?.waitType === 'time' && config.waitDuration) {
      // Schedule continuation after duration
      setTimeout(() => {
        this.resumeWorkflow(context.instanceId);
      }, config.waitDuration);
    }

    return {
      success: true,
      shouldWait: true,
      waitCondition: config?.waitEvent || config?.waitCondition || 'time_elapsed',
    };
  }

  /**
   * Execute NOTIFICATION step
   */
  private async executeNotificationStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<ExecutionResult> {
    // Send notification (would integrate with notification service)
    this.logger.log(
      `Sending notification for step ${step.name} to ${step.config?.recipients?.join(', ')}`,
    );

    return { success: true };
  }

  /**
   * Execute SCRIPT step
   */
  private async executeScriptStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<ExecutionResult> {
    const config = step.config;

    if (!config?.scriptCode) {
      return {
        success: false,
        errorMessage: 'Script step has no code defined',
      };
    }

    try {
      // Execute script (simplified - would use sandboxed execution)
      // For security, this should use a proper sandbox like vm2
      const result = this.executeScriptSandboxed(config.scriptCode, context.variables);

      return {
        success: true,
        output: result,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage: `Script execution failed: ${error.message}`,
      };
    }
  }

  /**
   * Execute END step
   */
  private async executeEndStep(
    step: WorkflowStep,
    context: WorkflowContext,
  ): Promise<ExecutionResult> {
    return { success: true };
  }

  /**
   * Complete a task step
   */
  async completeTask(
    instanceId: string,
    taskData: Record<string, any>,
    completedBy?: string,
  ): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new BadRequestException('Workflow instance not found');
    }

    // Merge task data into variables
    instance.variables = {
      ...instance.variables,
      ...taskData,
      lastCompletedBy: completedBy,
      lastCompletedAt: new Date().toISOString(),
    };

    await this.instanceRepository.save(instance);

    // Continue execution
    return this.executeNextStep(instanceId);
  }

  /**
   * Pause workflow
   */
  async pauseWorkflow(instanceId: string): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new BadRequestException('Workflow instance not found');
    }

    instance.status = WorkflowStatus.PAUSED;
    instance.pausedAt = new Date();

    return this.instanceRepository.save(instance);
  }

  /**
   * Resume workflow
   */
  async resumeWorkflow(instanceId: string): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new BadRequestException('Workflow instance not found');
    }

    if (instance.status !== WorkflowStatus.PAUSED) {
      throw new BadRequestException('Workflow is not paused');
    }

    instance.status = WorkflowStatus.ACTIVE;
    instance.pausedAt = undefined;

    await this.instanceRepository.save(instance);

    // Continue execution
    return this.executeNextStep(instanceId);
  }

  /**
   * Cancel workflow
   */
  async cancelWorkflow(
    instanceId: string,
    reason?: string,
  ): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new BadRequestException('Workflow instance not found');
    }

    instance.status = WorkflowStatus.CANCELLED;
    instance.completedAt = new Date();
    instance.errorMessage = reason || 'Workflow cancelled by user';

    return this.instanceRepository.save(instance);
  }

  /**
   * Get workflow instance details
   */
  async getInstance(instanceId: string): Promise<WorkflowInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId },
    });

    if (!instance) {
      throw new BadRequestException('Workflow instance not found');
    }

    return instance;
  }

  /**
   * Get workflow instances by entity
   */
  async getInstancesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<WorkflowInstance[]> {
    return this.instanceRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Evaluate condition expression
   */
  private evaluateCondition(
    condition: string,
    variables: Record<string, any>,
  ): boolean {
    try {
      // Simple condition evaluation
      // Real implementation would use a proper expression parser
      const func = new Function(
        ...Object.keys(variables),
        `return ${condition}`,
      );
      return func(...Object.values(variables));
    } catch (error) {
      this.logger.error(`Error evaluating condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Execute script in sandboxed environment
   */
  private executeScriptSandboxed(
    code: string,
    variables: Record<string, any>,
  ): any {
    // Simplified implementation
    // Real implementation would use proper sandboxing
    try {
      const func = new Function(
        ...Object.keys(variables),
        code,
      );
      return func(...Object.values(variables));
    } catch (error) {
      throw new Error(`Script execution error: ${error.message}`);
    }
  }

  /**
   * Check if step is automated (doesn't require human interaction)
   */
  private isAutomatedStep(step: WorkflowStep): boolean {
    return ![StepType.TASK, StepType.WAIT, StepType.PARALLEL].includes(step.type);
  }
}
