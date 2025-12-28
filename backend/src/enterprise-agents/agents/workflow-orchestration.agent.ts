/**
 * Enterprise Agent 05: Workflow Orchestration Agent
 *
 * Manages workflow execution, task scheduling, process automation,
 * and business process orchestration across the enterprise system.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseAgent, createAgentMetadata } from '../core/base-agent';
import {
  AgentType,
  AgentPriority,
  AgentTask,
  AgentEvent,
} from '../interfaces/agent.interfaces';

/**
 * Workflow operation types
 */
export enum WorkflowOperationType {
  START_WORKFLOW = 'START_WORKFLOW',
  STOP_WORKFLOW = 'STOP_WORKFLOW',
  PAUSE_WORKFLOW = 'PAUSE_WORKFLOW',
  RESUME_WORKFLOW = 'RESUME_WORKFLOW',
  EXECUTE_STEP = 'EXECUTE_STEP',
  EVALUATE_CONDITION = 'EVALUATE_CONDITION',
  TRIGGER_EVENT = 'TRIGGER_EVENT',
  SCHEDULE_TASK = 'SCHEDULE_TASK',
}

/**
 * Workflow status
 */
export enum WorkflowStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Workflow task payload
 */
export interface WorkflowTaskPayload {
  operationType: WorkflowOperationType;
  workflowId?: string;
  workflowDefinitionId?: string;
  stepId?: string;
  context?: Record<string, unknown>;
  scheduledAt?: Date;
}

/**
 * Workflow result
 */
export interface WorkflowResult {
  operationType: WorkflowOperationType;
  workflowId?: string;
  status: WorkflowStatus;
  currentStep?: string;
  completedSteps: string[];
  output?: Record<string, unknown>;
  errors: string[];
  duration: number;
}

/**
 * Workflow instance
 */
interface WorkflowInstance {
  id: string;
  definitionId: string;
  status: WorkflowStatus;
  currentStepIndex: number;
  steps: WorkflowStep[];
  context: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  errors: string[];
}

/**
 * Workflow step
 */
interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'parallel' | 'wait';
  config: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  output?: Record<string, unknown>;
  error?: string;
}

/**
 * Workflow Orchestration Agent
 * Manages workflow execution and process automation
 */
@Injectable()
export class WorkflowOrchestrationAgent extends BaseAgent {
  private readonly workflowLogger = new Logger(WorkflowOrchestrationAgent.name);
  private readonly activeWorkflows: Map<string, WorkflowInstance> = new Map();
  private readonly scheduledTasks: Map<string, NodeJS.Timeout> = new Map();

  constructor(eventEmitter: EventEmitter2) {
    super(
      createAgentMetadata(
        'WorkflowOrchestrationAgent',
        AgentType.WORKER,
        [
          'workflow.start',
          'workflow.stop',
          'workflow.pause',
          'workflow.resume',
          'workflow.step.execute',
          'workflow.condition.evaluate',
          'workflow.event.trigger',
          'workflow.task.schedule',
        ],
        {
          priority: AgentPriority.HIGH,
          maxConcurrentTasks: 15,
          heartbeatIntervalMs: 15000,
          healthCheckIntervalMs: 30000,
        },
      ),
      eventEmitter,
    );
  }

  protected async onInitialize(): Promise<void> {
    this.workflowLogger.log('Initializing Workflow Orchestration Agent');
  }

  protected async onStart(): Promise<void> {
    this.workflowLogger.log('Workflow Orchestration Agent started');
  }

  protected async onStop(): Promise<void> {
    this.workflowLogger.log('Workflow Orchestration Agent stopping');
    this.cancelAllScheduledTasks();
  }

  protected async onPause(): Promise<void> {
    this.workflowLogger.log('Workflow Orchestration Agent paused');
  }

  protected async onResume(): Promise<void> {
    this.workflowLogger.log('Workflow Orchestration Agent resumed');
  }

  protected async onEvent(event: AgentEvent): Promise<void> {
    this.workflowLogger.debug(`Received event: ${event.type}`);
  }

  protected async executeTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>,
  ): Promise<TResult> {
    const payload = task.payload as unknown as WorkflowTaskPayload;

    switch (payload.operationType) {
      case WorkflowOperationType.START_WORKFLOW:
        return this.startWorkflow(payload) as unknown as TResult;

      case WorkflowOperationType.STOP_WORKFLOW:
        return this.stopWorkflow(payload) as unknown as TResult;

      case WorkflowOperationType.PAUSE_WORKFLOW:
        return this.pauseWorkflow(payload) as unknown as TResult;

      case WorkflowOperationType.RESUME_WORKFLOW:
        return this.resumeWorkflow(payload) as unknown as TResult;

      case WorkflowOperationType.EXECUTE_STEP:
        return this.executeStep(payload) as unknown as TResult;

      case WorkflowOperationType.EVALUATE_CONDITION:
        return this.evaluateCondition(payload) as unknown as TResult;

      case WorkflowOperationType.TRIGGER_EVENT:
        return this.triggerEvent(payload) as unknown as TResult;

      case WorkflowOperationType.SCHEDULE_TASK:
        return this.scheduleTask(payload) as unknown as TResult;

      default:
        throw new Error(`Unknown operation type: ${payload.operationType}`);
    }
  }

  private async startWorkflow(payload: WorkflowTaskPayload): Promise<WorkflowResult> {
    const startTime = Date.now();
    const workflowId = `wf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const instance: WorkflowInstance = {
      id: workflowId,
      definitionId: payload.workflowDefinitionId ?? 'default',
      status: WorkflowStatus.RUNNING,
      currentStepIndex: 0,
      steps: [],
      context: payload.context ?? {},
      startedAt: new Date(),
      errors: [],
    };

    this.activeWorkflows.set(workflowId, instance);

    return {
      operationType: WorkflowOperationType.START_WORKFLOW,
      workflowId,
      status: WorkflowStatus.RUNNING,
      completedSteps: [],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async stopWorkflow(payload: WorkflowTaskPayload): Promise<WorkflowResult> {
    const startTime = Date.now();
    const instance = this.activeWorkflows.get(payload.workflowId ?? '');

    if (!instance) {
      return {
        operationType: WorkflowOperationType.STOP_WORKFLOW,
        status: WorkflowStatus.FAILED,
        completedSteps: [],
        errors: ['Workflow not found'],
        duration: Date.now() - startTime,
      };
    }

    instance.status = WorkflowStatus.CANCELLED;
    instance.completedAt = new Date();

    return {
      operationType: WorkflowOperationType.STOP_WORKFLOW,
      workflowId: payload.workflowId,
      status: WorkflowStatus.CANCELLED,
      completedSteps: instance.steps.filter(s => s.status === 'completed').map(s => s.id),
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async pauseWorkflow(payload: WorkflowTaskPayload): Promise<WorkflowResult> {
    const startTime = Date.now();
    const instance = this.activeWorkflows.get(payload.workflowId ?? '');

    if (!instance) {
      return {
        operationType: WorkflowOperationType.PAUSE_WORKFLOW,
        status: WorkflowStatus.FAILED,
        completedSteps: [],
        errors: ['Workflow not found'],
        duration: Date.now() - startTime,
      };
    }

    instance.status = WorkflowStatus.PAUSED;

    return {
      operationType: WorkflowOperationType.PAUSE_WORKFLOW,
      workflowId: payload.workflowId,
      status: WorkflowStatus.PAUSED,
      completedSteps: instance.steps.filter(s => s.status === 'completed').map(s => s.id),
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async resumeWorkflow(payload: WorkflowTaskPayload): Promise<WorkflowResult> {
    const startTime = Date.now();
    const instance = this.activeWorkflows.get(payload.workflowId ?? '');

    if (!instance) {
      return {
        operationType: WorkflowOperationType.RESUME_WORKFLOW,
        status: WorkflowStatus.FAILED,
        completedSteps: [],
        errors: ['Workflow not found'],
        duration: Date.now() - startTime,
      };
    }

    instance.status = WorkflowStatus.RUNNING;

    return {
      operationType: WorkflowOperationType.RESUME_WORKFLOW,
      workflowId: payload.workflowId,
      status: WorkflowStatus.RUNNING,
      completedSteps: instance.steps.filter(s => s.status === 'completed').map(s => s.id),
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async executeStep(payload: WorkflowTaskPayload): Promise<WorkflowResult> {
    const startTime = Date.now();

    return {
      operationType: WorkflowOperationType.EXECUTE_STEP,
      workflowId: payload.workflowId,
      status: WorkflowStatus.RUNNING,
      currentStep: payload.stepId,
      completedSteps: [],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async evaluateCondition(payload: WorkflowTaskPayload): Promise<WorkflowResult> {
    const startTime = Date.now();

    return {
      operationType: WorkflowOperationType.EVALUATE_CONDITION,
      workflowId: payload.workflowId,
      status: WorkflowStatus.RUNNING,
      completedSteps: [],
      output: { conditionMet: true },
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async triggerEvent(payload: WorkflowTaskPayload): Promise<WorkflowResult> {
    const startTime = Date.now();

    return {
      operationType: WorkflowOperationType.TRIGGER_EVENT,
      status: WorkflowStatus.COMPLETED,
      completedSteps: [],
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async scheduleTask(payload: WorkflowTaskPayload): Promise<WorkflowResult> {
    const startTime = Date.now();
    const taskId = `task-${Date.now()}`;

    if (payload.scheduledAt) {
      const delay = payload.scheduledAt.getTime() - Date.now();
      if (delay > 0) {
        const timeout = setTimeout(() => {
          this.workflowLogger.log(`Executing scheduled task: ${taskId}`);
          this.scheduledTasks.delete(taskId);
        }, delay);
        this.scheduledTasks.set(taskId, timeout);
      }
    }

    return {
      operationType: WorkflowOperationType.SCHEDULE_TASK,
      status: WorkflowStatus.PENDING,
      completedSteps: [],
      output: { taskId },
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private cancelAllScheduledTasks(): void {
    for (const [taskId, timeout] of this.scheduledTasks) {
      clearTimeout(timeout);
      this.workflowLogger.debug(`Cancelled scheduled task: ${taskId}`);
    }
    this.scheduledTasks.clear();
  }

  public getActiveWorkflowCount(): number {
    return this.activeWorkflows.size;
  }

  public getScheduledTaskCount(): number {
    return this.scheduledTasks.size;
  }
}
