import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodes, ErrorCodeDefinition } from '@errors/constants/error.codes.constant';

/**
 * Base Business Exception
 * All domain-specific exceptions extend this class
 */
export class BusinessException extends HttpException {
  public readonly errorCode: string;
  public readonly errorDefinition: ErrorCodeDefinition;
  public readonly timestamp: string;
  public readonly context?: Record<string, any>;

  constructor(
    errorDefinition: ErrorCodeDefinition,
    context?: Record<string, any>,
  ) {
    super(
      {
        statusCode: errorDefinition.httpStatus,
        message: errorDefinition.message,
        errorCode: errorDefinition.code,
        category: errorDefinition.category,
        severity: errorDefinition.severity,
        context,
      },
      errorDefinition.httpStatus,
    );

    this.errorCode = errorDefinition.code;
    this.errorDefinition = errorDefinition;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Conflict of Interest Exception
 * Thrown when a conflict of interest is detected
 */
export class ConflictOfInterestException extends BusinessException {
  constructor(context?: { caseId?: string; clientId?: string; conflictDetails?: string }) {
    super(ErrorCodes.CASE_CONFLICT_OF_INTEREST, context);
  }
}

/**
 * Insufficient Permission Exception
 * Thrown when user lacks required permissions
 */
export class InsufficientPermissionException extends BusinessException {
  constructor(context?: { requiredPermission?: string; userId?: string; resource?: string }) {
    super(ErrorCodes.AUTHZ_INSUFFICIENT_PERMISSIONS, context);
  }
}

/**
 * Resource Not Found Exception
 * Generic exception for when a resource is not found
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(
    resourceType: string,
    resourceId: string,
    additionalContext?: Record<string, any>,
  ) {
    const errorDef = ErrorCodes.USER_NOT_FOUND;
    const customErrorDef: ErrorCodeDefinition = {
      ...errorDef,
      code: `${resourceType.toUpperCase()}_NOT_FOUND`,
      message: `${resourceType} not found`,
    };

    super(customErrorDef, {
      resourceType,
      resourceId,
      ...additionalContext,
    });
  }
}

/**
 * Validation Failed Exception
 * Thrown when business validation fails
 */
export class ValidationFailedException extends BusinessException {
  constructor(
    validationErrors: Array<{ field: string; message: string }>,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.VAL_INVALID_INPUT, {
      validationErrors,
      ...context,
    });
  }
}

/**
 * Rate Limit Exceeded Exception
 * Thrown when rate limit is exceeded
 */
export class RateLimitExceededException extends BusinessException {
  constructor(context?: {
    limit?: number;
    timeWindow?: number;
    retryAfter?: number;
    identifier?: string;
  }) {
    super(ErrorCodes.RATE_LIMIT_EXCEEDED, context);
  }
}

/**
 * Session Expired Exception
 * Thrown when user session expires
 */
export class SessionExpiredException extends BusinessException {
  constructor(context?: { userId?: string; sessionId?: string; expiredAt?: string }) {
    super(ErrorCodes.AUTH_SESSION_EXPIRED, context);
  }
}

/**
 * Case Not Found Exception
 * Thrown when a case is not found
 */
export class CaseNotFoundException extends BusinessException {
  constructor(caseId: string, context?: Record<string, any>) {
    super(ErrorCodes.CASE_NOT_FOUND, { caseId, ...context });
  }
}

/**
 * Case Already Closed Exception
 * Thrown when attempting to modify a closed case
 */
export class CaseAlreadyClosedException extends BusinessException {
  constructor(caseId: string, context?: Record<string, any>) {
    super(ErrorCodes.CASE_ALREADY_CLOSED, { caseId, ...context });
  }
}

/**
 * Invalid Status Transition Exception
 * Thrown when an invalid status transition is attempted
 */
export class InvalidStatusTransitionException extends BusinessException {
  constructor(
    currentStatus: string,
    targetStatus: string,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.CASE_INVALID_STATUS_TRANSITION, {
      currentStatus,
      targetStatus,
      ...context,
    });
  }
}

/**
 * Document Not Found Exception
 * Thrown when a document is not found
 */
export class DocumentNotFoundException extends BusinessException {
  constructor(documentId: string, context?: Record<string, any>) {
    super(ErrorCodes.DOC_NOT_FOUND, { documentId, ...context });
  }
}

/**
 * Document Locked Exception
 * Thrown when attempting to modify a locked document
 */
export class DocumentLockedException extends BusinessException {
  constructor(
    documentId: string,
    lockedBy: string,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.DOC_LOCKED_BY_ANOTHER_USER, {
      documentId,
      lockedBy,
      ...context,
    });
  }
}

/**
 * Document Version Conflict Exception
 * Thrown when a document version conflict occurs
 */
export class DocumentVersionConflictException extends BusinessException {
  constructor(
    documentId: string,
    currentVersion: number,
    attemptedVersion: number,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.DOC_VERSION_CONFLICT, {
      documentId,
      currentVersion,
      attemptedVersion,
      ...context,
    });
  }
}

/**
 * File Too Large Exception
 * Thrown when uploaded file exceeds size limit
 */
export class FileTooLargeException extends BusinessException {
  constructor(
    fileSize: number,
    maxSize: number,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.DOC_FILE_TOO_LARGE, {
      fileSize,
      maxSize,
      fileSizeMB: (fileSize / 1024 / 1024).toFixed(2),
      maxSizeMB: (maxSize / 1024 / 1024).toFixed(2),
      ...context,
    });
  }
}

/**
 * Invalid File Type Exception
 * Thrown when uploaded file type is not allowed
 */
export class InvalidFileTypeException extends BusinessException {
  constructor(
    fileType: string,
    allowedTypes: string[],
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.DOC_INVALID_FILE_TYPE, {
      fileType,
      allowedTypes,
      ...context,
    });
  }
}

/**
 * Virus Detected Exception
 * Thrown when virus is detected in uploaded file
 */
export class VirusDetectedException extends BusinessException {
  constructor(fileName: string, virusName?: string, context?: Record<string, any>) {
    super(ErrorCodes.DOC_VIRUS_DETECTED, {
      fileName,
      virusName,
      ...context,
    });
  }
}

/**
 * Ethical Wall Violation Exception
 * Thrown when ethical wall violation is detected
 */
export class EthicalWallViolationException extends BusinessException {
  constructor(
    userId: string,
    resourceId: string,
    wallDescription: string,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.COMP_ETHICAL_WALL_VIOLATION, {
      userId,
      resourceId,
      wallDescription,
      ...context,
    });
  }
}

/**
 * Database Constraint Violation Exception
 * Thrown when database constraint is violated
 */
export class DatabaseConstraintViolationException extends BusinessException {
  constructor(
    constraint: string,
    table?: string,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.DB_CONSTRAINT_VIOLATION, {
      constraint,
      table,
      ...context,
    });
  }
}

/**
 * Duplicate Entry Exception
 * Thrown when attempting to create duplicate entry
 */
export class DuplicateEntryException extends BusinessException {
  constructor(
    field: string,
    value: string,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.DB_DUPLICATE_ENTRY, {
      field,
      value,
      ...context,
    });
  }
}

/**
 * External Service Unavailable Exception
 * Thrown when external service is unavailable
 */
export class ExternalServiceUnavailableException extends BusinessException {
  constructor(
    serviceName: string,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.EXT_SERVICE_UNAVAILABLE, {
      serviceName,
      ...context,
    });
  }
}

/**
 * External Service Timeout Exception
 * Thrown when external service times out
 */
export class ExternalServiceTimeoutException extends BusinessException {
  constructor(
    serviceName: string,
    timeout: number,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.EXT_SERVICE_TIMEOUT, {
      serviceName,
      timeout,
      timeoutSeconds: timeout / 1000,
      ...context,
    });
  }
}

/**
 * Circuit Breaker Open Exception
 * Thrown when circuit breaker is open
 */
export class CircuitBreakerOpenException extends BusinessException {
  constructor(
    circuitName: string,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.SYS_CIRCUIT_BREAKER_OPEN, {
      circuitName,
      ...context,
    });
  }
}

/**
 * Database Connection Failed Exception
 * Thrown when database connection fails
 */
export class DatabaseConnectionFailedException extends BusinessException {
  constructor(context?: Record<string, any>) {
    super(ErrorCodes.DB_CONNECTION_FAILED, context);
  }
}

/**
 * Database Timeout Exception
 * Thrown when database query times out
 */
export class DatabaseTimeoutException extends BusinessException {
  constructor(query?: string, timeout?: number, context?: Record<string, any>) {
    super(ErrorCodes.DB_QUERY_TIMEOUT, {
      query: query ? query.substring(0, 100) : undefined,
      timeout,
      ...context,
    });
  }
}

/**
 * Payment Failed Exception
 * Thrown when payment processing fails
 */
export class PaymentFailedException extends BusinessException {
  constructor(
    paymentId: string,
    reason: string,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.BILL_PAYMENT_FAILED, {
      paymentId,
      reason,
      ...context,
    });
  }
}

/**
 * Insufficient Trust Funds Exception
 * Thrown when trust account has insufficient funds
 */
export class InsufficientTrustFundsException extends BusinessException {
  constructor(
    accountId: string,
    available: number,
    required: number,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.BILL_INSUFFICIENT_TRUST_FUNDS, {
      accountId,
      available,
      required,
      shortfall: required - available,
      ...context,
    });
  }
}

/**
 * Account Locked Exception
 * Thrown when account is locked
 */
export class AccountLockedException extends BusinessException {
  constructor(
    userId: string,
    lockReason: string,
    unlockAt?: Date,
    context?: Record<string, any>,
  ) {
    super(ErrorCodes.AUTH_ACCOUNT_LOCKED, {
      userId,
      lockReason,
      unlockAt: unlockAt?.toISOString(),
      ...context,
    });
  }
}

/**
 * MFA Required Exception
 * Thrown when MFA is required but not provided
 */
export class MfaRequiredException extends BusinessException {
  constructor(userId: string, context?: Record<string, any>) {
    super(ErrorCodes.AUTH_MFA_REQUIRED, {
      userId,
      ...context,
    });
  }
}

/**
 * Invalid MFA Code Exception
 * Thrown when provided MFA code is invalid
 */
export class InvalidMfaCodeException extends BusinessException {
  constructor(userId: string, context?: Record<string, any>) {
    super(ErrorCodes.AUTH_MFA_INVALID, {
      userId,
      ...context,
    });
  }
}

/**
 * Token Expired Exception
 * Thrown when authentication token has expired
 */
export class TokenExpiredException extends BusinessException {
  constructor(tokenType: string, context?: Record<string, any>) {
    super(ErrorCodes.AUTH_TOKEN_EXPIRED, {
      tokenType,
      ...context,
    });
  }
}

/**
 * Token Invalid Exception
 * Thrown when authentication token is invalid
 */
export class TokenInvalidException extends BusinessException {
  constructor(tokenType: string, reason?: string, context?: Record<string, any>) {
    super(ErrorCodes.AUTH_TOKEN_INVALID, {
      tokenType,
      reason,
      ...context,
    });
  }
}

/**
 * Resource Exhausted Exception
 * Thrown when system resources are exhausted
 */
export class ResourceExhaustedException extends BusinessException {
  constructor(resourceType: string, context?: Record<string, any>) {
    super(ErrorCodes.SYS_RESOURCE_EXHAUSTED, {
      resourceType,
      ...context,
    });
  }
}
