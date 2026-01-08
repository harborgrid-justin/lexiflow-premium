/**
 * ValidationService - Centralized validation for all domain services
 *
 * @module services/core/ValidationService
 * @description Provides comprehensive input validation and sanitization
 *
 * @security
 * - XSS prevention via HTML encoding
 * - SQL injection prevention via type validation
 * - Input length limits to prevent DoS
 * - Regex patterns for email, phone, currency validation
 *
 * @compliance
 * - Email: RFC 5322 compliant
 * - Phone: E.164 international format
 * - Currency: ISO 4217 codes
 * - Amounts: Financial precision (2 decimal places)
 *
 * @author LexiFlow Engineering Team
 * @since 2026-01-08
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public value?: unknown
  ) {
    super(message);
    this.name = "ValidationError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationService {
  /**
   * Validate email address (RFC 5322 compliant)
   */
  static validateEmail(email: string, fieldName = "email"): void {
    if (!email || typeof email !== "string") {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const trimmed = email.trim();
    if (trimmed.length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }

    if (trimmed.length > 254) {
      throw new ValidationError(
        `${fieldName} exceeds maximum length (254)`,
        fieldName
      );
    }

    // RFC 5322 simplified regex
    const regex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!regex.test(trimmed)) {
      throw new ValidationError(
        `${fieldName} is not a valid email address`,
        fieldName,
        email
      );
    }
  }

  /**
   * Validate phone number (E.164 format)
   */
  static validatePhoneNumber(phone: string, fieldName = "phone"): void {
    if (!phone || typeof phone !== "string") {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const trimmed = phone.trim().replace(/\s+/g, "");

    // E.164 format: +[country code][number] (max 15 digits)
    const regex = /^\+?[1-9]\d{1,14}$/;

    if (!regex.test(trimmed)) {
      throw new ValidationError(
        `${fieldName} must be in E.164 format (+1234567890)`,
        fieldName,
        phone
      );
    }
  }

  /**
   * Validate monetary amount
   */
  static validateAmount(
    amount: number,
    fieldName = "amount",
    options: { min?: number; max?: number; allowZero?: boolean } = {}
  ): void {
    const { min = 0, max = 10_000_000, allowZero = false } = options;

    if (typeof amount !== "number") {
      throw new ValidationError(
        `${fieldName} must be a number`,
        fieldName,
        amount
      );
    }

    if (isNaN(amount) || !isFinite(amount)) {
      throw new ValidationError(
        `${fieldName} must be a valid number`,
        fieldName,
        amount
      );
    }

    if (!allowZero && amount === 0) {
      throw new ValidationError(
        `${fieldName} cannot be zero`,
        fieldName,
        amount
      );
    }

    if (amount < min) {
      throw new ValidationError(
        `${fieldName} must be at least ${min}`,
        fieldName,
        amount
      );
    }

    if (amount > max) {
      throw new ValidationError(
        `${fieldName} cannot exceed ${max}`,
        fieldName,
        amount
      );
    }

    // Check decimal precision (2 places for currency)
    const decimals = amount.toString().split(".")[1];
    if (decimals && decimals.length > 2) {
      throw new ValidationError(
        `${fieldName} cannot have more than 2 decimal places`,
        fieldName,
        amount
      );
    }
  }

  /**
   * Validate currency code (ISO 4217)
   */
  static validateCurrency(currency: string, fieldName = "currency"): void {
    if (!currency || typeof currency !== "string") {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const valid = [
      "USD",
      "EUR",
      "GBP",
      "CAD",
      "AUD",
      "JPY",
      "CHF",
      "CNY",
      "INR",
      "BRL",
      "MXN",
      "ZAR",
    ];

    const upper = currency.toUpperCase();
    if (!valid.includes(upper)) {
      throw new ValidationError(
        `${fieldName} must be a valid ISO 4217 code (${valid.join(", ")})`,
        fieldName,
        currency
      );
    }
  }

  /**
   * Validate date range
   */
  static validateDateRange(
    startDate: string,
    endDate: string,
    options: { allowFuture?: boolean; maxRangeYears?: number } = {}
  ): void {
    const { allowFuture = true, maxRangeYears = 10 } = options;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isNaN(start.getTime())) {
      throw new ValidationError(
        "Start date is invalid",
        "startDate",
        startDate
      );
    }

    if (isNaN(end.getTime())) {
      throw new ValidationError("End date is invalid", "endDate", endDate);
    }

    if (start > end) {
      throw new ValidationError("Start date must be before end date");
    }

    if (!allowFuture && start > now) {
      throw new ValidationError(
        "Start date cannot be in the future",
        "startDate"
      );
    }

    if (!allowFuture && end > now) {
      throw new ValidationError("End date cannot be in the future", "endDate");
    }

    // Check maximum range
    const yearsDiff =
      (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (yearsDiff > maxRangeYears) {
      throw new ValidationError(
        `Date range cannot exceed ${maxRangeYears} years`
      );
    }
  }

  /**
   * Validate and sanitize string input
   */
  static sanitizeString(
    input: string,
    options: { maxLength?: number; allowHtml?: boolean; trim?: boolean } = {}
  ): string {
    const { maxLength = 5000, allowHtml = false, trim = true } = options;

    if (!input || typeof input !== "string") {
      return "";
    }

    let sanitized = input;

    // Trim if requested
    if (trim) {
      sanitized = sanitized.trim();
    }

    // Remove control characters
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");

    // Truncate to max length
    sanitized = sanitized.substring(0, maxLength);

    // HTML encode for XSS prevention (unless HTML is explicitly allowed)
    if (!allowHtml) {
      sanitized = sanitized
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
    }

    return sanitized;
  }

  /**
   * Validate ID parameter (UUID or custom format)
   */
  static validateId(id: string, fieldName = "id"): void {
    if (!id || typeof id !== "string") {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const trimmed = id.trim();
    if (trimmed.length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }

    // Allow UUID format or custom alphanumeric+dash format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const customRegex = /^[a-zA-Z0-9_-]+$/;

    if (!uuidRegex.test(trimmed) && !customRegex.test(trimmed)) {
      throw new ValidationError(
        `${fieldName} must be a valid UUID or alphanumeric identifier`,
        fieldName,
        id
      );
    }

    if (trimmed.length > 100) {
      throw new ValidationError(
        `${fieldName} exceeds maximum length (100)`,
        fieldName,
        id
      );
    }
  }

  /**
   * Validate required field
   */
  static validateRequired(value: unknown, fieldName: string): void {
    if (value === null || value === undefined) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    if (typeof value === "string" && value.trim().length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }
  }

  /**
   * Validate enum value
   */
  static validateEnum<T extends string>(
    value: string,
    validValues: readonly T[],
    fieldName = "value"
  ): void {
    if (!validValues.includes(value as T)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${validValues.join(", ")}`,
        fieldName,
        value
      );
    }
  }

  /**
   * Validate array
   */
  static validateArray(
    value: unknown,
    fieldName: string,
    options: { minLength?: number; maxLength?: number } = {}
  ): void {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`, fieldName);
    }

    const { minLength, maxLength } = options;

    if (minLength !== undefined && value.length < minLength) {
      throw new ValidationError(
        `${fieldName} must contain at least ${minLength} items`,
        fieldName
      );
    }

    if (maxLength !== undefined && value.length > maxLength) {
      throw new ValidationError(
        `${fieldName} cannot contain more than ${maxLength} items`,
        fieldName
      );
    }
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string, fieldName = "url"): void {
    if (!url || typeof url !== "string") {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      throw new ValidationError(
        `${fieldName} must be a valid HTTP(S) URL`,
        fieldName,
        url
      );
    }
  }

  /**
   * Validate LEDES billing code format
   */
  static validateLedesCode(code: string, fieldName = "ledesCode"): void {
    if (!code || typeof code !== "string") {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    // LEDES format: Letter followed by 3 digits (e.g., L110, A101)
    const regex = /^[A-Z]\d{3}$/;
    if (!regex.test(code)) {
      throw new ValidationError(
        `${fieldName} must be in LEDES format (e.g., L110)`,
        fieldName,
        code
      );
    }
  }
}
