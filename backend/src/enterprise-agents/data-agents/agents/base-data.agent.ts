/**
 * Base Data Agent
 *
 * Abstract base class for all data handling agents.
 *
 * @module BaseDataAgent
 * @version 1.0.0
 */

import { Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  DataAgentType,
  DataAgentTask,
  DataAgentResult,
} from '../interfaces/data-agent.interfaces';
import { DataAgentRegistry } from '../registry/data-agent-registry';
import { DataEventBus } from '../events/data-event-bus';
import { DataScratchpadManager } from '../scratchpad/data-scratchpad.manager';

export abstract class BaseDataAgent implements OnModuleInit, OnModuleDestroy {
  protected readonly logger: Logger;
  protected readonly agentId: string;
  protected isProcessing = false;

  constructor(
    protected readonly agentType: DataAgentType,
    protected readonly agentName: string,
    protected readonly capabilities: string[],
    protected readonly registry: DataAgentRegistry,
    protected readonly eventBus: DataEventBus,
    protected readonly scratchpad: DataScratchpadManager,
  ) {
    this.agentId = `${agentName.toLowerCase()}-${uuidv4().slice(0, 8)}`;
    this.logger = new Logger(agentName);
  }

  async onModuleInit(): Promise<void> {
    this.registry.register(
      this.agentId,
      this.agentType,
      this.agentName,
      this.capabilities,
    );

    this.eventBus.subscribe(this.agentId, `data.${this.agentType.toLowerCase()}.*`, async event => {
      await this.handleEvent(event);
    });

    await this.initialize();
    this.logger.log(`${this.agentName} initialized`);
  }

  async onModuleDestroy(): Promise<void> {
    this.registry.unregister(this.agentId);
    await this.cleanup();
    this.logger.log(`${this.agentName} destroyed`);
  }

  protected abstract initialize(): Promise<void>;
  protected abstract cleanup(): Promise<void>;
  protected abstract processTask(task: DataAgentTask): Promise<DataAgentResult>;

  protected async handleEvent(event: { type: string; payload: unknown }): Promise<void> {
    this.logger.debug(`Received event: ${event.type}`);
  }

  async execute(task: DataAgentTask): Promise<DataAgentResult> {
    const startTime = Date.now();
    this.isProcessing = true;
    this.registry.updateStatus(this.agentId, 'busy');

    try {
      const result = await this.processTask(task);
      result.processingTime = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime,
      };
    } finally {
      this.isProcessing = false;
      this.registry.updateStatus(this.agentId, 'idle');
    }
  }

  getAgentId(): string {
    return this.agentId;
  }

  isAvailable(): boolean {
    return !this.isProcessing;
  }
}
