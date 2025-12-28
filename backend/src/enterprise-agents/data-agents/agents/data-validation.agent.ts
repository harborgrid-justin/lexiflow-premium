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
  DataValidationError,
  DataValidationWarning,
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
    const errors: DataValidationError[] = [];
    const warnings: DataValidationWarning[] = [];
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

  private validateRecord(entity: string, record: unknown): DataValidationError[] {
    const errors: DataValidationError[] = [];
    const rec = record as Record<string, unknown>;
    const recordId = rec.id as string | undefined;

    const addError = (field: string, message: string): void => {
      errors.push({
        field,
        value: rec[field],
        rule: 'required',
        message,
        severity: 'error',
        recordId,
      });
    };

    // Common validations
    if (!rec.id) {
      addError('id', 'ID is required');
    }

    // Entity-specific validations
    switch (entity) {
      case 'user':
        if (!rec.email) addError('email', 'Email is required');
        if (!rec.firstName) addError('firstName', 'First name is required');
        break;
      case 'case':
        if (!rec.title) addError('title', 'Title is required');
        if (!rec.caseNumber) addError('caseNumber', 'Case number is required');
        break;
      case 'client':
        if (!rec.name) addError('name', 'Name is required');
        break;
    }

    return errors;
  }
}
