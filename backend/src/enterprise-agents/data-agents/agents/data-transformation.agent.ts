/**
 * Data Transformation Agent
 *
 * Transforms data between formats and applies field mappings.
 *
 * @module DataTransformationAgent
 * @version 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { BaseDataAgent } from './base-data.agent';
import { DataAgentType, DataAgentTask, DataAgentResult } from '../interfaces/data-agent.interfaces';
import { DataAgentRegistry } from '../registry/data-agent-registry';
import { DataEventBus } from '../events/data-event-bus';
import { DataScratchpadManager } from '../scratchpad/data-scratchpad.manager';

@Injectable()
export class DataTransformationAgent extends BaseDataAgent {
  constructor(registry: DataAgentRegistry, eventBus: DataEventBus, scratchpad: DataScratchpadManager) {
    super(DataAgentType.TRANSFORMATION, 'DataTransformationAgent', ['data.transform', 'data.map', 'data.convert'], registry, eventBus, scratchpad);
  }

  protected async initialize(): Promise<void> { this.logger.log('Transformation agent ready'); }
  protected async cleanup(): Promise<void> { this.logger.log('Transformation agent cleanup'); }

  protected async processTask(task: DataAgentTask): Promise<DataAgentResult> {
    const { data, mappings } = task.payload as { data: unknown[]; mappings: Record<string, string> };
    const transformed = data.map(item => this.transformRecord(item as Record<string, unknown>, mappings));
    return { taskId: task.id, success: true, data: transformed, processingTime: 0 };
  }

  private transformRecord(record: Record<string, unknown>, mappings: Record<string, string>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [source, target] of Object.entries(mappings)) {
      result[target] = record[source];
    }
    return result;
  }
}
