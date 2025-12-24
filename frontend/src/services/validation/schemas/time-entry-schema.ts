/**
 * @module services/validation/schemas/time-entry-schema
 * @description Time entry validation schema
 * Encapsulates all business logic for validating time entries
 * 
 * @responsibility Validate time entry data with audit requirements
 */

import { WIPStatusEnum } from '@/types/enums';
import type { CaseId, UserId } from '@/types';
import { isValidDate, isFutureDate, isValidStringLength, isValidEnum } from '../validators/common-validators';
import { isValidDuration, isValidRate, FINANCIAL_CONSTRAINTS } from '../validators/financial-validators';
import { sanitizeString } from '../sanitizers/input-sanitizer';

/**
 * Time entry input interface
 */
export interface TimeEntryInput {
  id?: string;
  caseId: CaseId;
  userId: UserId;
  date: string;
  duration: number; // minutes
  description: string;
  rate?: number;
  billable?: boolean;
  status?: string;
  category?: string;
}

/**
 * Time entry validation result
 */
export interface TimeEntryValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: TimeEntryInput;
}

/**
 * Validate time entry with financial data integrity checks
 * Safe version that doesn't throw errors
 * 
 * @param entry - Time entry to validate
 * @returns Validation result with errors and sanitized data
 * 
 * @example
 * ```ts
 * const result = validateTimeEntrySafe({
 *   caseId: 'case-123',
 *   userId: 'user-456',
 *   date: '2024-01-15',
 *   duration: 60,
 *   description: 'Drafted motion for summary judgment'
 * });
 * 
 * if (result.valid) {
 *   await saveTimeEntry(result.sanitized);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateTimeEntrySafe(entry: TimeEntryInput): TimeEntryValidationResult {
  const errors: string[] = [];
  
  try {
    // Required fields
    if (!entry.caseId || typeof entry.caseId !== 'string') {
      errors.push('Valid case ID is required');
    }
    
    if (!entry.userId || typeof entry.userId !== 'string') {
      errors.push('Valid user ID is required');
    }
    
    if (!entry.date || !isValidDate(entry.date)) {
      errors.push('Valid ISO date is required');
    }
    
    // Date cannot be in future
    if (entry.date && isFutureDate(entry.date)) {
      errors.push('Time entry date cannot be in the future');
    }
    
    // Duration validation
    if (!isValidDuration(entry.duration)) {
      errors.push('Duration must be a positive integer (minutes)');
    }
    
    if (entry.duration > FINANCIAL_CONSTRAINTS.MAX_DAILY_DURATION) {
      errors.push(`Duration cannot exceed 24 hours (${FINANCIAL_CONSTRAINTS.MAX_DAILY_DURATION} minutes)`);
    }
    
    // Description validation (audit requirement)
    if (!isValidStringLength(entry.description, 10, 500)) {
      if (entry.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters (audit requirement)');
      } else {
        errors.push('Description cannot exceed 500 characters');
      }
    }
    
    // Rate validation
    if (entry.rate !== undefined && !isValidRate(entry.rate)) {
      errors.push(`Rate must be between $0 and $${FINANCIAL_CONSTRAINTS.MAX_HOURLY_RATE} with max 2 decimal places`);
    }
    
    // Status validation
    if (entry.status && !isValidEnum(entry.status, Object.values(WIPStatusEnum))) {
      errors.push(`Invalid status. Must be one of: ${Object.values(WIPStatusEnum).join(', ')}`);
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Sanitize inputs
    const sanitized: TimeEntryInput = {
      ...entry,
      description: sanitizeString(entry.description),
      category: entry.category ? sanitizeString(entry.category) : undefined,
    };
    
    return { valid: true, errors: [], sanitized };
    
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}
