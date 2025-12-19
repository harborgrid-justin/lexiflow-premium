/**
 * @module services/validation/validators/financial-validators
 * @description Financial data validation utilities
 * Pure validation functions for monetary amounts, rates, and financial constraints
 * 
 * @responsibility Validate financial data formats and business rules
 */

/**
 * Financial validation configuration
 */
export const FINANCIAL_CONSTRAINTS = {
  /** Maximum hourly rate ($10,000/hour) */
  MAX_HOURLY_RATE: 10000,
  /** Maximum invoice amount ($10M) */
  MAX_INVOICE_AMOUNT: 10000000,
  /** Maximum expense amount requiring special approval ($100k) */
  MAX_EXPENSE_AMOUNT: 100000,
  /** Minimum expense amount requiring receipt ($75) */
  RECEIPT_REQUIRED_THRESHOLD: 75,
  /** Maximum trust transaction amount ($1M) */
  MAX_TRUST_TRANSACTION: 1000000,
  /** Maximum decimal places for monetary amounts */
  MAX_DECIMAL_PLACES: 2,
  /** Maximum daily time entry duration in minutes (24 hours) */
  MAX_DAILY_DURATION: 1440,
} as const;

/**
 * Validate monetary amount (positive, max 2 decimal places)
 * 
 * @param amount - Amount to validate
 * @returns True if amount is valid monetary value
 * 
 * @example
 * ```ts
 * isValidAmount(123.45) // true
 * isValidAmount(123.456) // false (too many decimals)
 * isValidAmount(-10) // false (negative)
 * ```
 */
export function isValidAmount(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) return false;
  if (amount < 0) return false;
  
  // Check max 2 decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= FINANCIAL_CONSTRAINTS.MAX_DECIMAL_PLACES;
}

/**
 * Validate hourly rate (positive, max 2 decimal places, within range)
 * 
 * @param rate - Hourly rate to validate
 * @returns True if rate is valid
 * 
 * @example
 * ```ts
 * isValidRate(250.50) // true
 * isValidRate(15000) // false (exceeds max)
 * isValidRate(-50) // false (negative)
 * ```
 */
export function isValidRate(rate: number): boolean {
  if (typeof rate !== 'number' || isNaN(rate)) return false;
  if (rate < 0 || rate > FINANCIAL_CONSTRAINTS.MAX_HOURLY_RATE) return false;
  
  const decimalPlaces = (rate.toString().split('.')[1] || '').length;
  return decimalPlaces <= FINANCIAL_CONSTRAINTS.MAX_DECIMAL_PLACES;
}

/**
 * Validate duration in minutes (positive integer)
 * 
 * @param duration - Duration in minutes
 * @returns True if duration is valid
 * 
 * @example
 * ```ts
 * isValidDuration(30) // true
 * isValidDuration(90.5) // false (not integer)
 * isValidDuration(-15) // false (negative)
 * ```
 */
export function isValidDuration(duration: number): boolean {
  return typeof duration === 'number' && 
         duration > 0 && 
         Number.isInteger(duration);
}

/**
 * Check if amount requires receipt based on threshold
 * 
 * @param amount - Expense amount
 * @returns True if receipt is required
 */
export function requiresReceipt(amount: number): boolean {
  return amount > FINANCIAL_CONSTRAINTS.RECEIPT_REQUIRED_THRESHOLD;
}

/**
 * Validate invoice line item calculation
 * 
 * @param quantity - Item quantity
 * @param rate - Unit rate
 * @param amount - Calculated amount
 * @param tolerance - Acceptable difference (default: $0.01)
 * @returns True if calculation is correct within tolerance
 */
export function validateLineItemCalculation(
  quantity: number,
  rate: number,
  amount: number,
  tolerance: number = 0.01
): boolean {
  const expected = quantity * rate;
  return Math.abs(amount - expected) <= tolerance;
}

/**
 * Validate invoice total matches line items
 * 
 * @param lineItemsTotal - Sum of all line items
 * @param invoiceAmount - Invoice amount
 * @param tax - Tax amount (optional)
 * @param discount - Discount amount (optional)
 * @param tolerance - Acceptable difference (default: $0.01)
 * @returns True if totals match within tolerance
 */
export function validateInvoiceTotal(
  lineItemsTotal: number,
  invoiceAmount: number,
  tax: number = 0,
  discount: number = 0,
  tolerance: number = 0.01
): boolean {
  const calculatedTotal = lineItemsTotal + tax - discount;
  return Math.abs(calculatedTotal - invoiceAmount) <= tolerance;
}
