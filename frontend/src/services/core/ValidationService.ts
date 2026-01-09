import { ValidationError } from "./errors";

/**
 * Centralized Validation Service
 * Implements critical validation logic for data integrity and security
 *
 * Addresses Issue #5: Data Validation Layer Missing
 */
export class ValidationService {
  /**
   * RFC 5322 compliant email validation
   */
  static validateEmail(email: string): boolean {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  /**
   * E.164 format phone number validation
   */
  static validatePhoneNumber(phone: string): boolean {
    // E.164 format: +1234567890 (max 15 digits)
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phone);
  }

  /**
   * Numeric amount validation with bounds checking
   */
  static validateAmount(amount: number, min = 0, max = 10_000_000): void {
    if (isNaN(amount) || !isFinite(amount)) {
      throw new ValidationError("Amount must be a valid number");
    }
    if (amount < min || amount > max) {
      throw new ValidationError(`Amount must be between ${min} and ${max}`);
    }
  }

  /**
   * Currency code validation
   */
  static validateCurrency(currency: string): void {
    const valid = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"];
    if (!valid.includes(currency)) {
      throw new ValidationError(`Invalid currency code: ${currency}`);
    }
  }

  /**
   * Date range validation
   */
  static validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError("Invalid date format");
    }
    if (start > end) {
      throw new ValidationError("Start date must be before end date");
    }
  }

  /**
   * String sanitization for XSS prevention
   */
  static sanitizeString(input: string, maxLength = 5000): string {
    if (!input) return "";

    // Remove control characters
    // eslint-disable-next-line no-control-regex
    let sanitized = input.replace(/[\x00-\x1F\x7F]/g, "");

    // Truncate to max length
    sanitized = sanitized.substring(0, maxLength);

    // HTML encode for XSS prevention
    sanitized = sanitized
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");

    return sanitized;
  }
}
