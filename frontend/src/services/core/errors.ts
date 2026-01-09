/**
 * Domain Error Classes
 * Type-safe, semantic error hierarchy for LexiFlow services
 *
 * @module services/core/errors
 * @description Provides domain-specific error classes that replace generic
 * Error() throws. Enables:
 * - Type-safe error handling with instanceof checks
 * - Semantic error messages aligned with domain language
 * - HTTP status code mapping for API responses
 * - Better debugging with error codes and context
 * - Centralized error logging and monitoring
 *
 * @architecture
 * - Pattern: Error Hierarchy + Factory
 * - Base: DomainError extends Error
 * - Categories: NotFound, Validation, Authorization, Conflict, External
 * - Usage: throw new CaseNotFoundError(caseId)
 *
 * @usage
 * ```typescript
 * // In service
 * async getCase(id: CaseId): Promise<Case> {
 *   const case = await this.repository.findById(id);
 *   if (!case) {
 *     throw new CaseNotFoundError(id);  // 404 error
 *   }
 *   return case;
 * }
 *
 * // In error handler
 * try {
 *   await caseService.getCase(id);
 * } catch (err) {
 *   if (err instanceof CaseNotFoundError) {
 *     return res.status(err.statusCode).json({ error: err.toJSON() });
 *   }
 *   throw err;
 * }
 * ```
 */

// ============================================================================
// ERROR CODES & BASE CLASSES
// ============================================================================

export enum ErrorCode {
  // Validation errors (1000-1999)
  VALIDATION_FAILED = 1000,
  INVALID_EMAIL = 1001,
  INVALID_PHONE = 1002,
  INVALID_AMOUNT = 1003,
  INVALID_CURRENCY = 1004,

  // Business logic errors (2000-2999)
  INSUFFICIENT_FUNDS = 2000,
  CONFLICT_DETECTED = 2001,
  DUPLICATE_ENTRY = 2002,
  TRUST_VIOLATION = 2003,

  // Authorization errors (3000-3999)
  UNAUTHORIZED = 3000,
  FORBIDDEN = 3001,
  ETHICAL_WALL_VIOLATION = 3002,

  // System errors (9000-9999)
  BACKEND_UNAVAILABLE = 9000,
  DATABASE_ERROR = 9001,
  NETWORK_ERROR = 9002,
}

/**
 * Base domain error class
 * All domain errors extend this class for consistent error handling
 */
export class DomainError extends Error {
  public readonly timestamp: string;

  constructor(
    message: string,
    public readonly code: string | number,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serialize error for API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      ...(this.context && { context: this.context }),
    };
  }
}

// ============================================================================
// NOT FOUND ERRORS (404)
// ============================================================================

export class EntityNotFoundError extends DomainError {
  constructor(entityType: string, id: string) {
    super(`${entityType} not found: ${id}`, "ENTITY_NOT_FOUND", 404, {
      entityType,
      id,
    });
  }
}

export class CaseNotFoundError extends DomainError {
  constructor(caseId: string) {
    super(`Case not found: ${caseId}`, "CASE_NOT_FOUND", 404, { caseId });
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User not found: ${userId}`, "USER_NOT_FOUND", 404, { userId });
  }
}

export class DocumentNotFoundError extends DomainError {
  constructor(documentId: string) {
    super(`Document not found: ${documentId}`, "DOCUMENT_NOT_FOUND", 404, {
      documentId,
    });
  }
}

export class DocketEntryNotFoundError extends DomainError {
  constructor(entryId: string) {
    super(`Docket entry not found: ${entryId}`, "DOCKET_ENTRY_NOT_FOUND", 404, {
      entryId,
    });
  }
}

export class EvidenceNotFoundError extends DomainError {
  constructor(evidenceId: string) {
    super(`Evidence not found: ${evidenceId}`, "EVIDENCE_NOT_FOUND", 404, {
      evidenceId,
    });
  }
}

export class ClientNotFoundError extends DomainError {
  constructor(clientId: string) {
    super(`Client not found: ${clientId}`, "CLIENT_NOT_FOUND", 404, {
      clientId,
    });
  }
}

export class InvoiceNotFoundError extends DomainError {
  constructor(invoiceId: string) {
    super(`Invoice not found: ${invoiceId}`, "INVOICE_NOT_FOUND", 404, {
      invoiceId,
    });
  }
}

export class TaskNotFoundError extends DomainError {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`, "TASK_NOT_FOUND", 404, { taskId });
  }
}

export class WorkflowNotFoundError extends DomainError {
  constructor(workflowId: string) {
    super(`Workflow not found: ${workflowId}`, "WORKFLOW_NOT_FOUND", 404, {
      workflowId,
    });
  }
}

// ============================================================================
// VALIDATION ERRORS (400)
// ============================================================================

export class ValidationError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_FAILED, 400, context);
  }
}

export class InvalidInputError extends DomainError {
  constructor(field: string, reason: string) {
    super(
      `Invalid input for field '${field}': ${reason}`,
      "INVALID_INPUT",
      400,
      { field, reason }
    );
  }
}

export class MissingRequiredFieldError extends DomainError {
  constructor(field: string) {
    super(`Missing required field: ${field}`, "MISSING_REQUIRED_FIELD", 400, {
      field,
    });
  }
}

export class InvalidDateRangeError extends DomainError {
  constructor(startDate: string, endDate: string) {
    super(
      `Invalid date range: start (${startDate}) must be before end (${endDate})`,
      "INVALID_DATE_RANGE",
      400,
      { startDate, endDate }
    );
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(entityType: string, from: string, to: string) {
    super(
      `Invalid status transition for ${entityType}: ${from} → ${to}`,
      "INVALID_STATUS_TRANSITION",
      400,
      { entityType, from, to }
    );
  }
}

// ============================================================================
// AUTHORIZATION ERRORS (401, 403)
// ============================================================================

export class UnauthorizedError extends DomainError {
  constructor(message: string = "Authentication required") {
    super(message, "UNAUTHORIZED", 401);
  }
}

export class AuthenticationError extends DomainError {
  constructor(message: string = "Authentication failed") {
    super(message, "AUTHENTICATION_ERROR", 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = "Access denied") {
    super(message, "FORBIDDEN", 403);
  }
}

export class InsufficientPermissionsError extends DomainError {
  constructor(requiredPermission: string) {
    super(
      `Insufficient permissions: requires '${requiredPermission}'`,
      "INSUFFICIENT_PERMISSIONS",
      403,
      { requiredPermission }
    );
  }
}

export class EthicalWallViolationError extends DomainError {
  constructor(userId: string, caseId: string) {
    super(
      `Ethical wall violation: user ${userId} cannot access case ${caseId}`,
      "ETHICAL_WALL_VIOLATION",
      403,
      { userId, caseId }
    );
  }
}

// ============================================================================
// CONFLICT ERRORS (409)
// ============================================================================

export class ConflictError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CONFLICT", 409, context);
  }
}

export class DuplicateEntityError extends DomainError {
  constructor(entityType: string, identifier: string) {
    super(
      `${entityType} already exists: ${identifier}`,
      "DUPLICATE_ENTITY",
      409,
      { entityType, identifier }
    );
  }
}

export class ConcurrentModificationError extends DomainError {
  constructor(entityType: string, id: string) {
    super(
      `${entityType} ${id} was modified by another user`,
      "CONCURRENT_MODIFICATION",
      409,
      { entityType, id }
    );
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string, reason: string) {
    super(
      `Business rule violation: ${rule} - ${reason}`,
      "BUSINESS_RULE_VIOLATION",
      409,
      { rule, reason }
    );
  }
}

// ============================================================================
// EXTERNAL SERVICE ERRORS (502, 503, 504)
// ============================================================================

export class ExternalServiceError extends DomainError {
  constructor(service: string, message: string, statusCode: number = 502) {
    super(
      `External service error (${service}): ${message}`,
      "EXTERNAL_SERVICE_ERROR",
      statusCode,
      { service }
    );
  }
}

export class ApiTimeoutError extends DomainError {
  constructor(endpoint: string, timeoutMs: number) {
    super(
      `API timeout: ${endpoint} exceeded ${timeoutMs}ms`,
      "API_TIMEOUT",
      504,
      { endpoint, timeoutMs }
    );
  }
}

export class ServiceUnavailableError extends DomainError {
  constructor(service: string) {
    super(`Service unavailable: ${service}`, "SERVICE_UNAVAILABLE", 503, {
      service,
    });
  }
}

// ============================================================================
// OPERATION ERRORS (500)
// ============================================================================

export class OperationError extends DomainError {
  constructor(operation: string, reason?: string) {
    super(
      `Operation failed: ${operation}${reason ? ` - ${reason}` : ""}`,
      "OPERATION_ERROR",
      500,
      { operation, reason }
    );
  }
}

// ============================================================================
// CONCURRENCY ERRORS (409)
// ============================================================================

export class ConcurrencyError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.CONFLICT_DETECTED, 409, context);
  }
}

// ============================================================================
// COMPLIANCE ERRORS (422)
// ============================================================================

export class ComplianceError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.CONFLICT_DETECTED, 409, context);
  }
}

export class WorkerPoolInitializationError extends DomainError {
  constructor(workerCount: number) {
    super(
      `Failed to initialize worker pool with ${workerCount} workers`,
      "WORKER_POOL_INIT_ERROR",
      500,
      { workerCount }
    );
  }
}

export class WorkflowExecutionError extends DomainError {
  constructor(workflowId: string, nodeId: string, reason: string) {
    super(
      `Workflow execution failed: ${workflowId} at node ${nodeId} - ${reason}`,
      "WORKFLOW_EXECUTION_ERROR",
      500,
      { workflowId, nodeId, reason }
    );
  }
}

export class SearchIndexError extends DomainError {
  constructor(reason: string) {
    super(`Search index error: ${reason}`, "SEARCH_INDEX_ERROR", 500, {
      reason,
    });
  }
}

export class FileProcessingError extends DomainError {
  constructor(fileName: string, reason: string) {
    super(
      `File processing error: ${fileName} - ${reason}`,
      "FILE_PROCESSING_ERROR",
      500,
      { fileName, reason }
    );
  }
}

export class NetworkError extends DomainError {
  constructor(message: string = "Network error occurred") {
    super(message, "NETWORK_ERROR", 0);
  }
}

// ============================================================================
// CONFIGURATION ERRORS
// ============================================================================

export class ConfigurationError extends DomainError {
  constructor(setting: string, reason: string) {
    super(
      `Configuration error: ${setting} - ${reason}`,
      "CONFIGURATION_ERROR",
      500,
      { setting, reason }
    );
  }
}

export class InvalidEndpointError extends DomainError {
  constructor(endpoint: string) {
    super(`Invalid endpoint: ${endpoint}`, "INVALID_ENDPOINT", 400, {
      endpoint,
    });
  }
}

export class MissingConfigurationError extends DomainError {
  constructor(configKey: string) {
    super(
      `Missing required configuration: ${configKey}`,
      "MISSING_CONFIGURATION",
      500,
      { configKey }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if error is a domain error
 */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/**
 * Extract error message safely from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

/**
 * Extract status code from error (defaults to 500)
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof DomainError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Convert unknown error to DomainError
 */
export function toDomainError(error: unknown): DomainError {
  if (error instanceof DomainError) {
    return error;
  }

  const message = getErrorMessage(error);
  return new OperationError("unknown", message);
}
