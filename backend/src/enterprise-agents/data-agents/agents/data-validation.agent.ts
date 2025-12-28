/**
 * Data Validation Agent
 *
 * Validates data integrity, format, and business rules.
 *
 * @module DataValidationAgent
 * @version 1.0.0
 */

import { Injectable } from '@nestjs/common';
import { BaseDataAgent } from './base-data.agent';
import {
  DataAgentType,
  DataAgentTask,
  DataAgentResult,
  DataValidationResult,
} from '../interfaces/data-agent.interfaces';
import { DataAgentRegistry } from '../registry/data-agent-registry';
import { DataEventBus } from '../events/data-event-bus';
import { DataScratchpadManager } from '../scratchpad/data-scratchpad.manager';

@Injectable()
export class DataValidationAgent extends BaseDataAgent {
  constructor(
    registry: DataAgentRegistry,
    eventBus: DataEventBus,
    scratchpad: DataScratchpadManager,
  ) {
    super(
      DataAgentType.VALIDATION,
      'DataValidationAgent',
      ['data.validate', 'data.validate.schema', 'data.validate.business'],
      registry,
      eventBus,
      scratchpad,
    );
  }

  protected async initialize(): Promise<void> {
    this.logger.log('Loading validation rules...');
  }

  protected async cleanup(): Promise<void> {
    this.logger.log('Cleaning up validation resources...');
  }

  protected async processTask(task: DataAgentTask): Promise<DataAgentResult> {
    const payload = task.payload as { entity: string; records?: unknown[] };

    const validationResult: DataValidationResult = await this.validateData(
      payload.entity,
      payload.records || [],
    );

    return {
      taskId: task.id,
      success: validationResult.isValid,
      data: validationResult,
      processingTime: 0,
    };
  }

  async validateData(entity: string, records: unknown[]): Promise<DataValidationResult> {
    const errors = [];
    const warnings = [];
    let valid = 0;
    let invalid = 0;

    for (const record of records) {
      const recordErrors = this.validateRecord(entity, record);
      if (recordErrors.length === 0) {
        valid++;
      } else {
        invalid++;
        errors.push(...recordErrors);
      }
    }

    return {
      isValid: invalid === 0,
      errors,
      warnings,
      validatedAt: new Date(),
      recordsChecked: records.length,
      recordsValid: valid,
      recordsInvalid: invalid,
    };
  }

  private validateRecord(entity: string, record: unknown): { field: string; message: string }[] {
    const errors = [];
    const rec = record as Record<string, unknown>;

    // Common validations
    if (!rec.id) {
      errors.push({ field: 'id', message: 'ID is required' });
    }

    // Entity-specific validations
    switch (entity) {
      case 'user':
        if (!rec.email) errors.push({ field: 'email', message: 'Email is required' });
        if (!rec.firstName) errors.push({ field: 'firstName', message: 'First name is required' });
        break;
      case 'case':
        if (!rec.title) errors.push({ field: 'title', message: 'Title is required' });
        if (!rec.caseNumber) errors.push({ field: 'caseNumber', message: 'Case number is required' });
        break;
      case 'client':
        if (!rec.name) errors.push({ field: 'name', message: 'Name is required' });
        break;
    }

    return errors;
  }
}
