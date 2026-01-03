/**
 * @module services/validation/validators/common-validators
 * @description Common validation utilities shared across validation schemas
 * Pure validation functions with no side effects
 * 
 * @responsibility Validate common data formats (email, date, strings)
 */

/**
 * Validate email format using RFC-compliant regex
 * 
 * @param email - Email address to validate
 * @returns True if email format is valid
 * 
 * @example
 * ```ts
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate ISO 8601 date string
 * 
 * @param dateStr - Date string to validate
 * @returns True if date is valid ISO format
 * 
 * @example
 * ```ts
 * isValidDate('2024-01-15') // true
 * isValidDate('2024-13-45') // false
 * isValidDate('invalid') // false
 * ```
 */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Check if date is in the future
 * 
 * @param dateStr - Date string to check
 * @returns True if date is after current time
 */
export function isFutureDate(dateStr: string): boolean {
  return new Date(dateStr) > new Date();
}

/**
 * Check if dateFrom is before dateTo
 * 
 * @param dateFrom - Start date
 * @param dateTo - End date
 * @returns True if dateFrom is before dateTo
 */
export function isValidDateRange(dateFrom: string, dateTo: string): boolean {
  return new Date(dateFrom) <= new Date(dateTo);
}

/**
 * Validate string length is within range
 * 
 * @param str - String to validate
 * @param minLength - Minimum length (inclusive)
 * @param maxLength - Maximum length (inclusive, optional)
 * @returns True if string length is valid
 * 
 * @example
 * ```ts
 * isValidStringLength('hello', 3, 10) // true
 * isValidStringLength('hi', 5) // false (too short)
 * ```
 */
export function isValidStringLength(
  str: string, 
  minLength: number, 
  maxLength?: number
): boolean {
  const length = str.trim().length;
  if (length < minLength) return false;
  return !(maxLength !== undefined && length > maxLength);

}

/**
 * Validate invoice number format (INV-XXXXXX)
 * 
 * @param invoiceNumber - Invoice number to validate
 * @returns True if format matches INV-XXXXXX pattern
 * 
 * @example
 * ```ts
 * isValidInvoiceNumber('INV-123456') // true
 * isValidInvoiceNumber('INV-12345') // false (too short)
 * isValidInvoiceNumber('INVOICE-123456') // false (wrong prefix)
 * ```
 */
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  return /^INV-\d{6,}$/.test(invoiceNumber);
}

/**
 * Validate enum value against allowed values
 * 
 * @param value - Value to validate
 * @param allowedValues - Array of allowed enum values
 * @returns True if value is in allowed values
 * 
 * @example
 * ```ts
 * isValidEnum('draft', ['draft', 'sent', 'paid']) // true
 * isValidEnum('invalid', ['draft', 'sent', 'paid']) // false
 * ```
 */
export function isValidEnum<T>(value: T, allowedValues: readonly T[]): boolean {
  return allowedValues.includes(value);
}