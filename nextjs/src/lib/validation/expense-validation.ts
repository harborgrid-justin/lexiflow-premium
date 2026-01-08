/**
 * Expense Validation Module
 *
 * Provides comprehensive validation for expense entries including:
 * - Receipt requirement validation for amounts over $75
 * - Category validation against defined list
 * - Amount and date validation
 *
 * @module lib/validation/expense-validation
 */

import { z } from 'zod';

// =============================================================================
// Constants
// =============================================================================

/**
 * Threshold amount above which receipts are required
 * Based on IRS guidelines and firm policy
 */
export const RECEIPT_REQUIRED_THRESHOLD = 75;

/**
 * Maximum expense amount requiring special approval
 */
export const MAX_EXPENSE_AMOUNT = 100000;

/**
 * Valid expense categories for legal billing
 * Aligned with LEDES billing codes and firm policy
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
  'Court Costs',
  'Postage & Delivery',
  'Copying & Printing',
  'Lodging',
  'Meals',
  'Expert Witness Fees',
  'Process Server Fees',
  'Research Services',
  'Mediation Fees',
  'Recording Fees',
  'Investigation',
  'Technology & Software',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Input interface for expense validation
 */
export interface ExpenseInput {
  /** Unique identifier (optional for new expenses) */
  id?: string;
  /** Associated case identifier */
  caseId: string;
  /** User who created the expense */
  userId: string;
  /** Date of the expense */
  date: string;
  /** Expense amount */
  amount: number;
  /** Expense category */
  category: string;
  /** Description of the expense */
  description: string;
  /** Current status */
  status?: string;
  /** Whether the expense is reimbursable/billable */
  billable?: boolean;
  /** URL or path to receipt image/document */
  receiptUrl?: string;
  /** Vendor or merchant name */
  vendor?: string;
  /** Quantity (for unit-based expenses) */
  quantity?: number;
  /** Unit cost (for unit-based expenses) */
  unitCost?: number;
  /** Additional notes */
  notes?: string;
}

/**
 * Result of expense validation
 */
export interface ExpenseValidationResult {
  /** Whether the expense passed all validations */
  valid: boolean;
  /** Array of validation error messages */
  errors: string[];
  /** Sanitized expense data (only present if valid) */
  sanitized?: ExpenseInput;
  /** Specific field errors for form display */
  fieldErrors?: Record<string, string[]>;
}

/**
 * Receipt validation result
 */
export interface ReceiptValidationResult {
  /** Whether receipt is required */
  required: boolean;
  /** Whether receipt requirement is satisfied */
  satisfied: boolean;
  /** Validation message */
  message?: string;
}

// =============================================================================
// Core Validation Functions
// =============================================================================

/**
 * Determines if a receipt is required for the given expense amount
 *
 * Per IRS regulations and firm policy, expenses over $75 require
 * supporting documentation (receipts).
 *
 * @param amount - The expense amount to check
 * @returns True if the amount exceeds the receipt threshold
 *
 * @example
 * ```ts
 * requiresReceipt(50);   // false
 * requiresReceipt(75);   // false (not over, equal to threshold)
 * requiresReceipt(75.01); // true
 * requiresReceipt(100);  // true
 * ```
 */
export function requiresReceipt(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return false;
  }
  return amount > RECEIPT_REQUIRED_THRESHOLD;
}

/**
 * Validates receipt requirement for an expense
 *
 * @param amount - The expense amount
 * @param receiptUrl - Optional URL/path to receipt
 * @returns Validation result with requirement status
 *
 * @example
 * ```ts
 * validateReceiptRequirement(100, 'https://receipts.example.com/123.pdf');
 * // { required: true, satisfied: true }
 *
 * validateReceiptRequirement(100, undefined);
 * // { required: true, satisfied: false, message: 'Receipt required for expenses over $75' }
 *
 * validateReceiptRequirement(50, undefined);
 * // { required: false, satisfied: true }
 * ```
 */
export function validateReceiptRequirement(
  amount: number,
  receiptUrl?: string
): ReceiptValidationResult {
  const required = requiresReceipt(amount);

  if (!required) {
    return { required: false, satisfied: true };
  }

  const hasReceipt = Boolean(receiptUrl && receiptUrl.trim().length > 0);

  return {
    required: true,
    satisfied: hasReceipt,
    message: hasReceipt
      ? undefined
      : `Receipt required for expenses over $${RECEIPT_REQUIRED_THRESHOLD}`,
  };
}

/**
 * Validates an expense category against the allowed list
 *
 * @param category - The category to validate
 * @returns True if the category is valid
 *
 * @example
 * ```ts
 * isValidExpenseCategory('Travel');    // true
 * isValidExpenseCategory('Invalid');   // false
 * isValidExpenseCategory('');          // false
 * ```
 */
export function isValidExpenseCategory(category: string): category is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(category as ExpenseCategory);
}

/**
 * Validates a monetary amount
 *
 * @param amount - The amount to validate
 * @returns True if the amount is a valid positive number with max 2 decimal places
 */
export function isValidAmount(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return false;
  }
  if (amount < 0) {
    return false;
  }
  // Check max 2 decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
}

/**
 * Validates a date string
 *
 * @param dateStr - The date string to validate
 * @returns True if the date is valid
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Checks if a date is in the future
 *
 * @param dateStr - The date string to check
 * @returns True if the date is in the future
 */
export function isFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

/**
 * Sanitizes a string input by trimming whitespace and removing potentially harmful characters
 *
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove any remaining angle brackets
}

// =============================================================================
// Main Validation Function
// =============================================================================

/**
 * Validates an expense entry with comprehensive checks
 *
 * Performs the following validations:
 * - Required field presence (caseId, userId, date, amount, category, description)
 * - Date validity and not in future
 * - Amount validity (positive, max 2 decimal places)
 * - Amount within allowed limits
 * - Category against allowed list
 * - Description length (10-500 characters)
 * - Receipt requirement for amounts over $75
 *
 * @param expense - The expense input to validate
 * @returns Validation result with errors and sanitized data
 *
 * @example
 * ```ts
 * const result = validateExpense({
 *   caseId: 'case-123',
 *   userId: 'user-456',
 *   date: '2024-01-15',
 *   amount: 125.50,
 *   category: 'Travel',
 *   description: 'Airfare to client meeting in Chicago',
 *   receiptUrl: 'https://receipts.example.com/123.pdf'
 * });
 *
 * if (result.valid) {
 *   await saveExpense(result.sanitized);
 * } else {
 *   displayErrors(result.errors);
 * }
 * ```
 */
export function validateExpense(expense: ExpenseInput): ExpenseValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};

  const addError = (field: string, message: string) => {
    errors.push(message);
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(message);
  };

  try {
    // Required fields validation
    if (!expense.caseId || typeof expense.caseId !== 'string') {
      addError('caseId', 'Valid case ID is required');
    }

    if (!expense.userId || typeof expense.userId !== 'string') {
      addError('userId', 'Valid user ID is required');
    }

    // Date validation
    if (!expense.date || !isValidDate(expense.date)) {
      addError('date', 'Valid expense date is required');
    } else if (isFutureDate(expense.date)) {
      addError('date', 'Expense date cannot be in the future');
    }

    // Amount validation
    if (expense.amount === undefined || expense.amount === null) {
      addError('amount', 'Expense amount is required');
    } else if (!isValidAmount(expense.amount)) {
      addError('amount', 'Expense amount must be a positive number with max 2 decimal places');
    } else if (expense.amount > MAX_EXPENSE_AMOUNT) {
      addError(
        'amount',
        `Expense amount cannot exceed $${MAX_EXPENSE_AMOUNT.toLocaleString()} (requires special approval)`
      );
    } else if (expense.amount === 0) {
      addError('amount', 'Expense amount must be greater than zero');
    }

    // Category validation
    if (!expense.category) {
      addError('category', 'Expense category is required');
    } else if (!isValidExpenseCategory(expense.category)) {
      addError('category', `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`);
    }

    // Description validation
    if (!expense.description) {
      addError('description', 'Expense description is required');
    } else {
      const descLength = expense.description.trim().length;
      if (descLength < 10) {
        addError('description', 'Description must be at least 10 characters');
      } else if (descLength > 500) {
        addError('description', 'Description cannot exceed 500 characters');
      }
    }

    // Receipt requirement validation
    const receiptValidation = validateReceiptRequirement(expense.amount, expense.receiptUrl);
    if (receiptValidation.required && !receiptValidation.satisfied) {
      addError('receiptUrl', receiptValidation.message || 'Receipt is required');
    }

    // Vendor validation (optional but if provided, validate length)
    if (expense.vendor && expense.vendor.length > 255) {
      addError('vendor', 'Vendor name cannot exceed 255 characters');
    }

    // Notes validation (optional but if provided, validate length)
    if (expense.notes && expense.notes.length > 1000) {
      addError('notes', 'Notes cannot exceed 1000 characters');
    }

    // Quantity validation (if provided)
    if (expense.quantity !== undefined && expense.quantity !== null) {
      if (typeof expense.quantity !== 'number' || expense.quantity <= 0) {
        addError('quantity', 'Quantity must be a positive number');
      }
    }

    // Unit cost validation (if provided)
    if (expense.unitCost !== undefined && expense.unitCost !== null) {
      if (!isValidAmount(expense.unitCost)) {
        addError('unitCost', 'Unit cost must be a positive number with max 2 decimal places');
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors, fieldErrors };
    }

    // Sanitize inputs for safe storage
    const sanitized: ExpenseInput = {
      ...expense,
      description: sanitizeString(expense.description),
      vendor: expense.vendor ? sanitizeString(expense.vendor) : undefined,
      notes: expense.notes ? sanitizeString(expense.notes) : undefined,
    };

    return { valid: true, errors: [], sanitized };
  } catch (error) {
    return {
      valid: false,
      errors: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      fieldErrors: { _form: ['An unexpected validation error occurred'] },
    };
  }
}

// =============================================================================
// Zod Schema for Server-Side Validation
// =============================================================================

/**
 * Zod schema for expense category validation
 */
export const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES);

/**
 * Zod schema for expense validation
 *
 * Provides type-safe validation that can be used with React Hook Form
 * or direct server-side validation.
 */
export const expenseSchema = z
  .object({
    id: z.string().uuid().optional(),
    caseId: z.string().min(1, 'Case ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    date: z
      .string()
      .min(1, 'Date is required')
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
      .refine((val) => !isFutureDate(val), { message: 'Expense date cannot be in the future' }),
    amount: z
      .number({ message: 'Amount is required and must be a number' })
      .positive('Amount must be greater than zero')
      .max(MAX_EXPENSE_AMOUNT, `Amount cannot exceed $${MAX_EXPENSE_AMOUNT.toLocaleString()}`)
      .refine((val) => isValidAmount(val), {
        message: 'Amount must have at most 2 decimal places',
      }),
    category: z.string().refine((val) => isValidExpenseCategory(val), {
      message: `Category must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
    }),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description cannot exceed 500 characters'),
    status: z.string().optional(),
    billable: z.boolean().default(true),
    receiptUrl: z.string().url('Invalid receipt URL').optional().or(z.literal('')),
    vendor: z.string().max(255, 'Vendor name cannot exceed 255 characters').optional(),
    quantity: z.number().positive('Quantity must be positive').optional(),
    unitCost: z
      .number()
      .nonnegative('Unit cost cannot be negative')
      .refine((val) => isValidAmount(val), { message: 'Unit cost must have at most 2 decimal places' })
      .optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
  })
  .refine(
    (data) => {
      // Receipt requirement check
      if (requiresReceipt(data.amount)) {
        return Boolean(data.receiptUrl && data.receiptUrl.trim().length > 0);
      }
      return true;
    },
    {
      message: `Receipt is required for expenses over $${RECEIPT_REQUIRED_THRESHOLD}`,
      path: ['receiptUrl'],
    }
  );

/**
 * Type inferred from the Zod schema
 */
export type ExpenseSchemaInput = z.input<typeof expenseSchema>;
export type ExpenseSchemaOutput = z.output<typeof expenseSchema>;

/**
 * Validate expense using Zod schema
 *
 * @param data - The expense data to validate
 * @returns Zod safe parse result with success/error status and parsed data
 */
export function validateExpenseSchema(data: unknown) {
  return expenseSchema.safeParse(data);
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Formats an amount for display with receipt indicator
 *
 * @param amount - The expense amount
 * @returns Formatted string with receipt requirement indicator
 *
 * @example
 * ```ts
 * formatAmountWithReceiptIndicator(50);
 * // '$50.00'
 *
 * formatAmountWithReceiptIndicator(100);
 * // '$100.00 (receipt required)'
 * ```
 */
export function formatAmountWithReceiptIndicator(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

  return requiresReceipt(amount) ? `${formatted} (receipt required)` : formatted;
}

/**
 * Gets receipt requirement message for UI display
 *
 * @param amount - The expense amount
 * @returns Message string or undefined if no receipt required
 */
export function getReceiptRequirementMessage(amount: number): string | undefined {
  if (requiresReceipt(amount)) {
    return `Receipt required for expenses over $${RECEIPT_REQUIRED_THRESHOLD}`;
  }
  return undefined;
}
