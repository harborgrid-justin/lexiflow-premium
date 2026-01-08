/**
 * Financial Constraints Validation Module
 *
 * Comprehensive validation utilities for financial operations including
 * hourly rates, invoice amounts, expense limits, trust transactions,
 * and billing time calculations.
 *
 * These constraints are aligned with the frontend validation at:
 * frontend/src/services/validation/validators/financial-validators.ts
 *
 * @module validation/financial-constraints
 */

// =============================================================================
// Financial Constraints Constants
// =============================================================================

/**
 * Financial constraint limits for billing validation.
 * All monetary values are in USD.
 */
export const FINANCIAL_CONSTRAINTS = {
  /** Maximum hourly rate: $10,000 */
  MAX_HOURLY_RATE: 10000,

  /** Maximum invoice amount: $10,000,000 */
  MAX_INVOICE_AMOUNT: 10000000,

  /** Maximum expense amount: $100,000 */
  MAX_EXPENSE_AMOUNT: 100000,

  /** Receipt required threshold: $75 */
  RECEIPT_REQUIRED_THRESHOLD: 75,

  /** Maximum trust transaction amount: $1,000,000 */
  MAX_TRUST_TRANSACTION: 1000000,

  /** Maximum decimal places for monetary values */
  MAX_DECIMAL_PLACES: 2,

  /** Maximum daily duration in minutes (24 hours) */
  MAX_DAILY_DURATION: 1440,

  /** Billing increment in hours (6 minutes = 0.1 hours) */
  BILLING_INCREMENT_HOURS: 0.1,

  /** Minimum hourly rate: $0.01 */
  MIN_HOURLY_RATE: 0.01,

  /** Minimum billable duration in hours (6 minutes) */
  MIN_BILLABLE_DURATION: 0.1,
} as const;

/**
 * Type representing the financial constraints configuration
 */
export type FinancialConstraints = typeof FINANCIAL_CONSTRAINTS;

// =============================================================================
// Validation Result Types
// =============================================================================

/**
 * Result of a financial validation check
 */
export interface FinancialValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Warning message for advisory notices (e.g., receipt recommended) */
  warning?: string;
  /** The original value that was validated */
  value: number;
  /** Corrected or rounded value if applicable */
  correctedValue?: number;
}

/**
 * Batch validation result for multiple fields
 */
export interface BatchValidationResult {
  /** Whether all validations passed */
  valid: boolean;
  /** Individual field validation results */
  results: Record<string, FinancialValidationResult>;
  /** Aggregated error messages */
  errors: string[];
  /** Aggregated warning messages */
  warnings: string[];
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validates that an hourly rate is within acceptable limits.
 *
 * @param rate - The hourly rate to validate (in dollars)
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateHourlyRate(500);
 * // { valid: true, value: 500 }
 *
 * const invalid = validateHourlyRate(15000);
 * // { valid: false, value: 15000, error: "Hourly rate cannot exceed $10,000.00" }
 * ```
 */
export function validateHourlyRate(rate: number): FinancialValidationResult {
  if (typeof rate !== 'number' || isNaN(rate)) {
    return {
      valid: false,
      error: 'Hourly rate must be a valid number',
      value: rate,
    };
  }

  if (rate < 0) {
    return {
      valid: false,
      error: 'Hourly rate cannot be negative',
      value: rate,
    };
  }

  if (rate < FINANCIAL_CONSTRAINTS.MIN_HOURLY_RATE && rate !== 0) {
    return {
      valid: false,
      error: `Hourly rate must be at least $${FINANCIAL_CONSTRAINTS.MIN_HOURLY_RATE.toFixed(2)}`,
      value: rate,
    };
  }

  if (rate > FINANCIAL_CONSTRAINTS.MAX_HOURLY_RATE) {
    return {
      valid: false,
      error: `Hourly rate cannot exceed $${FINANCIAL_CONSTRAINTS.MAX_HOURLY_RATE.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      value: rate,
    };
  }

  const decimalResult = validateDecimalPlaces(rate);
  if (!decimalResult.valid) {
    return {
      valid: false,
      error: `Hourly rate ${decimalResult.error}`,
      value: rate,
      correctedValue: decimalResult.correctedValue,
    };
  }

  return { valid: true, value: rate };
}

/**
 * Validates that an invoice amount is within acceptable limits.
 *
 * @param amount - The invoice total amount to validate (in dollars)
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateInvoiceAmount(25000);
 * // { valid: true, value: 25000 }
 *
 * const invalid = validateInvoiceAmount(15000000);
 * // { valid: false, value: 15000000, error: "Invoice amount cannot exceed $10,000,000.00" }
 * ```
 */
export function validateInvoiceAmount(amount: number): FinancialValidationResult {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      valid: false,
      error: 'Invoice amount must be a valid number',
      value: amount,
    };
  }

  if (amount < 0) {
    return {
      valid: false,
      error: 'Invoice amount cannot be negative',
      value: amount,
    };
  }

  if (amount > FINANCIAL_CONSTRAINTS.MAX_INVOICE_AMOUNT) {
    return {
      valid: false,
      error: `Invoice amount cannot exceed $${FINANCIAL_CONSTRAINTS.MAX_INVOICE_AMOUNT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      value: amount,
    };
  }

  const decimalResult = validateDecimalPlaces(amount);
  if (!decimalResult.valid) {
    return {
      valid: false,
      error: `Invoice amount ${decimalResult.error}`,
      value: amount,
      correctedValue: decimalResult.correctedValue,
    };
  }

  return { valid: true, value: amount };
}

/**
 * Validates that an expense amount is within acceptable limits.
 * Also provides a warning if receipt is required based on threshold.
 *
 * @param amount - The expense amount to validate (in dollars)
 * @param hasReceipt - Optional flag indicating if a receipt is attached
 * @returns Validation result with error/warning messages
 *
 * @example
 * ```typescript
 * const result = validateExpenseAmount(50);
 * // { valid: true, value: 50 }
 *
 * const withWarning = validateExpenseAmount(100, false);
 * // { valid: true, value: 100, warning: "Receipt required for expenses over $75.00" }
 *
 * const invalid = validateExpenseAmount(150000);
 * // { valid: false, value: 150000, error: "Expense amount cannot exceed $100,000.00" }
 * ```
 */
export function validateExpenseAmount(
  amount: number,
  hasReceipt?: boolean
): FinancialValidationResult {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      valid: false,
      error: 'Expense amount must be a valid number',
      value: amount,
    };
  }

  if (amount < 0) {
    return {
      valid: false,
      error: 'Expense amount cannot be negative',
      value: amount,
    };
  }

  if (amount > FINANCIAL_CONSTRAINTS.MAX_EXPENSE_AMOUNT) {
    return {
      valid: false,
      error: `Expense amount cannot exceed $${FINANCIAL_CONSTRAINTS.MAX_EXPENSE_AMOUNT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      value: amount,
    };
  }

  const decimalResult = validateDecimalPlaces(amount);
  if (!decimalResult.valid) {
    return {
      valid: false,
      error: `Expense amount ${decimalResult.error}`,
      value: amount,
      correctedValue: decimalResult.correctedValue,
    };
  }

  // Check receipt requirement
  if (amount > FINANCIAL_CONSTRAINTS.RECEIPT_REQUIRED_THRESHOLD && hasReceipt === false) {
    return {
      valid: true,
      value: amount,
      warning: `Receipt required for expenses over $${FINANCIAL_CONSTRAINTS.RECEIPT_REQUIRED_THRESHOLD.toFixed(2)}`,
    };
  }

  return { valid: true, value: amount };
}

/**
 * Validates that a trust transaction amount is within acceptable limits.
 *
 * @param amount - The trust transaction amount to validate (in dollars)
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateTrustTransaction(50000);
 * // { valid: true, value: 50000 }
 *
 * const invalid = validateTrustTransaction(2000000);
 * // { valid: false, value: 2000000, error: "Trust transaction cannot exceed $1,000,000.00" }
 * ```
 */
export function validateTrustTransaction(amount: number): FinancialValidationResult {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      valid: false,
      error: 'Trust transaction amount must be a valid number',
      value: amount,
    };
  }

  if (amount < 0) {
    return {
      valid: false,
      error: 'Trust transaction amount cannot be negative',
      value: amount,
    };
  }

  if (amount === 0) {
    return {
      valid: false,
      error: 'Trust transaction amount must be greater than zero',
      value: amount,
    };
  }

  if (amount > FINANCIAL_CONSTRAINTS.MAX_TRUST_TRANSACTION) {
    return {
      valid: false,
      error: `Trust transaction cannot exceed $${FINANCIAL_CONSTRAINTS.MAX_TRUST_TRANSACTION.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      value: amount,
    };
  }

  const decimalResult = validateDecimalPlaces(amount);
  if (!decimalResult.valid) {
    return {
      valid: false,
      error: `Trust transaction amount ${decimalResult.error}`,
      value: amount,
      correctedValue: decimalResult.correctedValue,
    };
  }

  return { valid: true, value: amount };
}

/**
 * Validates that a monetary amount has at most the allowed decimal places.
 *
 * @param amount - The amount to validate
 * @returns Validation result with corrected value if too many decimals
 *
 * @example
 * ```typescript
 * const result = validateDecimalPlaces(100.50);
 * // { valid: true, value: 100.50 }
 *
 * const invalid = validateDecimalPlaces(100.555);
 * // { valid: false, value: 100.555, error: "cannot have more than 2 decimal places", correctedValue: 100.56 }
 * ```
 */
export function validateDecimalPlaces(amount: number): FinancialValidationResult {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return {
      valid: false,
      error: 'must be a valid number',
      value: amount,
    };
  }

  // Handle floating point precision issues
  const amountStr = amount.toString();
  const decimalIndex = amountStr.indexOf('.');

  if (decimalIndex === -1) {
    // No decimal places
    return { valid: true, value: amount };
  }

  const decimalPlaces = amountStr.length - decimalIndex - 1;

  if (decimalPlaces > FINANCIAL_CONSTRAINTS.MAX_DECIMAL_PLACES) {
    const correctedValue = roundToDecimalPlaces(amount, FINANCIAL_CONSTRAINTS.MAX_DECIMAL_PLACES);
    return {
      valid: false,
      error: `cannot have more than ${FINANCIAL_CONSTRAINTS.MAX_DECIMAL_PLACES} decimal places`,
      value: amount,
      correctedValue,
    };
  }

  return { valid: true, value: amount };
}

/**
 * Validates that a daily duration is within acceptable limits.
 *
 * @param minutes - The duration in minutes to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateDailyDuration(480); // 8 hours
 * // { valid: true, value: 480 }
 *
 * const invalid = validateDailyDuration(1500); // 25 hours
 * // { valid: false, value: 1500, error: "Daily duration cannot exceed 1440 minutes (24 hours)" }
 * ```
 */
export function validateDailyDuration(minutes: number): FinancialValidationResult {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return {
      valid: false,
      error: 'Duration must be a valid number',
      value: minutes,
    };
  }

  if (minutes < 0) {
    return {
      valid: false,
      error: 'Duration cannot be negative',
      value: minutes,
    };
  }

  if (minutes > FINANCIAL_CONSTRAINTS.MAX_DAILY_DURATION) {
    return {
      valid: false,
      error: `Daily duration cannot exceed ${FINANCIAL_CONSTRAINTS.MAX_DAILY_DURATION} minutes (24 hours)`,
      value: minutes,
    };
  }

  return { valid: true, value: minutes };
}

/**
 * Validates that an hours-based duration is within acceptable limits.
 *
 * @param hours - The duration in hours to validate
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateDailyHours(8);
 * // { valid: true, value: 8 }
 *
 * const invalid = validateDailyHours(25);
 * // { valid: false, value: 25, error: "Daily hours cannot exceed 24 hours" }
 * ```
 */
export function validateDailyHours(hours: number): FinancialValidationResult {
  if (typeof hours !== 'number' || isNaN(hours)) {
    return {
      valid: false,
      error: 'Hours must be a valid number',
      value: hours,
    };
  }

  if (hours < 0) {
    return {
      valid: false,
      error: 'Hours cannot be negative',
      value: hours,
    };
  }

  const maxHours = FINANCIAL_CONSTRAINTS.MAX_DAILY_DURATION / 60;
  if (hours > maxHours) {
    return {
      valid: false,
      error: `Daily hours cannot exceed ${maxHours} hours`,
      value: hours,
    };
  }

  if (hours > 0 && hours < FINANCIAL_CONSTRAINTS.MIN_BILLABLE_DURATION) {
    return {
      valid: false,
      error: `Minimum billable time is ${FINANCIAL_CONSTRAINTS.MIN_BILLABLE_DURATION} hours (${FINANCIAL_CONSTRAINTS.MIN_BILLABLE_DURATION * 60} minutes)`,
      value: hours,
      correctedValue: FINANCIAL_CONSTRAINTS.MIN_BILLABLE_DURATION,
    };
  }

  return { valid: true, value: hours };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Rounds hours to the nearest billing increment (0.1 hours / 6 minutes).
 * This is the standard billing increment for legal time tracking.
 *
 * @param hours - The hours to round
 * @returns Hours rounded to nearest 0.1 (6-minute) increment
 *
 * @example
 * ```typescript
 * roundToBillingIncrement(1.23); // 1.2
 * roundToBillingIncrement(1.25); // 1.3
 * roundToBillingIncrement(0.08); // 0.1
 * roundToBillingIncrement(2.54); // 2.5
 * ```
 */
export function roundToBillingIncrement(hours: number): number {
  if (typeof hours !== 'number' || isNaN(hours)) {
    return 0;
  }

  if (hours < 0) {
    return 0;
  }

  const increment = FINANCIAL_CONSTRAINTS.BILLING_INCREMENT_HOURS;
  const rounded = Math.round(hours / increment) * increment;

  // Ensure minimum billable duration if not zero
  if (hours > 0 && rounded < FINANCIAL_CONSTRAINTS.MIN_BILLABLE_DURATION) {
    return FINANCIAL_CONSTRAINTS.MIN_BILLABLE_DURATION;
  }

  // Round to avoid floating point precision issues
  return Number(rounded.toFixed(1));
}

/**
 * Rounds a number to a specified number of decimal places.
 *
 * @param value - The value to round
 * @param decimals - The number of decimal places
 * @returns The rounded value
 *
 * @example
 * ```typescript
 * roundToDecimalPlaces(100.555, 2); // 100.56
 * roundToDecimalPlaces(100.554, 2); // 100.55
 * ```
 */
export function roundToDecimalPlaces(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Formats a monetary amount as a USD currency string.
 *
 * @param amount - The amount to format
 * @returns Formatted currency string
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56); // "$1,234.56"
 * formatCurrency(1000000); // "$1,000,000.00"
 * ```
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: FINANCIAL_CONSTRAINTS.MAX_DECIMAL_PLACES,
    maximumFractionDigits: FINANCIAL_CONSTRAINTS.MAX_DECIMAL_PLACES,
  }).format(amount);
}

/**
 * Checks if a receipt is required for an expense amount.
 *
 * @param amount - The expense amount
 * @returns Whether a receipt is required
 *
 * @example
 * ```typescript
 * isReceiptRequired(50);  // false
 * isReceiptRequired(75);  // false (exactly at threshold)
 * isReceiptRequired(100); // true
 * ```
 */
export function isReceiptRequired(amount: number): boolean {
  return amount > FINANCIAL_CONSTRAINTS.RECEIPT_REQUIRED_THRESHOLD;
}

/**
 * Converts minutes to hours, rounded to billing increment.
 *
 * @param minutes - Duration in minutes
 * @returns Duration in hours, rounded to 0.1 hour increments
 *
 * @example
 * ```typescript
 * minutesToBillableHours(90);  // 1.5
 * minutesToBillableHours(65);  // 1.1
 * minutesToBillableHours(5);   // 0.1 (minimum)
 * ```
 */
export function minutesToBillableHours(minutes: number): number {
  const hours = minutes / 60;
  return roundToBillingIncrement(hours);
}

/**
 * Converts hours to minutes.
 *
 * @param hours - Duration in hours
 * @returns Duration in minutes
 *
 * @example
 * ```typescript
 * hoursToMinutes(1.5); // 90
 * hoursToMinutes(0.1); // 6
 * ```
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60);
}

// =============================================================================
// Batch Validation
// =============================================================================

/**
 * Validates multiple financial fields at once.
 *
 * @param fields - Object with field names and their values/validators
 * @returns Batch validation result with all errors and warnings
 *
 * @example
 * ```typescript
 * const result = validateFinancialFields({
 *   hourlyRate: { value: 500, validator: validateHourlyRate },
 *   expenseAmount: { value: 100, validator: (v) => validateExpenseAmount(v, false) },
 * });
 * ```
 */
export function validateFinancialFields(
  fields: Record<string, { value: number; validator: (value: number) => FinancialValidationResult }>
): BatchValidationResult {
  const results: Record<string, FinancialValidationResult> = {};
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [fieldName, { value, validator }] of Object.entries(fields)) {
    const result = validator(value);
    results[fieldName] = result;

    if (!result.valid && result.error) {
      errors.push(`${fieldName}: ${result.error}`);
    }
    if (result.warning) {
      warnings.push(`${fieldName}: ${result.warning}`);
    }
  }

  return {
    valid: errors.length === 0,
    results,
    errors,
    warnings,
  };
}

/**
 * Validates a time entry's financial fields.
 *
 * @param entry - Object containing rate, hours, and optional calculated total
 * @returns Batch validation result
 *
 * @example
 * ```typescript
 * const result = validateTimeEntry({
 *   rate: 350,
 *   hours: 2.5,
 * });
 * ```
 */
export function validateTimeEntry(entry: {
  rate: number;
  hours: number;
  total?: number;
}): BatchValidationResult {
  const fields: Record<string, { value: number; validator: (value: number) => FinancialValidationResult }> = {
    rate: { value: entry.rate, validator: validateHourlyRate },
    hours: { value: entry.hours, validator: validateDailyHours },
  };

  // If total is provided, validate it as well
  if (entry.total !== undefined) {
    fields.total = {
      value: entry.total,
      validator: validateInvoiceAmount, // Use invoice validation for totals
    };
  }

  return validateFinancialFields(fields);
}

/**
 * Validates an expense's financial fields.
 *
 * @param expense - Object containing amount and optional receipt flag
 * @returns Batch validation result
 *
 * @example
 * ```typescript
 * const result = validateExpense({
 *   amount: 150,
 *   hasReceipt: false,
 * });
 * ```
 */
export function validateExpense(expense: {
  amount: number;
  hasReceipt?: boolean;
}): BatchValidationResult {
  const result = validateExpenseAmount(expense.amount, expense.hasReceipt);

  return {
    valid: result.valid,
    results: { amount: result },
    errors: result.error ? [`amount: ${result.error}`] : [],
    warnings: result.warning ? [`amount: ${result.warning}`] : [],
  };
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a value is a valid monetary amount.
 *
 * @param value - The value to check
 * @returns Whether the value is a valid monetary amount
 */
export function isValidMonetaryAmount(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value) && value >= 0;
}

/**
 * Type guard to check if a value is a valid duration in hours.
 *
 * @param value - The value to check
 * @returns Whether the value is a valid duration
 */
export function isValidDuration(value: unknown): value is number {
  if (!isValidMonetaryAmount(value)) return false;
  const maxHours = FINANCIAL_CONSTRAINTS.MAX_DAILY_DURATION / 60;
  return value <= maxHours;
}
