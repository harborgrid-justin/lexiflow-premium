/**
 * Enterprise Agent 11: Coordinator Agent
 *
 * Central orchestrator for the multi-agent system. Manages agent lifecycle,
 * task distribution, load balancing, and system-wide coordination.
 * Implements the Orchestrator-Worker pattern.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { BaseAgent, createAgentMetadata } from '../core/base-agent';
import {
  ICoordinatorAgent,
  AgentType,
  AgentPriority,
  AgentTask,
  AgentEvent,
  AgentEventType,
  AgentMetadata,
  AgentHealth,
  AgentRegistrationRequest,
  AgentRegistrationResponse,
  
  TaskResult,
  
  CoordinatorCommand,
  CoordinatorCommandPayload,
} from '../interfaces/agent.interfaces';
import { AgentRegistry } from '../registry/agent-registry';
import { AgentEventBus } from '../events/agent-event-bus';

/**
 * Coordinator operation types
 */
export enum CoordinatorOperationType {
  REGISTER_AGENT = 'REGISTER_AGENT',
  UNREGISTER_AGENT = 'UNREGISTER_AGENT',
  ASSIGN_TASK = 'ASSIGN_TASK',
  REDISTRIBUTE_TASKS = 'REDISTRIBUTE_TASKS',
  EXECUTE_COMMAND = 'EXECUTE_COMMAND',
  BROADCAST_EVENT = 'BROADCAST_EVENT',
  GET_SYSTEM_STATUS = 'GET_SYSTEM_STATUS',
  SCALE_AGENTS = 'SCALE_AGENTS',
}

/**
 * Coordinator task payload
 */
export interface CoordinatorTaskPayload {
  operationType: CoordinatorOperationType;
  targetAgentId?: string;
  task?: AgentTask;
  command?: CoordinatorCommandPayload;
  event?: AgentEvent;
  scaleConfig?: { agentType: string; targetCount: number };
}

/**
 * Coordinator result
 */
export interface CoordinatorResult {
  operationType: CoordinatorOperationType;
  success: boolean;
  agentId?: string;
  taskId?: string;
  systemStatus?: SystemStatus;
  duration: number;
  errors: string[];
}

/**
 * System status
 */
export interface SystemStatus {
  totalAgents: number;
  activeAgents: number;
  pausedAgents: number;
  errorAgents: number;
  pendingTasks: number;
  processingTasks: number;
  completedTasks: number;
  failedTasks: number;
  systemHealth: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  lastCoordinationTime: Date;
}

/**
 * Pending task entry
 */
interface PendingTask {
  task: AgentTask;
  createdAt: Date;
  attempts: number;
  maxAttempts: number;
}

/**
 * Coordinator Agent
 * Central orchestrator for the multi-agent system
 */
@Injectable()
export class CoordinatorAgent extends BaseAgent implements ICoordinatorAgent, OnModuleInit, OnModuleDestroy {
  private readonly coordLogger = new Logger(CoordinatorAgent.name);
  private readonly pendingTasks: Map<string, PendingTask> = new Map();
  private readonly taskAssignments: Map<string, string> = new Map();
  private coordinationInterval?: NodeJS.Timeout;
  private readonly coordStartTime = Date.now();
  private coordCompletedTaskCount = 0;
  private coordFailedTaskCount = 0;

  constructor(
    eventEmitter: EventEmitter2,
    private readonly registry: AgentRegistry,
    private readonly eventBus: AgentEventBus,
  ) {
    super(
      createAgentMetadata(
        'CoordinatorAgent',
        AgentType.COORDINATOR,
        [
          'coordinator.register',
          'coordinator.unregister',
          'coordinator.assign',
          'coordinator.redistribute',
          'coordinator.command',
          'coordinator.broadcast',
          'coordinator.status',
          'coordinator.scale',
        ],
        {
          priority: AgentPriority.CRITICAL,
          maxConcurrentTasks: 100,
          heartbeatIntervalMs: 5000,
          healthCheckIntervalMs: 10000,
        },
      ),
      eventEmitter,
    );
  }

  /**
   * Initialize on module start
   */
  async onModuleInit(): Promise<void> {
    await this.initialize();
    await this.start();
    this.subscribeToEvents();
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }

  protected async onInitialize(): Promise<void> {
    this.coordLogger.log('Initializing Coordinator Agent');
  }

  protected async onStart(): Promise<void> {
    this.coordLogger.log('Coordinator Agent started');
    this.startCoordinationLoop();
  }

  protected async onStop(): Promise<void> {
    this.coordLogger.log('Coordinator Agent stopping');
    this.stopCoordinationLoop();
  }

  protected async onPause(): Promise<void> {
    this.coordLogger.log('Coordinator Agent paused');
  }

  protected async onResume(): Promise<void> {
    this.coordLogger.log('Coordinator Agent resumed');
  }

  protected async onEvent(event: AgentEvent): Promise<void> {
    switch (event.type) {
      case AgentEventType.TASK_COMPLETED:
        this.handleTaskCompleted(event);
        break;
      case AgentEventType.TASK_FAILED:
        this.handleTaskFailed(event);
        break;
      case AgentEventType.AGENT_ERROR:
        this.handleAgentError(event);
        break;
    }
  }

  protected async executeTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>,
  ): Promise<TResult> {
    const payload = task.payload as unknown as CoordinatorTaskPayload;

    switch (payload.operationType) {
      case CoordinatorOperationType.REGISTER_AGENT:
        return this.handleRegisterAgent(payload) as unknown as TResult;

      case CoordinatorOperationType.UNREGISTER_AGENT:
        return this.handleUnregisterAgent(payload) as unknown as TResult;

      case CoordinatorOperationType.ASSIGN_TASK:
        return this.handleAssignTask(payload) as unknown as TResult;

      case CoordinatorOperationType.REDISTRIBUTE_TASKS:
        return this.handleRedistributeTasks() as unknown as TResult;

      case CoordinatorOperationType.EXECUTE_COMMAND:
        return this.handleExecuteCommand(payload) as unknown as TResult;

      case CoordinatorOperationType.BROADCAST_EVENT:
        return this.handleBroadcastEvent(payload) as unknown as TResult;

      case CoordinatorOperationType.GET_SYSTEM_STATUS:
        return this.handleGetSystemStatus() as unknown as TResult;

      case CoordinatorOperationType.SCALE_AGENTS:
        return this.handleScaleAgents(payload) as unknown as TResult;

      default:
        throw new Error(`Unknown operation type: ${payload.operationType}`);
    }
  }

  /**
   * Register an agent with the coordinator
   */
  async registerAgent(request: AgentRegistrationRequest): Promise<AgentRegistrationResponse> {
    const agent = this.registry.getAgent(request.metadata.id);
    if (!agent) {
      return {
        success: false,
        agentId: request.metadata.id,
        registeredAt: new Date(),
        config: {},
        error: 'Agent not found in registry',
      };
    }

    await this.broadcastEvent(AgentEventType.AGENT_REGISTERED, {
      agentId: request.metadata.id,
      agentName: request.metadata.name,
      capabilities: request.metadata.capabilities,
    });

    return {
      success: true,
      agentId: request.metadata.id,
      registeredAt: new Date(),
      config: {},
    };
  }

  /**
   * Unregister an agent
   */
  async unregisterAgent(agentId: string): Promise<boolean> {
    const result = await this.registry.unregister(agentId);

    if (result) {
      await this.broadcastEvent(AgentEventType.AGENT_UNREGISTERED, { agentId });
    }

    return result;
  }

  /**
   * Get all registered agents
   */
  getRegisteredAgents(): AgentMetadata[] {
    return this.registry.getAllAgents();
  }

  /**
   * Get health for a specific agent
   */
  async getAgentHealth(agentId: string): Promise<AgentHealth | null> {
    return this.registry.getAgentHealth(agentId);
  }

  /**
   * Get health for all agents
   */
  async getAllAgentHealth(): Promise<Map<string, AgentHealth>> {
    return this.registry.getAllAgentHealth();
  }

  /**
   * Assign a task to an appropriate agent
   */
  async assignTask(task: AgentTask): Promise<string> {
    const requiredCapability = task.type;
    const agent = this.registry.findBestAgentForCapability(requiredCapability);

    if (!agent) {
      this.pendingTasks.set(task.id, {
        task,
        createdAt: new Date(),
        attempts: 0,
        maxAttempts: task.maxRetries,
      });
      return '';
    }

    const agentId = agent.metadata.id;
    this.taskAssignments.set(task.id, agentId);

    await this.emitEvent(AgentEventType.TASK_ASSIGNED, {
      taskId: task.id,
      agentId,
    });

    return agentId;
  }

  /**
   * Redistribute pending tasks
   */
  async redistributeTasks(): Promise<void> {
    this.coordLogger.log('Redistributing pending tasks');

    for (const [taskId, entry] of this.pendingTasks) {
      if (entry.attempts >= entry.maxAttempts) {
        this.pendingTasks.delete(taskId);
        this.coordFailedTaskCount++;
        continue;
      }

      const assignedAgent = await this.assignTask(entry.task);
      if (assignedAgent) {
        this.pendingTasks.delete(taskId);
        entry.attempts++;
      }
    }
  }

  /**
   * Execute a coordinator command
   */
  async executeCommand(command: CoordinatorCommandPayload): Promise<TaskResult> {
    const startTime = Date.now();

    try {
      switch (command.command) {
        case CoordinatorCommand.START_AGENT:
          for (const agentId of command.targetAgentIds ?? []) {
            await this.registry.startAgent(agentId);
          }
          break;

        case CoordinatorCommand.STOP_AGENT:
          for (const agentId of command.targetAgentIds ?? []) {
            await this.registry.stopAgent(agentId);
          }
          break;

        case CoordinatorCommand.PAUSE_AGENT:
          for (const agentId of command.targetAgentIds ?? []) {
            await this.registry.pauseAgent(agentId);
          }
          break;

        case CoordinatorCommand.RESUME_AGENT:
          for (const agentId of command.targetAgentIds ?? []) {
            await this.registry.resumeAgent(agentId);
          }
          break;

        case CoordinatorCommand.REDISTRIBUTE_TASKS:
          await this.redistributeTasks();
          break;

        case CoordinatorCommand.HEALTH_CHECK:
          await this.getAllAgentHealth();
          break;

        case CoordinatorCommand.SYNC_STATE:
          await this.broadcastEvent(AgentEventType.SYNC_REQUEST, {});
          break;

        case CoordinatorCommand.EMERGENCY_SHUTDOWN:
          this.coordLogger.warn('Emergency shutdown initiated');
          break;
      }

      return {
        success: true,
        processingTimeMs: Date.now() - startTime,
        metadata: { command: command.command },
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        processingTimeMs: Date.now() - startTime,
        metadata: { command: command.command },
      };
    }
  }

  /**
   * Broadcast an event to all agents
   */
  async broadcastEvent<T>(type: AgentEventType, payload: T): Promise<void> {
    await this.eventBus.publish(type, this.metadata.id, payload);
  }

  /**
   * Get system status
   */
  private getSystemStatus(): SystemStatus {
    const stats = this.registry.getStats();
    const processingTasks = this.taskAssignments.size;
    const pendingTaskCount = this.pendingTasks.size;

    let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (stats.errorAgents > 0) {
      systemHealth = stats.errorAgents > stats.totalAgents / 2 ? 'critical' : 'degraded';
    }

    return {
      totalAgents: stats.totalAgents,
      activeAgents: stats.activeAgents,
      pausedAgents: stats.pausedAgents,
      errorAgents: stats.errorAgents,
      pendingTasks: pendingTaskCount,
      processingTasks,
      completedTasks: this.coordCompletedTaskCount,
      failedTasks: this.coordFailedTaskCount,
      systemHealth,
      uptime: Date.now() - this.coordStartTime,
      lastCoordinationTime: new Date(),
    };
  }

  private async handleRegisterAgent(payload: CoordinatorTaskPayload): Promise<CoordinatorResult> {
    const startTime = Date.now();
    const agentId = payload.targetAgentId;

    this.coordLogger.log(`Registering agent: ${agentId ?? 'unknown'}`);

    return {
      operationType: CoordinatorOperationType.REGISTER_AGENT,
      success: true,
      agentId,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleUnregisterAgent(payload: CoordinatorTaskPayload): Promise<CoordinatorResult> {
    const startTime = Date.now();
    const success = await this.unregisterAgent(payload.targetAgentId ?? '');
    return {
      operationType: CoordinatorOperationType.UNREGISTER_AGENT,
      success,
      agentId: payload.targetAgentId,
      duration: Date.now() - startTime,
      errors: success ? [] : ['Agent not found'],
    };
  }

  private async handleAssignTask(payload: CoordinatorTaskPayload): Promise<CoordinatorResult> {
    const startTime = Date.now();
    const agentId = payload.task ? await this.assignTask(payload.task) : '';
    return {
      operationType: CoordinatorOperationType.ASSIGN_TASK,
      success: !!agentId,
      agentId,
      taskId: payload.task?.id,
      duration: Date.now() - startTime,
      errors: agentId ? [] : ['No suitable agent found'],
    };
  }

  private async handleRedistributeTasks(): Promise<CoordinatorResult> {
    const startTime = Date.now();
    await this.redistributeTasks();
    return {
      operationType: CoordinatorOperationType.REDISTRIBUTE_TASKS,
      success: true,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleExecuteCommand(payload: CoordinatorTaskPayload): Promise<CoordinatorResult> {
    const startTime = Date.now();
    if (!payload.command) {
      return {
        operationType: CoordinatorOperationType.EXECUTE_COMMAND,
        success: false,
        duration: Date.now() - startTime,
        errors: ['No command provided'],
      };
    }

    const result = await this.executeCommand(payload.command);
    return {
      operationType: CoordinatorOperationType.EXECUTE_COMMAND,
      success: result.success,
      duration: Date.now() - startTime,
      errors: result.error ? [result.error] : [],
    };
  }

  private async handleBroadcastEvent(payload: CoordinatorTaskPayload): Promise<CoordinatorResult> {
    const startTime = Date.now();
    if (payload.event) {
      await this.broadcastEvent(payload.event.type, payload.event.payload);
    }
    return {
      operationType: CoordinatorOperationType.BROADCAST_EVENT,
      success: true,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleGetSystemStatus(): Promise<CoordinatorResult> {
    const startTime = Date.now();
    const status = this.getSystemStatus();
    return {
      operationType: CoordinatorOperationType.GET_SYSTEM_STATUS,
      success: true,
      systemStatus: status,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private async handleScaleAgents(_payload: CoordinatorTaskPayload): Promise<CoordinatorResult> {
    const startTime = Date.now();

    this.coordLogger.log('Scaling agents');

    return {
      operationType: CoordinatorOperationType.SCALE_AGENTS,
      success: true,
      duration: Date.now() - startTime,
      errors: [],
    };
  }

  private handleTaskCompleted(event: AgentEvent): void {
    const payload = event.payload as { taskId: string };
    this.taskAssignments.delete(payload.taskId);
    this.coordCompletedTaskCount++;
  }

  private handleTaskFailed(event: AgentEvent): void {
    const payload = event.payload as { taskId: string };
    this.taskAssignments.delete(payload.taskId);
    this.coordFailedTaskCount++;
  }

  private handleAgentError(event: AgentEvent): void {
    const payload = event.payload as { agentId: string };
    this.coordLogger.warn(`Agent error reported: ${payload.agentId}`);
  }

  private subscribeToEvents(): void {
    this.eventBus.subscribe(this.metadata.id, '*', async event => {
      await this.handleEvent(event);
    });
  }

  private startCoordinationLoop(): void {
    this.coordinationInterval = setInterval(() => {
      this.performCoordinationCycle();
    }, 30000);
  }

  private stopCoordinationLoop(): void {
    if (this.coordinationInterval) {
      clearInterval(this.coordinationInterval);
      this.coordinationInterval = undefined;
    }
  }

  private async performCoordinationCycle(): Promise<void> {
    await this.redistributeTasks();
  }

  public getPendingTaskCount(): number {
    return this.pendingTasks.size;
  }

  public getActiveAssignmentCount(): number {
    return this.taskAssignments.size;
  }
}
