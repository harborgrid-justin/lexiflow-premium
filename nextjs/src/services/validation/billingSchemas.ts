/**
 * @module services/validation/billingSchemas
 * @description Native TypeScript validation schemas for billing operations
 * Provides runtime type checking, financial data validation, and XSS prevention
 * 
 * **REFACTORED**: This file now re-exports from focused, single-responsibility modules
 * 
 * Architecture:
 * - validators/financial-validators.ts - Financial data validation utilities
 * - validators/common-validators.ts - Common validation utilities
 * - sanitizers/input-sanitizer.ts - XSS prevention and sanitization
 * - schemas/time-entry-schema.ts - Time entry validation
 * - schemas/invoice-schema.ts - Invoice validation
 * - schemas/expense-schema.ts - Expense validation
 * - schemas/trust-transaction-schema.ts - Trust transaction validation
 * - schemas/billing-filters-schema.ts - Billing filters validation
 * 
 * @security Includes amount validation, date validation, and XSS sanitization
 * @compliance Enforces financial data integrity and audit trail requirements
 */

// Financial validators
export {
  FINANCIAL_CONSTRAINTS,
  isValidAmount,
  isValidRate,
  isValidDuration,
  requiresReceipt,
  validateLineItemCalculation,
  validateInvoiceTotal
} from './validators/financial-validators';

// Common validators
export {
  isValidEmail,
  isValidDate,
  isFutureDate,
  isValidDateRange,
  isValidStringLength,
  isValidInvoiceNumber,
  isValidEnum
} from './validators/common-validators';

// Sanitizers
export {
  sanitizeString,
  sanitizeWithPunctuation,
  sanitizeHTML,
  sanitizeArray,
  sanitizeObject
} from './sanitizers/input-sanitizer';

// Time Entry Schema
export type {
  TimeEntryInput,
  TimeEntryValidationResult
} from './schemas/time-entry-schema';
export { validateTimeEntrySafe } from './schemas/time-entry-schema';

// Invoice Schema
export type {
  InvoiceInput,
  InvoiceItem,
  InvoiceValidationResult
} from './schemas/invoice-schema';
export { validateInvoiceSafe } from './schemas/invoice-schema';

// Expense Schema
export type {
  ExpenseInput,
  ExpenseValidationResult,
  ExpenseCategory
} from './schemas/expense-schema';
export { EXPENSE_CATEGORIES, validateExpenseSafe } from './schemas/expense-schema';

// Trust Transaction Schema
export type {
  TrustTransactionInput,
  TrustTransactionValidationResult,
  TrustTransactionType
} from './schemas/trust-transaction-schema';
export { 
  TRUST_TRANSACTION_TYPES, 
  validateTrustTransactionSafe 
} from './schemas/trust-transaction-schema';

// Billing Filters Schema
export type {
  BillingFiltersInput,
  BillingFiltersValidationResult
} from './schemas/billing-filters-schema';
export { validateBillingFiltersSafe } from './schemas/billing-filters-schema';

/**
 * BACKWARDS COMPATIBILITY
 * 
 * All previous exports are maintained to avoid breaking changes.
 * Consumers can continue using the same imports:
 * 
 * ```ts
 * import { validateTimeEntrySafe, validateInvoiceSafe } from 'services/validation/billingSchemas';
 * ```
 * 
 * New code should import from specific modules for better tree-shaking:
 * 
 * ```ts
 * import { validateTimeEntrySafe } from 'services/validation/schemas/time-entry-schema';
 * import { isValidAmount } from 'services/validation/validators/financial-validators';
 * ```
 */

// Legacy code removed - all implementations moved to focused modules
// This file now serves as a backwards-compatible barrel export
