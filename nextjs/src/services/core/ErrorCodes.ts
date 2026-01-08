/**
 * ErrorCodes - Structured error codes for the LexiFlow platform
 *
 * @module services/core/ErrorCodes
 * @description Centralized error code system for consistent error handling
 *
 * @architecture
 * - Grouped by category (1000s = validation, 2000s = business logic, etc.)
 * - Machine-readable codes for programmatic error handling
 * - Human-readable messages for user display
 * - Context objects for detailed error information
 *
 * @author LexiFlow Engineering Team
 * @since 2026-01-08
 */

/**
 * Error code categories
 * - 1000-1999: Validation errors
 * - 2000-2999: Business logic errors
 * - 3000-3999: Authorization/Authentication errors
 * - 4000-4999: Data integrity errors
 * - 5000-5999: External service errors
 * - 9000-9999: System errors
 */
export enum ErrorCode {
  // VALIDATION ERRORS (1000-1999)
  VALIDATION_FAILED = 1000,
  INVALID_EMAIL = 1001,
  INVALID_PHONE = 1002,
  INVALID_AMOUNT = 1003,
  INVALID_CURRENCY = 1004,
  INVALID_DATE_RANGE = 1005,
  INVALID_ID = 1006,
  REQUIRED_FIELD_MISSING = 1007,
  INVALID_ENUM_VALUE = 1008,
  INVALID_URL = 1009,
  INVALID_LEDES_CODE = 1010,
  STRING_TOO_LONG = 1011,
  ARRAY_TOO_SHORT = 1012,
  ARRAY_TOO_LONG = 1013,

  // BUSINESS LOGIC ERRORS (2000-2999)
  INSUFFICIENT_FUNDS = 2000,
  CONFLICT_DETECTED = 2001,
  DUPLICATE_ENTRY = 2002,
  TRUST_VIOLATION = 2003,
  COMMINGLING_DETECTED = 2004,
  RECONCILIATION_FAILED = 2005,
  CONVERSION_FAILED = 2006,
  ROLLBACK_FAILED = 2007,
  TRANSACTION_LIMIT_EXCEEDED = 2008,
  CASE_NOT_FOUND = 2009,
  CLIENT_NOT_FOUND = 2010,
  INVOICE_NOT_FOUND = 2011,
  LEAD_ALREADY_CONVERTED = 2012,
  CONCURRENT_MODIFICATION = 2013,

  // AUTHORIZATION ERRORS (3000-3999)
  UNAUTHORIZED = 3000,
  FORBIDDEN = 3001,
  ETHICAL_WALL_VIOLATION = 3002,
  INSUFFICIENT_PERMISSIONS = 3003,
  TOKEN_EXPIRED = 3004,
  TOKEN_INVALID = 3005,
  SESSION_EXPIRED = 3006,

  // DATA INTEGRITY ERRORS (4000-4999)
  DATA_CORRUPTION = 4000,
  CONSTRAINT_VIOLATION = 4001,
  FOREIGN_KEY_VIOLATION = 4002,
  UNIQUE_VIOLATION = 4003,
  CHECK_CONSTRAINT_VIOLATION = 4004,

  // EXTERNAL SERVICE ERRORS (5000-5999)
  BACKEND_UNAVAILABLE = 5000,
  BACKEND_TIMEOUT = 5001,
  BACKEND_ERROR = 5002,
  API_RATE_LIMIT = 5003,
  PAYMENT_GATEWAY_ERROR = 5004,
  EMAIL_SERVICE_ERROR = 5005,

  // SYSTEM ERRORS (9000-9999)
  DATABASE_ERROR = 9000,
  NETWORK_ERROR = 9001,
  INTERNAL_ERROR = 9002,
  NOT_IMPLEMENTED = 9003,
  SERVICE_UNAVAILABLE = 9004,
  TIMEOUT = 9005,
  UNKNOWN_ERROR = 9999,
}

/**
 * Base error class for LexiFlow platform
 */
export class LexiFlowError extends Error {
  public readonly timestamp: string;

  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }

  toString() {
    return `[${this.code}] ${this.name}: ${this.message}`;
  }
}

/**
 * Validation error
 */
export class ValidationError extends LexiFlowError {
  constructor(
    message: string,
    public readonly field?: string,
    context?: Record<string, unknown>
  ) {
    super(ErrorCode.VALIDATION_FAILED, message, {
      ...context,
      field,
    });
  }
}

/**
 * Compliance/Ethics error
 */
export class ComplianceError extends LexiFlowError {
  constructor(
    message: string,
    public readonly rule?: string,
    context?: Record<string, unknown>
  ) {
    super(ErrorCode.CONFLICT_DETECTED, message, {
      ...context,
      rule,
    });
  }
}

/**
 * Lead conversion error
 */
export class ConversionError extends LexiFlowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCode.CONVERSION_FAILED, message, context);
  }
}

/**
 * Concurrency/race condition error
 */
export class ConcurrencyError extends LexiFlowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCode.CONCURRENT_MODIFICATION, message, context);
  }
}

/**
 * Trust accounting error
 */
export class TrustAccountError extends LexiFlowError {
  constructor(
    message: string,
    public readonly accountId?: string,
    context?: Record<string, unknown>
  ) {
    super(ErrorCode.TRUST_VIOLATION, message, {
      ...context,
      accountId,
    });
  }
}

/**
 * Operation error (generic business logic)
 */
export class OperationError extends LexiFlowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCode.INTERNAL_ERROR, message, context);
  }
}

/**
 * Backend service error
 */
export class BackendError extends LexiFlowError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    context?: Record<string, unknown>
  ) {
    super(ErrorCode.BACKEND_ERROR, message, {
      ...context,
      statusCode,
    });
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends LexiFlowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCode.FORBIDDEN, message, context);
  }
}

/**
 * Data integrity error
 */
export class DataIntegrityError extends LexiFlowError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorCode.DATA_CORRUPTION, message, context);
  }
}
