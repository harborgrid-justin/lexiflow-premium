/**
 * @module services/validation/billingSchemas
 * @description Native TypeScript validation schemas for billing operations
 * Provides runtime type checking, financial data validation, and XSS prevention
 * without external dependencies (reusing pattern from evidenceSchemas.ts)
 * 
 * Security: Includes amount validation, date validation, and XSS sanitization
 * Compliance: Enforces financial data integrity and audit trail requirements
 */

import { 
  InvoiceStatusEnum, 
  PaymentStatusEnum, 
  WIPStatusEnum, 
  ExpenseStatusEnum,
  TrustAccountStatusEnum 
} from '../../types/enums';
import type { CaseId, UserId } from '../../types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
function sanitizeString(str: string): string {
  return str
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .trim();
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate ISO date string
 */
function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate monetary amount (positive, max 2 decimal places)
 */
function isValidAmount(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  if (amount < 0) return false;
  // Check max 2 decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
}

/**
 * Validate duration in minutes (positive integer)
 */
function isValidDuration(duration: number): boolean {
  return typeof duration === 'number' && 
         duration > 0 && 
         Number.isInteger(duration);
}

/**
 * Validate rate (positive, max 2 decimal places)
 */
function isValidRate(rate: number): boolean {
  if (typeof rate !== 'number' || isNaN(rate)) return false;
  if (rate < 0 || rate > 10000) return false; // Max $10,000/hour
  const decimalPlaces = (rate.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
}

// ============================================================================
// TIME ENTRY VALIDATION
// ============================================================================

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

export interface TimeEntryValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: TimeEntryInput;
}

/**
 * Validate time entry with financial data integrity checks
 * Safe version that doesn't throw errors
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
    if (entry.date && new Date(entry.date) > new Date()) {
      errors.push('Time entry date cannot be in the future');
    }
    
    // Duration validation
    if (!isValidDuration(entry.duration)) {
      errors.push('Duration must be a positive integer (minutes)');
    }
    
    if (entry.duration > 1440) { // 24 hours
      errors.push('Duration cannot exceed 24 hours (1440 minutes)');
    }
    
    // Description validation (audit requirement)
    if (!entry.description || entry.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters (audit requirement)');
    }
    
    if (entry.description && entry.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
    
    // Rate validation
    if (entry.rate !== undefined && !isValidRate(entry.rate)) {
      errors.push('Rate must be between $0 and $10,000 with max 2 decimal places');
    }
    
    // Status validation
    if (entry.status && !Object.values(WIPStatusEnum).includes(entry.status as any)) {
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

// ============================================================================
// INVOICE VALIDATION
// ============================================================================

export interface InvoiceInput {
  id?: string;
  caseId: CaseId;
  clientId: string;
  invoiceNumber?: string;
  date: string;
  dueDate: string;
  amount: number;
  tax?: number;
  discount?: number;
  status: string;
  items?: InvoiceItem[];
  notes?: string;
  billingAddress?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: InvoiceInput;
}

/**
 * Validate invoice with financial integrity checks
 */
export function validateInvoiceSafe(invoice: InvoiceInput): InvoiceValidationResult {
  const errors: string[] = [];
  
  try {
    // Required fields
    if (!invoice.caseId || typeof invoice.caseId !== 'string') {
      errors.push('Valid case ID is required');
    }
    
    if (!invoice.clientId || typeof invoice.clientId !== 'string') {
      errors.push('Valid client ID is required');
    }
    
    if (!invoice.date || !isValidDate(invoice.date)) {
      errors.push('Valid invoice date is required');
    }
    
    if (!invoice.dueDate || !isValidDate(invoice.dueDate)) {
      errors.push('Valid due date is required');
    }
    
    // Due date must be after invoice date
    if (invoice.date && invoice.dueDate && 
        new Date(invoice.dueDate) < new Date(invoice.date)) {
      errors.push('Due date must be after invoice date');
    }
    
    // Amount validation
    if (!isValidAmount(invoice.amount)) {
      errors.push('Invoice amount must be a positive number with max 2 decimal places');
    }
    
    if (invoice.amount > 10000000) { // $10M limit
      errors.push('Invoice amount cannot exceed $10,000,000');
    }
    
    // Tax validation
    if (invoice.tax !== undefined && !isValidAmount(invoice.tax)) {
      errors.push('Tax must be a valid amount with max 2 decimal places');
    }
    
    // Discount validation
    if (invoice.discount !== undefined) {
      if (!isValidAmount(invoice.discount)) {
        errors.push('Discount must be a valid amount with max 2 decimal places');
      }
      if (invoice.discount > invoice.amount) {
        errors.push('Discount cannot exceed invoice amount');
      }
    }
    
    // Status validation
    if (!Object.values(InvoiceStatusEnum).includes(invoice.status as any)) {
      errors.push(`Invalid status. Must be one of: ${Object.values(InvoiceStatusEnum).join(', ')}`);
    }
    
    // Invoice number format (if provided)
    if (invoice.invoiceNumber && !/^INV-\d{6,}$/.test(invoice.invoiceNumber)) {
      errors.push('Invoice number must be in format INV-XXXXXX');
    }
    
    // Line items validation
    if (invoice.items) {
      if (invoice.items.length === 0) {
        errors.push('Invoice must have at least one line item');
      }
      
      let calculatedTotal = 0;
      invoice.items.forEach((item, index) => {
        if (!item.description || item.description.trim().length < 5) {
          errors.push(`Item ${index + 1}: Description must be at least 5 characters`);
        }
        if (item.quantity <= 0 || !Number.isFinite(item.quantity)) {
          errors.push(`Item ${index + 1}: Invalid quantity`);
        }
        if (!isValidRate(item.rate)) {
          errors.push(`Item ${index + 1}: Invalid rate`);
        }
        if (!isValidAmount(item.amount)) {
          errors.push(`Item ${index + 1}: Invalid amount`);
        }
        
        // Verify amount = quantity * rate
        const expected = item.quantity * item.rate;
        if (Math.abs(item.amount - expected) > 0.01) {
          errors.push(`Item ${index + 1}: Amount mismatch (expected ${expected.toFixed(2)})`);
        }
        
        calculatedTotal += item.amount;
      });
      
      // Verify total matches sum of items (before tax/discount)
      const subtotal = invoice.amount - (invoice.tax || 0) + (invoice.discount || 0);
      if (Math.abs(calculatedTotal - subtotal) > 0.01) {
        errors.push('Invoice total does not match sum of line items');
      }
    }
    
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    // Sanitize inputs
    const sanitized: InvoiceInput = {
      ...invoice,
      notes: invoice.notes ? sanitizeString(invoice.notes) : undefined,
      billingAddress: invoice.billingAddress ? sanitizeString(invoice.billingAddress) : undefined,
      items: invoice.items?.map(item => ({
        ...item,
        description: sanitizeString(item.description)
      }))
    };
    
    return { valid: true, errors: [], sanitized };
    
  } catch (error) {
    return { 
      valid: false, 
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
    };
  }
}

// ============================================================================
// EXPENSE VALIDATION
// ============================================================================

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

export interface ExpenseValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: ExpenseInput;
}

/**
 * Validate expense with financial integrity checks
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
    if (expense.date && new Date(expense.date) > new Date()) {
      errors.push('Expense date cannot be in the future');
    }
    
    // Amount validation
    if (!isValidAmount(expense.amount)) {
      errors.push('Expense amount must be a positive number with max 2 decimal places');
    }
    
    if (expense.amount > 100000) { // $100k limit
      errors.push('Expense amount cannot exceed $100,000 (requires special approval)');
    }
    
    // Category validation
    const validCategories = [
      'Travel', 'Filing Fees', 'Expert Fees', 'Deposition Costs',
      'Research', 'Copying', 'Postage', 'Technology', 'Other'
    ];
    
    if (!expense.category || !validCategories.includes(expense.category)) {
      errors.push(`Category must be one of: ${validCategories.join(', ')}`);
    }
    
    // Description validation
    if (!expense.description || expense.description.trim().length < 10) {
      errors.push('Description must be at least 10 characters');
    }
    
    if (expense.description && expense.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
    }
    
    // Status validation
    if (expense.status && !Object.values(ExpenseStatusEnum).includes(expense.status as any)) {
      errors.push(`Invalid status. Must be one of: ${Object.values(ExpenseStatusEnum).join(', ')}`);
    }
    
    // Receipt requirement for high amounts
    if (expense.amount > 75 && !expense.receiptUrl) {
      errors.push('Receipt required for expenses over $75');
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

// ============================================================================
// TRUST TRANSACTION VALIDATION
// ============================================================================

export interface TrustTransactionInput {
  id?: string;
  accountId: string;
  caseId: CaseId;
  clientId: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Fee';
  amount: number;
  date: string;
  description: string;
  reference?: string;
  balance?: number;
}

export interface TrustTransactionValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: TrustTransactionInput;
}

/**
 * Validate trust account transaction with strict compliance checks
 * Trust accounts have the highest regulatory requirements
 */
export function validateTrustTransactionSafe(
  transaction: TrustTransactionInput
): TrustTransactionValidationResult {
  const errors: string[] = [];
  
  try {
    // Required fields
    if (!transaction.accountId || typeof transaction.accountId !== 'string') {
      errors.push('Valid account ID is required');
    }
    
    if (!transaction.caseId || typeof transaction.caseId !== 'string') {
      errors.push('Valid case ID is required');
    }
    
    if (!transaction.clientId || typeof transaction.clientId !== 'string') {
      errors.push('Valid client ID is required');
    }
    
    if (!transaction.date || !isValidDate(transaction.date)) {
      errors.push('Valid transaction date is required');
    }
    
    // Type validation
    const validTypes = ['Deposit', 'Withdrawal', 'Transfer', 'Fee'];
    if (!transaction.type || !validTypes.includes(transaction.type)) {
      errors.push(`Type must be one of: ${validTypes.join(', ')}`);
    }
    
    // Amount validation (stricter for trust accounts)
    if (!isValidAmount(transaction.amount)) {
      errors.push('Transaction amount must be a positive number with max 2 decimal places');
    }
    
    if (transaction.amount === 0) {
      errors.push('Transaction amount cannot be zero');
    }
    
    if (transaction.amount > 1000000) { // $1M limit
      errors.push('Transaction amount cannot exceed $1,000,000 (requires special approval)');
    }
    
    // Description validation (critical for audit trail)
    if (!transaction.description || transaction.description.trim().length < 15) {
      errors.push('Description must be at least 15 characters (trust account audit requirement)');
    }
    
    if (transaction.description && transaction.description.length > 500) {
      errors.push('Description cannot exceed 500 characters');
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

// ============================================================================
// BILLING FILTERS VALIDATION
// ============================================================================

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

export interface BillingFiltersValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: BillingFiltersInput;
}

/**
 * Validate billing filter parameters
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
        new Date(filters.dateFrom) > new Date(filters.dateTo)) {
      errors.push('dateFrom must be before dateTo');
    }
    
    // Amount range validation
    if (filters.minAmount !== undefined && 
        (typeof filters.minAmount !== 'number' || filters.minAmount < 0)) {
      errors.push('minAmount must be a non-negative number');
    }
    
    if (filters.maxAmount !== undefined && 
        (typeof filters.maxAmount !== 'number' || filters.maxAmount < 0)) {
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
