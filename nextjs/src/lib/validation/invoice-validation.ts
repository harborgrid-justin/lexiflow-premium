/**
 * Invoice Validation Module
 *
 * Provides comprehensive validation for invoice line items and totals.
 * Implements financial integrity checks with floating-point tolerance.
 *
 * @module lib/validation/invoice-validation
 */

// =============================================================================
// Constants
// =============================================================================

/**
 * Tolerance for floating-point comparisons in financial calculations.
 * Used to account for IEEE 754 floating-point precision limitations.
 */
export const CALCULATION_TOLERANCE = 0.01;

/**
 * Financial constraints for invoice validation
 */
export const FINANCIAL_CONSTRAINTS = {
  /** Maximum allowed invoice amount */
  MAX_INVOICE_AMOUNT: 10_000_000,
  /** Maximum allowed rate per unit */
  MAX_RATE: 10_000,
  /** Maximum allowed quantity */
  MAX_QUANTITY: 1_000_000,
  /** Minimum description length */
  MIN_DESCRIPTION_LENGTH: 5,
  /** Maximum description length */
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// =============================================================================
// Types
// =============================================================================

/**
 * Invoice line item for validation
 */
export interface InvoiceLineItem {
  /** Line item description */
  description: string;
  /** Quantity of units */
  quantity: number;
  /** Rate per unit */
  rate: number;
  /** Total amount for line item */
  amount: number;
  /** Optional line item type */
  type?: 'time' | 'expense' | 'fee' | 'discount';
}

/**
 * Invoice data for total validation
 */
export interface InvoiceForValidation {
  /** Line items in the invoice */
  lineItems: InvoiceLineItem[];
  /** Subtotal (sum of line items) */
  subtotal?: number;
  /** Tax amount */
  tax?: number;
  /** Tax rate as percentage (0-100) */
  taxRate?: number;
  /** Discount amount */
  discount?: number;
  /** Total invoice amount */
  totalAmount: number;
}

/**
 * Result of a single line item validation
 */
export interface LineItemValidationResult {
  /** Whether the line item is valid */
  valid: boolean;
  /** Index of the line item (0-based) */
  index: number;
  /** List of validation errors */
  errors: string[];
  /** Expected amount based on quantity * rate */
  expectedAmount?: number;
  /** Actual amount provided */
  actualAmount?: number;
}

/**
 * Result of invoice total validation
 */
export interface InvoiceTotalValidationResult {
  /** Whether the invoice total is valid */
  valid: boolean;
  /** List of validation errors */
  errors: string[];
  /** Calculated line items sum */
  lineItemsSum?: number;
  /** Expected total based on calculations */
  expectedTotal?: number;
  /** Actual total provided */
  actualTotal?: number;
}

/**
 * Complete invoice validation result
 */
export interface InvoiceValidationResult {
  /** Whether the entire invoice is valid */
  valid: boolean;
  /** List of all validation errors */
  errors: string[];
  /** Individual line item validation results */
  lineItemResults: LineItemValidationResult[];
  /** Invoice total validation result */
  totalResult: InvoiceTotalValidationResult;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Rounds a number to 2 decimal places for financial calculations.
 *
 * @param value - The number to round
 * @returns Number rounded to 2 decimal places
 *
 * @example
 * ```ts
 * roundToTwoDecimals(10.255)  // 10.26
 * roundToTwoDecimals(10.244)  // 10.24
 * ```
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Compares two numbers with a tolerance for floating-point precision.
 *
 * @param a - First number
 * @param b - Second number
 * @param tolerance - Acceptable difference (default: CALCULATION_TOLERANCE)
 * @returns True if numbers are within tolerance
 *
 * @example
 * ```ts
 * isWithinTolerance(10.00, 10.009)  // true (within 0.01)
 * isWithinTolerance(10.00, 10.02)   // false (exceeds 0.01)
 * ```
 */
export function isWithinTolerance(
  a: number,
  b: number,
  tolerance: number = CALCULATION_TOLERANCE
): boolean {
  return Math.abs(a - b) <= tolerance;
}

/**
 * Validates that a number is a valid financial amount.
 *
 * @param amount - The amount to validate
 * @returns True if amount is valid (finite, non-negative, max 2 decimals)
 */
export function isValidAmount(amount: number): boolean {
  if (!Number.isFinite(amount)) return false;
  if (amount < 0) return false;

  // Check for max 2 decimal places
  const rounded = roundToTwoDecimals(amount);
  return isWithinTolerance(amount, rounded, 0.001);
}

/**
 * Validates that a number is a valid rate.
 *
 * @param rate - The rate to validate
 * @returns True if rate is valid (positive, finite, within limits)
 */
export function isValidRate(rate: number): boolean {
  if (!Number.isFinite(rate)) return false;
  if (rate <= 0) return false;
  if (rate > FINANCIAL_CONSTRAINTS.MAX_RATE) return false;
  return true;
}

/**
 * Validates that a number is a valid quantity.
 *
 * @param quantity - The quantity to validate
 * @returns True if quantity is valid (positive, finite, within limits)
 */
export function isValidQuantity(quantity: number): boolean {
  if (!Number.isFinite(quantity)) return false;
  if (quantity <= 0) return false;
  if (quantity > FINANCIAL_CONSTRAINTS.MAX_QUANTITY) return false;
  return true;
}

// =============================================================================
// Core Validation Functions
// =============================================================================

/**
 * Validates that a line item's amount equals quantity * rate within tolerance.
 *
 * This function verifies the mathematical integrity of a single invoice line item
 * by checking that the provided amount matches the product of quantity and rate,
 * allowing for a small tolerance to account for floating-point precision issues.
 *
 * @param item - The invoice line item to validate
 * @returns Object containing validation result with details
 *
 * @example
 * ```ts
 * // Valid line item
 * validateLineItemCalculation({
 *   description: 'Legal consultation',
 *   quantity: 2.5,
 *   rate: 150.00,
 *   amount: 375.00
 * });
 * // Returns: { valid: true, expectedAmount: 375, actualAmount: 375, difference: 0 }
 *
 * // Invalid line item (amount mismatch)
 * validateLineItemCalculation({
 *   description: 'Legal consultation',
 *   quantity: 2.5,
 *   rate: 150.00,
 *   amount: 400.00  // Should be 375.00
 * });
 * // Returns: { valid: false, expectedAmount: 375, actualAmount: 400, difference: 25 }
 * ```
 */
export function validateLineItemCalculation(item: InvoiceLineItem): {
  valid: boolean;
  expectedAmount: number;
  actualAmount: number;
  difference: number;
} {
  const expectedAmount = roundToTwoDecimals(item.quantity * item.rate);
  const actualAmount = item.amount;
  const difference = Math.abs(expectedAmount - actualAmount);

  return {
    valid: isWithinTolerance(expectedAmount, actualAmount),
    expectedAmount,
    actualAmount,
    difference: roundToTwoDecimals(difference),
  };
}

/**
 * Validates that an invoice total matches the sum of line items plus tax minus discount.
 *
 * Formula: total = sum(lineItems.amount) + tax - discount
 *
 * @param invoice - The invoice data to validate
 * @returns Object containing validation result with details
 *
 * @example
 * ```ts
 * validateInvoiceTotal({
 *   lineItems: [
 *     { description: 'Service A', quantity: 1, rate: 100, amount: 100 },
 *     { description: 'Service B', quantity: 2, rate: 50, amount: 100 }
 *   ],
 *   tax: 20,
 *   discount: 10,
 *   totalAmount: 210  // 200 + 20 - 10 = 210
 * });
 * // Returns: { valid: true, lineItemsSum: 200, expectedTotal: 210, actualTotal: 210 }
 * ```
 */
export function validateInvoiceTotal(invoice: InvoiceForValidation): InvoiceTotalValidationResult {
  const errors: string[] = [];

  // Calculate sum of line items
  const lineItemsSum = invoice.lineItems.reduce((sum, item) => {
    return sum + item.amount;
  }, 0);

  const roundedLineItemsSum = roundToTwoDecimals(lineItemsSum);

  // Calculate expected total
  const tax = invoice.tax ?? 0;
  const discount = invoice.discount ?? 0;
  const expectedTotal = roundToTwoDecimals(roundedLineItemsSum + tax - discount);

  // Validate subtotal if provided
  if (invoice.subtotal !== undefined) {
    if (!isWithinTolerance(invoice.subtotal, roundedLineItemsSum)) {
      errors.push(
        `Subtotal mismatch: expected ${roundedLineItemsSum.toFixed(2)}, got ${invoice.subtotal.toFixed(2)}`
      );
    }
  }

  // Validate total
  const isValid = isWithinTolerance(expectedTotal, invoice.totalAmount);

  if (!isValid) {
    errors.push(
      `Invoice total mismatch: expected ${expectedTotal.toFixed(2)} ` +
        `(items: ${roundedLineItemsSum.toFixed(2)} + tax: ${tax.toFixed(2)} - discount: ${discount.toFixed(2)}), ` +
        `got ${invoice.totalAmount.toFixed(2)}`
    );
  }

  return {
    valid: isValid && errors.length === 0,
    errors,
    lineItemsSum: roundedLineItemsSum,
    expectedTotal,
    actualTotal: invoice.totalAmount,
  };
}

/**
 * Validates all line items in an invoice.
 *
 * Performs comprehensive validation on each line item including:
 * - Description length and content
 * - Quantity validity
 * - Rate validity
 * - Amount validity
 * - Calculation verification (amount = quantity * rate)
 *
 * @param items - Array of line items to validate
 * @returns Array of validation results for each line item
 *
 * @example
 * ```ts
 * const results = validateInvoiceLineItems([
 *   { description: 'Legal services rendered', quantity: 5, rate: 200, amount: 1000 },
 *   { description: 'Bad', quantity: -1, rate: 100, amount: -100 }  // Invalid
 * ]);
 *
 * // results[0].valid === true
 * // results[1].valid === false
 * // results[1].errors === ['Description must be at least 5 characters', 'Invalid quantity']
 * ```
 */
export function validateInvoiceLineItems(items: InvoiceLineItem[]): LineItemValidationResult[] {
  return items.map((item, index) => {
    const errors: string[] = [];

    // Validate description
    if (!item.description || typeof item.description !== 'string') {
      errors.push('Description is required');
    } else {
      const trimmedDescription = item.description.trim();
      if (trimmedDescription.length < FINANCIAL_CONSTRAINTS.MIN_DESCRIPTION_LENGTH) {
        errors.push(
          `Description must be at least ${FINANCIAL_CONSTRAINTS.MIN_DESCRIPTION_LENGTH} characters`
        );
      }
      if (trimmedDescription.length > FINANCIAL_CONSTRAINTS.MAX_DESCRIPTION_LENGTH) {
        errors.push(
          `Description must not exceed ${FINANCIAL_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} characters`
        );
      }
    }

    // Validate quantity
    if (!isValidQuantity(item.quantity)) {
      errors.push('Invalid quantity: must be a positive number');
    }

    // Validate rate
    if (!isValidRate(item.rate)) {
      if (item.rate <= 0) {
        errors.push('Invalid rate: must be a positive number');
      } else if (item.rate > FINANCIAL_CONSTRAINTS.MAX_RATE) {
        errors.push(`Invalid rate: cannot exceed ${FINANCIAL_CONSTRAINTS.MAX_RATE}`);
      } else {
        errors.push('Invalid rate');
      }
    }

    // Validate amount
    if (!isValidAmount(item.amount)) {
      errors.push('Invalid amount: must be a non-negative number with max 2 decimal places');
    }

    // Validate calculation (amount = quantity * rate)
    const calculationResult = validateLineItemCalculation(item);
    if (!calculationResult.valid) {
      errors.push(
        `Amount mismatch: expected ${calculationResult.expectedAmount.toFixed(2)}, ` +
          `got ${calculationResult.actualAmount.toFixed(2)}`
      );
    }

    return {
      valid: errors.length === 0,
      index,
      errors,
      expectedAmount: calculationResult.expectedAmount,
      actualAmount: calculationResult.actualAmount,
    };
  });
}

/**
 * Performs complete validation of an invoice including all line items and total.
 *
 * This is the main entry point for invoice validation, combining:
 * - Individual line item validation
 * - Line item calculation verification
 * - Invoice total verification
 *
 * @param invoice - The complete invoice to validate
 * @returns Complete validation result with all errors and details
 *
 * @example
 * ```ts
 * const result = validateInvoice({
 *   lineItems: [
 *     { description: 'Legal research', quantity: 4, rate: 175, amount: 700 },
 *     { description: 'Court appearance', quantity: 2, rate: 300, amount: 600 }
 *   ],
 *   tax: 130,
 *   discount: 50,
 *   totalAmount: 1380  // 1300 + 130 - 50 = 1380
 * });
 *
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateInvoice(invoice: InvoiceForValidation): InvoiceValidationResult {
  const allErrors: string[] = [];

  // Validate that there is at least one line item
  if (!invoice.lineItems || invoice.lineItems.length === 0) {
    return {
      valid: false,
      errors: ['Invoice must have at least one line item'],
      lineItemResults: [],
      totalResult: {
        valid: false,
        errors: ['Cannot validate total without line items'],
      },
    };
  }

  // Validate all line items
  const lineItemResults = validateInvoiceLineItems(invoice.lineItems);

  // Collect errors from line items
  lineItemResults.forEach((result) => {
    if (!result.valid) {
      result.errors.forEach((error) => {
        allErrors.push(`Item ${result.index + 1}: ${error}`);
      });
    }
  });

  // Validate invoice total
  const totalResult = validateInvoiceTotal(invoice);
  allErrors.push(...totalResult.errors);

  // Validate tax and discount
  if (invoice.tax !== undefined) {
    if (!isValidAmount(invoice.tax)) {
      allErrors.push('Invalid tax amount');
    }
  }

  if (invoice.discount !== undefined) {
    if (!isValidAmount(invoice.discount)) {
      allErrors.push('Invalid discount amount');
    }
    if (invoice.discount > invoice.totalAmount) {
      allErrors.push('Discount cannot exceed invoice total');
    }
  }

  // Check max invoice amount
  if (invoice.totalAmount > FINANCIAL_CONSTRAINTS.MAX_INVOICE_AMOUNT) {
    allErrors.push(
      `Invoice total cannot exceed $${FINANCIAL_CONSTRAINTS.MAX_INVOICE_AMOUNT.toLocaleString()}`
    );
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    lineItemResults,
    totalResult,
  };
}

// =============================================================================
// Helper Functions for Integration
// =============================================================================

/**
 * Quickly validates a single line item calculation without full validation.
 *
 * @param quantity - Item quantity
 * @param rate - Rate per unit
 * @param amount - Provided amount
 * @returns True if amount matches quantity * rate within tolerance
 *
 * @example
 * ```ts
 * checkLineItemCalculation(2.5, 100, 250)  // true
 * checkLineItemCalculation(2.5, 100, 260)  // false
 * ```
 */
export function checkLineItemCalculation(
  quantity: number,
  rate: number,
  amount: number
): boolean {
  const expected = roundToTwoDecimals(quantity * rate);
  return isWithinTolerance(expected, amount);
}

/**
 * Quickly validates invoice total without full invoice validation.
 *
 * @param lineItemsSum - Sum of all line item amounts
 * @param totalAmount - Invoice total amount
 * @param tax - Tax amount (optional)
 * @param discount - Discount amount (optional)
 * @returns True if total matches calculated amount within tolerance
 *
 * @example
 * ```ts
 * checkInvoiceTotal(1000, 1080, 100, 20)  // true (1000 + 100 - 20 = 1080)
 * checkInvoiceTotal(1000, 1100, 100, 20)  // false
 * ```
 */
export function checkInvoiceTotal(
  lineItemsSum: number,
  totalAmount: number,
  tax?: number,
  discount?: number
): boolean {
  const expectedTotal = roundToTwoDecimals(
    lineItemsSum + (tax ?? 0) - (discount ?? 0)
  );
  return isWithinTolerance(expectedTotal, totalAmount);
}
