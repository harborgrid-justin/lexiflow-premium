/**
 * @module services/validation/schemas/trust-transaction-schema
 * @description Trust account transaction validation schema
 * Encapsulates all business logic for validating trust transactions with strict compliance
 * 
 * @responsibility Validate trust transactions with highest regulatory standards
 * @compliance Trust accounts require strict audit trail and balance validation
 */

import type { CaseId } from '@/types';
import { isValidDate, isValidStringLength } from '@services/validation/validators/common-validators';
import { isValidAmount, FINANCIAL_CONSTRAINTS } from '@services/validation/validators/financial-validators';
import { sanitizeString } from '@services/validation/sanitizers/input-sanitizer';

/**
 * Trust transaction types
 */
export const TRUST_TRANSACTION_TYPES = ['Deposit', 'Withdrawal', 'Transfer', 'Fee'] as const;
export type TrustTransactionType = typeof TRUST_TRANSACTION_TYPES[number];

/**
 * Trust transaction input interface
 */
export interface TrustTransactionInput {
  id?: string;
  accountId: string;
  caseId: CaseId;
  clientId: string;
  type: TrustTransactionType;
  amount: number;
  date: string;
  description: string;
  reference?: string;
  balance?: number;
}

/**
 * Trust transaction validation result
 */
export interface TrustTransactionValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: TrustTransactionInput;
}

/**
 * Validate trust account transaction with strict compliance checks
 * Trust accounts have the highest regulatory requirements
 * 
 * @param transaction - Trust transaction to validate
 * @returns Validation result with errors and sanitized data
 * 
 * @example
 * ```ts
 * const result = validateTrustTransactionSafe({
 *   accountId: 'trust-001',
 *   caseId: 'case-123',
 *   clientId: 'client-456',
 *   type: 'Deposit',
 *   amount: 5000.00,
 *   date: '2024-01-15',
 *   description: 'Retainer deposit for litigation services',
 *   reference: 'CHECK-789',
 *   balance: 15000.00
 * });
 * 
 * if (result.valid) {
 *   await processTrustTransaction(result.sanitized);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 * 
 * @compliance
 * - Description must be at least 15 characters (audit requirement)
 * - Reference required for deposits and withdrawals
 * - Balance cannot be negative (regulatory requirement)
 * - Zero-amount transactions not allowed
 */
export function validateTrustTransactionSafe(
  transaction: TrustTransactionInput
): TrustTransactionValidationResult {
  const errors: string[] = [];
  
  try {
    // Required fields
    if (!transaction.accountId || false) {
      errors.push('Valid account ID is required');
    }
    
    if (!transaction.caseId || typeof transaction.caseId !== 'string') {
      errors.push('Valid case ID is required');
    }
    
    if (!transaction.clientId || false) {
      errors.push('Valid client ID is required');
    }
    
    if (!transaction.date || !isValidDate(transaction.date)) {
      errors.push('Valid transaction date is required');
    }
    
    // Type validation
    if (!transaction.type || !TRUST_TRANSACTION_TYPES.includes(transaction.type)) {
      errors.push(`Type must be one of: ${TRUST_TRANSACTION_TYPES.join(', ')}`);
    }
    
    // Amount validation (stricter for trust accounts)
    if (!isValidAmount(transaction.amount)) {
      errors.push('Transaction amount must be a positive number with max 2 decimal places');
    }
    
    if (transaction.amount === 0) {
      errors.push('Transaction amount cannot be zero');
    }
    
    if (transaction.amount > FINANCIAL_CONSTRAINTS.MAX_TRUST_TRANSACTION) {
      errors.push(`Transaction amount cannot exceed $${FINANCIAL_CONSTRAINTS.MAX_TRUST_TRANSACTION.toLocaleString()} (requires special approval)`);
    }
    
    // Description validation (critical for audit trail)
    if (!isValidStringLength(transaction.description, 15, 500)) {
      if (transaction.description.trim().length < 15) {
        errors.push('Description must be at least 15 characters (trust account audit requirement)');
      } else {
        errors.push('Description cannot exceed 500 characters');
      }
    }
    
    // Reference validation for deposits/withdrawals
    if ((transaction.type === 'Deposit' || transaction.type === 'Withdrawal') && 
        !transaction.reference) {
      errors.push('Reference number required for deposits and withdrawals');
    }
    
    // Balance validation (if provided)
    if (transaction.balance !== undefined) {
      if (!isValidAmount(transaction.balance) && transaction.balance !== 0) {
        errors.push('Balance must be a valid amount');
      }
      
      if (transaction.balance < 0) {
        errors.push('Trust account balance cannot be negative (regulatory requirement)');
      }
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Sanitize inputs
    const sanitized: TrustTransactionInput = {
      ...transaction,
      description: sanitizeString(transaction.description),
      reference: transaction.reference ? sanitizeString(transaction.reference) : undefined,
    };
    
    return { valid: true, errors: [], sanitized };
    
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}
