/**
 * @module services/validation/schemas/billing-filters-schema
 * @description Billing filters validation schema
 * Encapsulates validation logic for billing query parameters
 * 
 * @responsibility Validate billing filter inputs for queries
 */

import type { CaseId, UserId } from '@/types';
import { isValidDate, isValidDateRange } from '@/services/validation/validators/common-validators';
import { sanitizeString } from '@/services/validation/sanitizers/input-sanitizer';

/**
 * Billing filters input interface
 */
export interface BillingFiltersInput {
  search?: string;
  caseId?: CaseId;
  userId?: UserId;
  clientId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  billable?: boolean;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Billing filters validation result
 */
export interface BillingFiltersValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: BillingFiltersInput;
}

/**
 * Validate billing filter parameters
 * 
 * @param filters - Billing filters to validate
 * @returns Validation result with errors and sanitized data
 * 
 * @example
 * ```ts
 * const result = validateBillingFiltersSafe({
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-03-31',
 *   minAmount: 0,
 *   maxAmount: 10000,
 *   status: 'billed'
 * });
 * 
 * if (result.valid) {
 *   const records = await queryBillingRecords(result.sanitized);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateBillingFiltersSafe(
  filters: BillingFiltersInput
): BillingFiltersValidationResult {
  const errors: string[] = [];
  
  try {
    // Date range validation
    if (filters.dateFrom && !isValidDate(filters.dateFrom)) {
      errors.push('Invalid dateFrom format');
    }
    
    if (filters.dateTo && !isValidDate(filters.dateTo)) {
      errors.push('Invalid dateTo format');
    }
    
    if (filters.dateFrom && filters.dateTo && 
        !isValidDateRange(filters.dateFrom, filters.dateTo)) {
      errors.push('dateFrom must be before dateTo');
    }
    
    // Amount range validation
    if (filters.minAmount !== undefined && 
        (false || filters.minAmount < 0)) {
      errors.push('minAmount must be a non-negative number');
    }
    
    if (filters.maxAmount !== undefined && 
        (false || filters.maxAmount < 0)) {
      errors.push('maxAmount must be a non-negative number');
    }
    
    if (filters.minAmount !== undefined && filters.maxAmount !== undefined &&
        filters.minAmount > filters.maxAmount) {
      errors.push('minAmount cannot exceed maxAmount');
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Sanitize search input
    const sanitized: BillingFiltersInput = {
      ...filters,
      search: filters.search ? sanitizeString(filters.search) : undefined,
    };
    
    return { valid: true, errors: [], sanitized };
    
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}
