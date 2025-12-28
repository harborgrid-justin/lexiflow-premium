/**
 * Enterprise Agent System - Base Agent Implementation
 *
 * Abstract base class providing core functionality for all enterprise agents.
 * Implements lifecycle management, health monitoring, and event handling.
 *
 * @module EnterpriseAgents
 * @version 1.0.0
 * @enterprise true
 */

import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import {
  IAgent,
  AgentMetadata,
  AgentState,
  AgentHealth,
  AgentMetrics,
  AgentTask,
  TaskResult,
  TaskStatus,
  AgentEvent,
  AgentEventType,
  AgentPriority,
  AgentType,
} from '../interfaces/agent.interfaces';

/**
 * Abstract base agent class
 * Provides common functionality for all enterprise agents
 */
export abstract class BaseAgent implements IAgent {
  protected readonly logger: Logger;
  protected state: AgentState = AgentState.INITIALIZING;
  protected startTime: Date = new Date();
  protected activeTaskCount = 0;
  protected completedTaskCount = 0;
  protected failedTaskCount = 0;
  protected errorCount = 0;
  protected lastError?: string;
  protected lastHeartbeat: Date = new Date();
  protected heartbeatTimer?: NodeJS.Timeout;
  protected healthCheckTimer?: NodeJS.Timeout;
  protected processingTimes: number[] = [];
  protected memoryPeakMb = 0;
  protected cpuPeakPercent = 0;

  constructor(
    public readonly metadata: AgentMetadata,
    protected readonly eventEmitter: EventEmitter2,
  ) {
    this.logger = new Logger(`Agent:${metadata.name}`);
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    this.logger.log(`Initializing agent: ${this.metadata.name} (${this.metadata.id})`);
    this.state = AgentState.INITIALIZING;

    try {
      await this.onInitialize();
      this.state = AgentState.READY;
      this.logger.log(`Agent initialized successfully: ${this.metadata.name}`);

      await this.emitEvent(AgentEventType.AGENT_STATE_CHANGED, {
        previousState: AgentState.INITIALIZING,
        currentState: AgentState.READY,
      });
    } catch (error) {
      this.state = AgentState.ERROR;
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    if (this.state !== AgentState.READY && this.state !== AgentState.PAUSED) {
      throw new Error(`Cannot start agent in state: ${this.state}`);
    }

    this.logger.log(`Starting agent: ${this.metadata.name}`);
    const previousState = this.state;
    this.state = AgentState.PROCESSING;
    this.startTime = new Date();

    this.startHeartbeat();
    this.startHealthCheck();

    await this.onStart();

    await this.emitEvent(AgentEventType.AGENT_STATE_CHANGED, {
      previousState,
      currentState: AgentState.PROCESSING,
    });

    this.logger.log(`Agent started: ${this.metadata.name}`);
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    this.logger.log(`Stopping agent: ${this.metadata.name}`);
    const previousState = this.state;
    this.state = AgentState.SHUTDOWN;

    this.stopHeartbeat();
    this.stopHealthCheck();

    await this.onStop();

    await this.emitEvent(AgentEventType.AGENT_STATE_CHANGED, {
      previousState,
      currentState: AgentState.SHUTDOWN,
    });

    this.logger.log(`Agent stopped: ${this.metadata.name}`);
  }

  /**
   * Pause the agent
   */
  async pause(): Promise<void> {
    if (this.state !== AgentState.PROCESSING) {
      throw new Error(`Cannot pause agent in state: ${this.state}`);
    }

    this.logger.log(`Pausing agent: ${this.metadata.name}`);
    const previousState = this.state;
    this.state = AgentState.PAUSED;

    await this.onPause();

    await this.emitEvent(AgentEventType.AGENT_STATE_CHANGED, {
      previousState,
      currentState: AgentState.PAUSED,
    });
  }

  /**
   * Resume the agent
   */
  async resume(): Promise<void> {
    if (this.state !== AgentState.PAUSED) {
      throw new Error(`Cannot resume agent in state: ${this.state}`);
    }

    this.logger.log(`Resuming agent: ${this.metadata.name}`);
    const previousState = this.state;
    this.state = AgentState.PROCESSING;

    await this.onResume();

    await this.emitEvent(AgentEventType.AGENT_STATE_CHANGED, {
      previousState,
      currentState: AgentState.PROCESSING,
    });
  }

  /**
   * Get current agent state
   */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Get agent health status
   */
  async getHealth(): Promise<AgentHealth> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = await this.getCpuUsage();

    this.memoryPeakMb = Math.max(this.memoryPeakMb, memoryUsage.heapUsed / 1024 / 1024);
    this.cpuPeakPercent = Math.max(this.cpuPeakPercent, cpuUsage);

    return {
      agentId: this.metadata.id,
      state: this.state,
      uptime: Date.now() - this.startTime.getTime(),
      memoryUsage,
      cpuUsage,
      activeTaskCount: this.activeTaskCount,
      completedTaskCount: this.completedTaskCount,
      failedTaskCount: this.failedTaskCount,
      lastHeartbeat: this.lastHeartbeat,
      errorCount: this.errorCount,
      lastError: this.lastError,
      metrics: this.getMetrics(),
    };
  }

  /**
   * Get agent metrics
   */
  protected getMetrics(): AgentMetrics {
    const totalTasks = this.completedTaskCount + this.failedTaskCount;
    const avgProcessingTime = this.processingTimes.length > 0
      ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length
      : 0;

    const uptime = Date.now() - this.startTime.getTime();
    const uptimeMinutes = uptime / 60000;

    return {
      totalTasksProcessed: totalTasks,
      averageProcessingTimeMs: avgProcessingTime,
      successRate: totalTasks > 0 ? this.completedTaskCount / totalTasks : 1,
      throughputPerMinute: uptimeMinutes > 0 ? totalTasks / uptimeMinutes : 0,
      queueDepth: this.activeTaskCount,
      memoryPeakMb: this.memoryPeakMb,
      cpuPeakPercent: this.cpuPeakPercent,
    };
  }

  /**
   * Process a task
   */
  async processTask<TPayload, TResult>(
    task: AgentTask<TPayload, TResult>,
  ): Promise<TaskResult<TResult>> {
    if (this.state !== AgentState.PROCESSING) {
      return {
        success: false,
        error: `Agent not in processing state: ${this.state}`,
        processingTimeMs: 0,
        metadata: {},
      };
    }

    if (this.activeTaskCount >= this.metadata.maxConcurrentTasks) {
      return {
        success: false,
        error: 'Agent at maximum concurrent task capacity',
        processingTimeMs: 0,
        metadata: {},
      };
    }

    const startTime = Date.now();
    this.activeTaskCount++;
    task.status = TaskStatus.RUNNING;
    task.startedAt = new Date();

    await this.emitEvent(AgentEventType.TASK_STARTED, { taskId: task.id, agentId: this.metadata.id });

    try {
      const result = await this.executeTask(task);
      const processingTime = Date.now() - startTime;
      this.processingTimes.push(processingTime);

      if (this.processingTimes.length > 1000) {
        this.processingTimes.shift();
      }

      this.completedTaskCount++;
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();

      await this.emitEvent(AgentEventType.TASK_COMPLETED, {
        taskId: task.id,
        agentId: this.metadata.id,
        processingTimeMs: processingTime,
      });

      return {
        success: true,
        data: result,
        processingTimeMs: processingTime,
        metadata: { agentId: this.metadata.id },
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.failedTaskCount++;
      task.status = TaskStatus.FAILED;
      task.error = (error as Error).message;

      await this.emitEvent(AgentEventType.TASK_FAILED, {
        taskId: task.id,
        agentId: this.metadata.id,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
        processingTimeMs: processingTime,
        metadata: { agentId: this.metadata.id },
      };
    } finally {
      this.activeTaskCount--;
    }
  }

  /**
   * Handle incoming event
   */
  async handleEvent(event: AgentEvent): Promise<void> {
    this.logger.debug(`Received event: ${event.type} from ${event.sourceAgentId}`);
    await this.onEvent(event);
  }

  /**
   * Emit an event
   */
  async emitEvent<T>(
    type: AgentEventType,
    payload: T,
    targetAgentId?: string,
  ): Promise<void> {
    const event: AgentEvent<T> = {
      id: uuidv4(),
      type,
      sourceAgentId: this.metadata.id,
      targetAgentId,
      timestamp: new Date(),
      payload,
      priority: this.metadata.priority,
    };

    this.eventEmitter.emit(type, event);
    this.logger.debug(`Emitted event: ${type}`);
  }

  /**
   * Heartbeat callback
   */
  async onHeartbeat(): Promise<void> {
    this.lastHeartbeat = new Date();
    await this.emitEvent(AgentEventType.AGENT_HEALTH_UPDATE, await this.getHealth());
  }

  /**
   * Health check callback
   */
  async onHealthCheck(): Promise<AgentHealth> {
    return this.getHealth();
  }

  /**
   * Start heartbeat timer
   */
  protected startHeartbeat(): void {
    this.heartbeatTimer = setInterval(
      () => this.onHeartbeat(),
      this.metadata.heartbeatIntervalMs,
    );
  }

  /**
   * Stop heartbeat timer
   */
  protected stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  /**
   * Start health check timer
   */
  protected startHealthCheck(): void {
    this.healthCheckTimer = setInterval(
      () => this.onHealthCheck(),
      this.metadata.healthCheckIntervalMs,
    );
  }

  /**
   * Stop health check timer
   */
  protected stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Handle errors
   */
  protected handleError(error: Error): void {
    this.errorCount++;
    this.lastError = error.message;
    this.logger.error(`Agent error: ${error.message}`, error.stack);

    this.emitEvent(AgentEventType.AGENT_ERROR, {
      agentId: this.metadata.id,
      error: error.message,
      stack: error.stack,
    }).catch(err => this.logger.error('Failed to emit error event', err));
  }

  /**
   * Get CPU usage percentage
   */
  protected async getCpuUsage(): Promise<number> {
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);
    const totalUsage = (endUsage.user + endUsage.system) / 1000;
    return Math.min(100, totalUsage);
  }

  /**
   * Abstract methods to be implemented by concrete agents
   */
  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onPause(): Promise<void>;
  protected abstract onResume(): Promise<void>;
  protected abstract onEvent(event: AgentEvent): Promise<void>;
  protected abstract executeTask<TPayload, TResult>(task: AgentTask<TPayload, TResult>): Promise<TResult>;
}

/**
 * Create agent metadata helper
 */
export function createAgentMetadata(
  name: string,
  type: AgentType,
  capabilities: string[],
  options: Partial<AgentMetadata> = {},
): AgentMetadata {
  return {
    id: uuidv4(),
    name,
    version: '1.0.0',
    type,
    priority: options.priority ?? AgentPriority.NORMAL,
    capabilities,
    dependencies: options.dependencies ?? [],
    maxConcurrentTasks: options.maxConcurrentTasks ?? 10,
    heartbeatIntervalMs: options.heartbeatIntervalMs ?? 30000,
    healthCheckIntervalMs: options.healthCheckIntervalMs ?? 60000,
  };
}
