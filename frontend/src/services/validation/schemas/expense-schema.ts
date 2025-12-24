/**
 * @module services/validation/schemas/expense-schema
 * @description Expense validation schema
 * Encapsulates all business logic for validating expenses
 * 
 * @responsibility Validate expense data with receipt requirements
 */

import { ExpenseStatusEnum } from '@/types/enums';
import type { CaseId, UserId } from '../../../types';
import { isValidDate, isFutureDate, isValidStringLength, isValidEnum } from '../validators/common-validators';
import { isValidAmount, requiresReceipt, FINANCIAL_CONSTRAINTS } from '../validators/financial-validators';
import { sanitizeString } from '../sanitizers/input-sanitizer';

/**
 * Valid expense categories
 */
export const EXPENSE_CATEGORIES = [
  'Travel',
  'Filing Fees',
  'Expert Fees',
  'Deposition Costs',
  'Research',
  'Copying',
  'Postage',
  'Technology',
  'Other'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

/**
 * Expense input interface
 */
export interface ExpenseInput {
  id?: string;
  caseId: CaseId;
  userId: UserId;
  date: string;
  amount: number;
  category: string;
  description: string;
  status?: string;
  reimbursable?: boolean;
  receiptUrl?: string;
  vendor?: string;
}

/**
 * Expense validation result
 */
export interface ExpenseValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: ExpenseInput;
}

/**
 * Validate expense with financial integrity checks
 * 
 * @param expense - Expense to validate
 * @returns Validation result with errors and sanitized data
 * 
 * @example
 * ```ts
 * const result = validateExpenseSafe({
 *   caseId: 'case-123',
 *   userId: 'user-456',
 *   date: '2024-01-15',
 *   amount: 125.50,
 *   category: 'Travel',
 *   description: 'Airfare to deposition in Chicago',
 *   receiptUrl: 'https://...'
 * });
 * 
 * if (result.valid) {
 *   await saveExpense(result.sanitized);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateExpenseSafe(expense: ExpenseInput): ExpenseValidationResult {
  const errors: string[] = [];
  
  try {
    // Required fields
    if (!expense.caseId || typeof expense.caseId !== 'string') {
      errors.push('Valid case ID is required');
    }
    
    if (!expense.userId || typeof expense.userId !== 'string') {
      errors.push('Valid user ID is required');
    }
    
    if (!expense.date || !isValidDate(expense.date)) {
      errors.push('Valid expense date is required');
    }
    
    // Date validation
    if (expense.date && isFutureDate(expense.date)) {
      errors.push('Expense date cannot be in the future');
    }
    
    // Amount validation
    if (!isValidAmount(expense.amount)) {
      errors.push('Expense amount must be a positive number with max 2 decimal places');
    }
    
    if (expense.amount > FINANCIAL_CONSTRAINTS.MAX_EXPENSE_AMOUNT) {
      errors.push(`Expense amount cannot exceed $${FINANCIAL_CONSTRAINTS.MAX_EXPENSE_AMOUNT.toLocaleString()} (requires special approval)`);
    }
    
    // Category validation
    if (!expense.category || !EXPENSE_CATEGORIES.includes(expense.category as ExpenseCategory)) {
      errors.push(`Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`);
    }
    
    // Description validation
    if (!isValidStringLength(expense.description, 10, 500)) {
      if (expense.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters');
      } else {
        errors.push('Description cannot exceed 500 characters');
      }
    }
    
    // Status validation
    if (expense.status && !isValidEnum(expense.status, Object.values(ExpenseStatusEnum))) {
      errors.push(`Invalid status. Must be one of: ${Object.values(ExpenseStatusEnum).join(', ')}`);
    }
    
    // Receipt requirement for high amounts
    if (requiresReceipt(expense.amount) && !expense.receiptUrl) {
      errors.push(`Receipt required for expenses over $${FINANCIAL_CONSTRAINTS.RECEIPT_REQUIRED_THRESHOLD}`);
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Sanitize inputs
    const sanitized: ExpenseInput = {
      ...expense,
      description: sanitizeString(expense.description),
      vendor: expense.vendor ? sanitizeString(expense.vendor) : undefined,
    };
    
    return { valid: true, errors: [], sanitized };
    
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}
