import { HttpStatus } from "@nestjs/common";

/**
 * Error Code Definition
 */
export interface ErrorCodeDefinition {
  code: string;
  httpStatus: HttpStatus;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
}

/**
 * Error Categories
 */
export enum ErrorCategory {
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  BUSINESS_LOGIC = "BUSINESS_LOGIC",
  DATABASE = "DATABASE",
  EXTERNAL_SERVICE = "EXTERNAL_SERVICE",
  SYSTEM = "SYSTEM",
  NETWORK = "NETWORK",
  RATE_LIMIT = "RATE_LIMIT",
}

/**
 * Error Severity Levels
 */
export enum ErrorSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

/**
 * Comprehensive Error Code Registry
 * Organized by domain for enterprise legal application
 */
export class ErrorCodes {
  // ============================================================================
  // AUTHENTICATION ERRORS (AUTH_*)
  // ============================================================================
  static readonly AUTH_INVALID_CREDENTIALS: ErrorCodeDefinition = {
    code: "AUTH_INVALID_CREDENTIALS",
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Invalid email or password",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly AUTH_TOKEN_EXPIRED: ErrorCodeDefinition = {
    code: "AUTH_TOKEN_EXPIRED",
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Authentication token has expired",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly AUTH_TOKEN_INVALID: ErrorCodeDefinition = {
    code: "AUTH_TOKEN_INVALID",
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Invalid authentication token",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly AUTH_TOKEN_REVOKED: ErrorCodeDefinition = {
    code: "AUTH_TOKEN_REVOKED",
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Authentication token has been revoked",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly AUTH_ACCOUNT_LOCKED: ErrorCodeDefinition = {
    code: "AUTH_ACCOUNT_LOCKED",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Account is locked due to multiple failed login attempts",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    retryable: false,
  };

  static readonly AUTH_ACCOUNT_DISABLED: ErrorCodeDefinition = {
    code: "AUTH_ACCOUNT_DISABLED",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Account has been disabled",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    retryable: false,
  };

  static readonly AUTH_MFA_REQUIRED: ErrorCodeDefinition = {
    code: "AUTH_MFA_REQUIRED",
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Multi-factor authentication is required",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly AUTH_MFA_INVALID: ErrorCodeDefinition = {
    code: "AUTH_MFA_INVALID",
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Invalid multi-factor authentication code",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly AUTH_SESSION_EXPIRED: ErrorCodeDefinition = {
    code: "AUTH_SESSION_EXPIRED",
    httpStatus: HttpStatus.UNAUTHORIZED,
    message: "Your session has expired. Please log in again",
    category: ErrorCategory.AUTHENTICATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  // ============================================================================
  // AUTHORIZATION ERRORS (AUTHZ_*)
  // ============================================================================
  static readonly AUTHZ_INSUFFICIENT_PERMISSIONS: ErrorCodeDefinition = {
    code: "AUTHZ_INSUFFICIENT_PERMISSIONS",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "You do not have permission to perform this action",
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly AUTHZ_ROLE_REQUIRED: ErrorCodeDefinition = {
    code: "AUTHZ_ROLE_REQUIRED",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Required role not assigned to user",
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly AUTHZ_RESOURCE_ACCESS_DENIED: ErrorCodeDefinition = {
    code: "AUTHZ_RESOURCE_ACCESS_DENIED",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Access to this resource is denied",
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly AUTHZ_ORGANIZATION_MISMATCH: ErrorCodeDefinition = {
    code: "AUTHZ_ORGANIZATION_MISMATCH",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Resource belongs to a different organization",
    category: ErrorCategory.AUTHORIZATION,
    severity: ErrorSeverity.HIGH,
    retryable: false,
  };

  // ============================================================================
  // VALIDATION ERRORS (VAL_*)
  // ============================================================================
  static readonly VAL_INVALID_INPUT: ErrorCodeDefinition = {
    code: "VAL_INVALID_INPUT",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Invalid input data provided",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly VAL_REQUIRED_FIELD_MISSING: ErrorCodeDefinition = {
    code: "VAL_REQUIRED_FIELD_MISSING",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Required field is missing",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly VAL_INVALID_FORMAT: ErrorCodeDefinition = {
    code: "VAL_INVALID_FORMAT",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Data format is invalid",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly VAL_CONSTRAINT_VIOLATION: ErrorCodeDefinition = {
    code: "VAL_CONSTRAINT_VIOLATION",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Data violates business constraints",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly VAL_INVALID_UUID: ErrorCodeDefinition = {
    code: "VAL_INVALID_UUID",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Invalid UUID format",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly VAL_INVALID_DATE_RANGE: ErrorCodeDefinition = {
    code: "VAL_INVALID_DATE_RANGE",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Invalid date range specified",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  // ============================================================================
  // CASE MANAGEMENT ERRORS (CASE_*)
  // ============================================================================
  static readonly CASE_NOT_FOUND: ErrorCodeDefinition = {
    code: "CASE_NOT_FOUND",
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Case not found",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly CASE_ALREADY_CLOSED: ErrorCodeDefinition = {
    code: "CASE_ALREADY_CLOSED",
    httpStatus: HttpStatus.CONFLICT,
    message: "Case is already closed and cannot be modified",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly CASE_CONFLICT_OF_INTEREST: ErrorCodeDefinition = {
    code: "CASE_CONFLICT_OF_INTEREST",
    httpStatus: HttpStatus.CONFLICT,
    message: "Conflict of interest detected for this case",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
  };

  static readonly CASE_INVALID_STATUS_TRANSITION: ErrorCodeDefinition = {
    code: "CASE_INVALID_STATUS_TRANSITION",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Invalid case status transition",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly CASE_MISSING_REQUIRED_PARTY: ErrorCodeDefinition = {
    code: "CASE_MISSING_REQUIRED_PARTY",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Case requires at least one party",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  // ============================================================================
  // DOCUMENT MANAGEMENT ERRORS (DOC_*)
  // ============================================================================
  static readonly DOC_NOT_FOUND: ErrorCodeDefinition = {
    code: "DOC_NOT_FOUND",
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Document not found",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly DOC_FILE_TOO_LARGE: ErrorCodeDefinition = {
    code: "DOC_FILE_TOO_LARGE",
    httpStatus: HttpStatus.PAYLOAD_TOO_LARGE,
    message: "Document file size exceeds maximum allowed",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly DOC_INVALID_FILE_TYPE: ErrorCodeDefinition = {
    code: "DOC_INVALID_FILE_TYPE",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Document file type not supported",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly DOC_VIRUS_DETECTED: ErrorCodeDefinition = {
    code: "DOC_VIRUS_DETECTED",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Virus or malware detected in document",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
  };

  static readonly DOC_VERSION_CONFLICT: ErrorCodeDefinition = {
    code: "DOC_VERSION_CONFLICT",
    httpStatus: HttpStatus.CONFLICT,
    message: "Document version conflict detected",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly DOC_LOCKED_BY_ANOTHER_USER: ErrorCodeDefinition = {
    code: "DOC_LOCKED_BY_ANOTHER_USER",
    httpStatus: HttpStatus.CONFLICT,
    message: "Document is locked by another user",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
  };

  static readonly DOC_OCR_FAILED: ErrorCodeDefinition = {
    code: "DOC_OCR_FAILED",
    httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
    message: "OCR processing failed for document",
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
  };

  // ============================================================================
  // BILLING ERRORS (BILL_*)
  // ============================================================================
  static readonly BILL_INVOICE_NOT_FOUND: ErrorCodeDefinition = {
    code: "BILL_INVOICE_NOT_FOUND",
    httpStatus: HttpStatus.NOT_FOUND,
    message: "Invoice not found",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly BILL_PAYMENT_FAILED: ErrorCodeDefinition = {
    code: "BILL_PAYMENT_FAILED",
    httpStatus: HttpStatus.PAYMENT_REQUIRED,
    message: "Payment processing failed",
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  static readonly BILL_INSUFFICIENT_TRUST_FUNDS: ErrorCodeDefinition = {
    code: "BILL_INSUFFICIENT_TRUST_FUNDS",
    httpStatus: HttpStatus.PAYMENT_REQUIRED,
    message: "Insufficient funds in trust account",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.HIGH,
    retryable: false,
  };

  static readonly BILL_INVALID_TIME_ENTRY: ErrorCodeDefinition = {
    code: "BILL_INVALID_TIME_ENTRY",
    httpStatus: HttpStatus.BAD_REQUEST,
    message: "Invalid time entry data",
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  // ============================================================================
  // COMPLIANCE ERRORS (COMP_*)
  // ============================================================================
  static readonly COMP_CONFLICT_CHECK_FAILED: ErrorCodeDefinition = {
    code: "COMP_CONFLICT_CHECK_FAILED",
    httpStatus: HttpStatus.CONFLICT,
    message: "Conflict check failed",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
  };

  static readonly COMP_ETHICAL_WALL_VIOLATION: ErrorCodeDefinition = {
    code: "COMP_ETHICAL_WALL_VIOLATION",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Ethical wall violation detected",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.CRITICAL,
    retryable: false,
  };

  static readonly COMP_AUDIT_LOG_FAILURE: ErrorCodeDefinition = {
    code: "COMP_AUDIT_LOG_FAILURE",
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Failed to create audit log entry",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    retryable: true,
  };

  static readonly COMP_DATA_RETENTION_VIOLATION: ErrorCodeDefinition = {
    code: "COMP_DATA_RETENTION_VIOLATION",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Operation violates data retention policy",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.HIGH,
    retryable: false,
  };

  // ============================================================================
  // DATABASE ERRORS (DB_*)
  // ============================================================================
  static readonly DB_CONNECTION_FAILED: ErrorCodeDefinition = {
    code: "DB_CONNECTION_FAILED",
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
    message: "Database connection failed",
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.CRITICAL,
    retryable: true,
  };

  static readonly DB_QUERY_TIMEOUT: ErrorCodeDefinition = {
    code: "DB_QUERY_TIMEOUT",
    httpStatus: HttpStatus.REQUEST_TIMEOUT,
    message: "Database query timed out",
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  static readonly DB_CONSTRAINT_VIOLATION: ErrorCodeDefinition = {
    code: "DB_CONSTRAINT_VIOLATION",
    httpStatus: HttpStatus.CONFLICT,
    message: "Database constraint violation",
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly DB_DUPLICATE_ENTRY: ErrorCodeDefinition = {
    code: "DB_DUPLICATE_ENTRY",
    httpStatus: HttpStatus.CONFLICT,
    message: "Duplicate entry detected",
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly DB_TRANSACTION_FAILED: ErrorCodeDefinition = {
    code: "DB_TRANSACTION_FAILED",
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "Database transaction failed",
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  static readonly DB_DEADLOCK_DETECTED: ErrorCodeDefinition = {
    code: "DB_DEADLOCK_DETECTED",
    httpStatus: HttpStatus.CONFLICT,
    message: "Database deadlock detected",
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  // ============================================================================
  // EXTERNAL SERVICE ERRORS (EXT_*)
  // ============================================================================
  static readonly EXT_SERVICE_UNAVAILABLE: ErrorCodeDefinition = {
    code: "EXT_SERVICE_UNAVAILABLE",
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
    message: "External service is currently unavailable",
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  static readonly EXT_SERVICE_TIMEOUT: ErrorCodeDefinition = {
    code: "EXT_SERVICE_TIMEOUT",
    httpStatus: HttpStatus.GATEWAY_TIMEOUT,
    message: "External service request timed out",
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  static readonly EXT_SERVICE_ERROR: ErrorCodeDefinition = {
    code: "EXT_SERVICE_ERROR",
    httpStatus: HttpStatus.BAD_GATEWAY,
    message: "External service returned an error",
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
  };

  static readonly EXT_PACER_API_ERROR: ErrorCodeDefinition = {
    code: "EXT_PACER_API_ERROR",
    httpStatus: HttpStatus.BAD_GATEWAY,
    message: "PACER API request failed",
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
  };

  static readonly EXT_EMAIL_DELIVERY_FAILED: ErrorCodeDefinition = {
    code: "EXT_EMAIL_DELIVERY_FAILED",
    httpStatus: HttpStatus.BAD_GATEWAY,
    message: "Email delivery failed",
    category: ErrorCategory.EXTERNAL_SERVICE,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
  };

  // ============================================================================
  // RATE LIMITING ERRORS (RATE_*)
  // ============================================================================
  static readonly RATE_LIMIT_EXCEEDED: ErrorCodeDefinition = {
    code: "RATE_LIMIT_EXCEEDED",
    httpStatus: HttpStatus.TOO_MANY_REQUESTS,
    message: "Rate limit exceeded. Please try again later",
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
  };

  static readonly RATE_LIMIT_API_KEY_EXCEEDED: ErrorCodeDefinition = {
    code: "RATE_LIMIT_API_KEY_EXCEEDED",
    httpStatus: HttpStatus.TOO_MANY_REQUESTS,
    message: "API key rate limit exceeded",
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
  };

  static readonly RATE_LIMIT_IP_BLOCKED: ErrorCodeDefinition = {
    code: "RATE_LIMIT_IP_BLOCKED",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "IP address has been temporarily blocked",
    category: ErrorCategory.RATE_LIMIT,
    severity: ErrorSeverity.HIGH,
    retryable: false,
  };

  // ============================================================================
  // SYSTEM ERRORS (SYS_*)
  // ============================================================================
  static readonly SYS_INTERNAL_ERROR: ErrorCodeDefinition = {
    code: "SYS_INTERNAL_ERROR",
    httpStatus: HttpStatus.INTERNAL_SERVER_ERROR,
    message: "An internal server error occurred",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    retryable: true,
  };

  static readonly SYS_SERVICE_DEGRADED: ErrorCodeDefinition = {
    code: "SYS_SERVICE_DEGRADED",
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
    message: "Service is operating in degraded mode",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  static readonly SYS_MAINTENANCE_MODE: ErrorCodeDefinition = {
    code: "SYS_MAINTENANCE_MODE",
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
    message: "System is currently under maintenance",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  static readonly SYS_CIRCUIT_BREAKER_OPEN: ErrorCodeDefinition = {
    code: "SYS_CIRCUIT_BREAKER_OPEN",
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
    message: "Service circuit breaker is open. Please try again later",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  static readonly SYS_RESOURCE_EXHAUSTED: ErrorCodeDefinition = {
    code: "SYS_RESOURCE_EXHAUSTED",
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
    message: "System resources are exhausted",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    retryable: true,
  };

  static readonly SYS_TIMEOUT: ErrorCodeDefinition = {
    code: "SYS_TIMEOUT",
    httpStatus: HttpStatus.REQUEST_TIMEOUT,
    message: "Request processing timed out",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  // ============================================================================
  // NETWORK ERRORS (NET_*)
  // ============================================================================
  static readonly NET_CONNECTION_REFUSED: ErrorCodeDefinition = {
    code: "NET_CONNECTION_REFUSED",
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
    message: "Network connection refused",
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  static readonly NET_TIMEOUT: ErrorCodeDefinition = {
    code: "NET_TIMEOUT",
    httpStatus: HttpStatus.REQUEST_TIMEOUT,
    message: "Network request timed out",
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
  };

  static readonly NET_DNS_LOOKUP_FAILED: ErrorCodeDefinition = {
    code: "NET_DNS_LOOKUP_FAILED",
    httpStatus: HttpStatus.SERVICE_UNAVAILABLE,
    message: "DNS lookup failed",
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.HIGH,
    retryable: true,
  };

  // ============================================================================
  // RESOURCE ERRORS (Generic)
  // ============================================================================
  static readonly RESOURCE_NOT_FOUND: ErrorCodeDefinition = {
    code: "RESOURCE_NOT_FOUND",
    httpStatus: HttpStatus.NOT_FOUND,
    message: "The requested resource was not found",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  // ============================================================================
  // USER MANAGEMENT ERRORS (USER_*)
  // ============================================================================
  static readonly USER_NOT_FOUND: ErrorCodeDefinition = {
    code: "USER_NOT_FOUND",
    httpStatus: HttpStatus.NOT_FOUND,
    message: "User not found",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly USER_ALREADY_EXISTS: ErrorCodeDefinition = {
    code: "USER_ALREADY_EXISTS",
    httpStatus: HttpStatus.CONFLICT,
    message: "User already exists",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.LOW,
    retryable: false,
  };

  static readonly USER_EMAIL_NOT_VERIFIED: ErrorCodeDefinition = {
    code: "USER_EMAIL_NOT_VERIFIED",
    httpStatus: HttpStatus.FORBIDDEN,
    message: "Email address has not been verified",
    category: ErrorCategory.BUSINESS_LOGIC,
    severity: ErrorSeverity.MEDIUM,
    retryable: false,
  };

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Get all error codes as a map
   */
  static getAllCodes(): Map<string, ErrorCodeDefinition> {
    const codes = new Map<string, ErrorCodeDefinition>();

    Object.entries(ErrorCodes).forEach(([_key, value]) => {
      if (typeof value === "object" && value !== null && "code" in value) {
        const val = value as ErrorCodeDefinition;
        codes.set(val.code, val);
      }
    });

    return codes;
  }

  /**
   * Get error code by code string
   */
  static getByCode(code: string): ErrorCodeDefinition | undefined {
    return this.getAllCodes().get(code);
  }

  /**
   * Get error codes by category
   */
  static getByCategory(category: ErrorCategory): ErrorCodeDefinition[] {
    return Array.from(this.getAllCodes().values()).filter(
      (def) => def.category === category
    );
  }

  /**
   * Get retryable error codes
   */
  static getRetryableErrors(): ErrorCodeDefinition[] {
    return Array.from(this.getAllCodes().values()).filter(
      (def) => def.retryable
    );
  }

  /**
   * Check if error code is retryable
   */
  static isRetryable(code: string): boolean {
    const errorDef = this.getByCode(code);
    return errorDef?.retryable ?? false;
  }
}
