import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { BusinessException } from '../../errors/exceptions/business.exceptions';
import { ErrorCategory, ErrorSeverity, ErrorCodes } from '../../errors/constants/error.codes.constant';

/**
 * Enhanced Error Response
 */
export interface EnhancedErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  correlationId: string;
  error: string;
  errorCode: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  retryable: boolean;
  validationErrors?: string[];
  details?: Record<string, any>;
  stack?: string;
  requestContext?: {
    ip?: string;
    userAgent?: string;
    userId?: string;
  };
  suggestedAction?: string;
}

/**
 * Enhanced Enterprise Exception Filter
 * Provides comprehensive error handling with:
 * - Detailed error categorization
 * - Error code mapping
 * - Correlation ID propagation
 * - Request context tracking
 * - Production vs development responses
 * - Integration with error reporting service
 */
@Injectable()
@Catch()
export class EnterpriseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(EnterpriseExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getHttpStatus(exception);
    const errorResponse = this.buildEnhancedErrorResponse(exception, request, status);

    // Log error with appropriate level
    this.logError(exception, request, errorResponse);

    // Send response
    response.status(status).json(errorResponse);
  }

  /**
   * Determine HTTP status code from exception
   */
  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (exception instanceof QueryFailedError) {
      return this.getStatusFromDatabaseError(exception);
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Build enhanced error response
   */
  private buildEnhancedErrorResponse(
    exception: unknown,
    request: Request,
    status: number,
  ): EnhancedErrorResponse {
    const correlationId = (request as any).correlationId || this.generateCorrelationId();
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // Extract error information
    const errorInfo = this.extractErrorInfo(exception);

    // Base response
    const errorResponse: EnhancedErrorResponse = {
      statusCode: status,
      timestamp,
      path,
      method,
      correlationId,
      error: errorInfo.name,
      errorCode: errorInfo.code,
      message: errorInfo.message,
      category: errorInfo.category,
      severity: errorInfo.severity,
      retryable: errorInfo.retryable,
      requestContext: this.buildRequestContext(request),
      suggestedAction: this.getSuggestedAction(errorInfo.code, errorInfo.retryable),
    };

    // Add validation errors if present
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      if (typeof response === 'object' && 'message' in response) {
        const msg = (response as any).message;
        if (Array.isArray(msg)) {
          errorResponse.validationErrors = msg;
        }
      }
    }

    // Add business exception context
    if (exception instanceof BusinessException) {
      if (exception.context) {
        errorResponse.details = this.sanitizeDetails(exception.context);
      }
    }

    // Add DB error details (sanitized)
    if (exception instanceof QueryFailedError) {
      errorResponse.details = this.sanitizeDatabaseError(exception);
    }

    // Add stack trace in development only
    if (this.shouldIncludeStack()) {
      if (exception instanceof Error) {
        errorResponse.stack = this.sanitizeStackTrace(exception.stack);
      }
    }

    return errorResponse;
  }

  /**
   * Extract error information from exception
   */
  private extractErrorInfo(exception: unknown): {
    name: string;
    code: string;
    message: string;
    category: ErrorCategory;
    severity: ErrorSeverity;
    retryable: boolean;
  } {
    // Business exceptions have full error info
    if (exception instanceof BusinessException) {
      return {
        name: exception.constructor.name,
        code: exception.errorCode,
        message: exception.message,
        category: exception.errorDefinition.category,
        severity: exception.errorDefinition.severity,
        retryable: exception.errorDefinition.retryable,
      };
    }

    // HTTP exceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = this.extractHttpExceptionMessage(exception);
      const errorCode = this.mapHttpStatusToErrorCode(status);
      const errorDef = ErrorCodes.getByCode(errorCode);

      return {
        name: exception.constructor.name,
        code: errorCode,
        message,
        category: errorDef?.category || ErrorCategory.SYSTEM,
        severity: errorDef?.severity || this.inferSeverityFromStatus(status),
        retryable: errorDef?.retryable || false,
      };
    }

    // Database errors
    if (exception instanceof QueryFailedError) {
      const dbErrorCode = this.getDatabaseErrorCode(exception);
      const errorDef = ErrorCodes.getByCode(dbErrorCode);

      return {
        name: 'DatabaseError',
        code: dbErrorCode,
        message: 'A database error occurred',
        category: ErrorCategory.DATABASE,
        severity: errorDef?.severity || ErrorSeverity.HIGH,
        retryable: errorDef?.retryable || true,
      };
    }

    // Generic errors
    if (exception instanceof Error) {
      return {
        name: exception.name,
        code: 'SYS_INTERNAL_ERROR',
        message: exception.message,
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.CRITICAL,
        retryable: false,
      };
    }

    // Unknown errors
    return {
      name: 'UnknownError',
      code: 'SYS_INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.CRITICAL,
      retryable: false,
    };
  }

  /**
   * Extract message from HTTP exception
   */
  private extractHttpExceptionMessage(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && 'message' in response) {
      const msg = (response as any).message;
      return Array.isArray(msg) ? msg.join(', ') : msg;
    }

    return exception.message;
  }

  /**
   * Map HTTP status to error code
   */
  private mapHttpStatusToErrorCode(status: number): string {
    const statusMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VAL_INVALID_INPUT',
      [HttpStatus.UNAUTHORIZED]: 'AUTH_TOKEN_INVALID',
      [HttpStatus.FORBIDDEN]: 'AUTHZ_INSUFFICIENT_PERMISSIONS',
      [HttpStatus.NOT_FOUND]: 'USER_NOT_FOUND',
      [HttpStatus.CONFLICT]: 'DB_DUPLICATE_ENTRY',
      [HttpStatus.REQUEST_TIMEOUT]: 'SYS_TIMEOUT',
      [HttpStatus.PAYLOAD_TOO_LARGE]: 'DOC_FILE_TOO_LARGE',
      [HttpStatus.TOO_MANY_REQUESTS]: 'RATE_LIMIT_EXCEEDED',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'SYS_INTERNAL_ERROR',
      [HttpStatus.SERVICE_UNAVAILABLE]: 'EXT_SERVICE_UNAVAILABLE',
      [HttpStatus.GATEWAY_TIMEOUT]: 'EXT_SERVICE_TIMEOUT',
    };

    return statusMap[status] || 'SYS_INTERNAL_ERROR';
  }

  /**
   * Get database error code
   */
  private getDatabaseErrorCode(exception: QueryFailedError): string {
    const driverError = exception.driverError as any;

    // PostgreSQL error codes
    if (driverError?.code) {
      switch (driverError.code) {
        case '23505': // unique_violation
          return 'DB_DUPLICATE_ENTRY';
        case '23503': // foreign_key_violation
        case '23502': // not_null_violation
        case '23514': // check_violation
          return 'DB_CONSTRAINT_VIOLATION';
        case '40P01': // deadlock_detected
          return 'DB_DEADLOCK_DETECTED';
        case '57014': // query_canceled
          return 'DB_QUERY_TIMEOUT';
        case '08000': // connection_exception
        case '08003': // connection_does_not_exist
        case '08006': // connection_failure
          return 'DB_CONNECTION_FAILED';
        default:
          return 'DB_TRANSACTION_FAILED';
      }
    }

    return 'DB_TRANSACTION_FAILED';
  }

  /**
   * Get status from database error
   */
  private getStatusFromDatabaseError(exception: QueryFailedError): number {
    const driverError = exception.driverError as any;

    if (driverError?.code === '23505') {
      return HttpStatus.CONFLICT;
    }

    if (driverError?.code === '23503' || driverError?.code === '23502') {
      return HttpStatus.BAD_REQUEST;
    }

    if (driverError?.code === '57014') {
      return HttpStatus.REQUEST_TIMEOUT;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Infer severity from HTTP status
   */
  private inferSeverityFromStatus(status: number): ErrorSeverity {
    if (status >= 500) {
      return ErrorSeverity.CRITICAL;
    }

    if (status >= 400 && status < 500) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Build request context
   */
  private buildRequestContext(request: Request): {
    ip?: string;
    userAgent?: string;
    userId?: string;
  } {
    const user = (request as any).user;

    return {
      ip: this.getClientIp(request),
      userAgent: request.headers['user-agent'],
      userId: user?.id || user?.userId,
    };
  }

  /**
   * Get client IP address
   */
  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];

    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }

    return request.ip || request.socket.remoteAddress || 'unknown';
  }

  /**
   * Get suggested action for error
   */
  private getSuggestedAction(errorCode: string, retryable: boolean): string {
    if (retryable) {
      return 'This error is retryable. Please try again in a few moments.';
    }

    if (errorCode.startsWith('AUTH_')) {
      return 'Please check your authentication credentials and try again.';
    }

    if (errorCode.startsWith('AUTHZ_')) {
      return 'You do not have permission to perform this action. Please contact your administrator.';
    }

    if (errorCode.startsWith('VAL_')) {
      return 'Please check your input data and try again.';
    }

    if (errorCode.startsWith('DOC_')) {
      return 'Please verify your document and try uploading again.';
    }

    if (errorCode.startsWith('RATE_')) {
      return 'You have exceeded the rate limit. Please wait before trying again.';
    }

    return 'If this problem persists, please contact support.';
  }

  /**
   * Sanitize error details for response
   */
  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken'];

    Object.keys(details).forEach((key) => {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = details[key];
      }
    });

    return sanitized;
  }

  /**
   * Sanitize database error
   */
  private sanitizeDatabaseError(exception: QueryFailedError): Record<string, any> {
    const driverError = exception.driverError as any;

    return {
      constraint: driverError?.constraint,
      table: driverError?.table,
      column: driverError?.column,
      code: driverError?.code,
    };
  }

  /**
   * Sanitize stack trace
   */
  private sanitizeStackTrace(stack?: string): string | undefined {
    if (!stack) return undefined;

    return stack
      .split('\n')
      .filter((line) => !line.includes('node_modules'))
      .slice(0, 10)
      .join('\n');
  }

  /**
   * Check if stack should be included
   */
  private shouldIncludeStack(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Log error with appropriate level
   */
  private logError(
    exception: unknown,
    request: Request,
    errorResponse: EnhancedErrorResponse,
  ): void {
    const logContext = {
      correlationId: errorResponse.correlationId,
      method: errorResponse.method,
      path: errorResponse.path,
      statusCode: errorResponse.statusCode,
      errorCode: errorResponse.errorCode,
      category: errorResponse.category,
      severity: errorResponse.severity,
      userId: errorResponse.requestContext?.userId,
      ip: errorResponse.requestContext?.ip,
    };

    const logMessage = `${errorResponse.error}: ${errorResponse.message}`;

    switch (errorResponse.severity) {
      case ErrorSeverity.CRITICAL:
        this.logger.error(`CRITICAL: ${logMessage}`, JSON.stringify(logContext));
        break;

      case ErrorSeverity.HIGH:
        this.logger.error(`HIGH: ${logMessage}`, JSON.stringify(logContext));
        break;

      case ErrorSeverity.MEDIUM:
        this.logger.warn(`MEDIUM: ${logMessage}`, JSON.stringify(logContext));
        break;

      case ErrorSeverity.LOW:
        this.logger.log(`LOW: ${logMessage}`, JSON.stringify(logContext));
        break;

      default:
        this.logger.warn(logMessage, JSON.stringify(logContext));
    }

    // Log stack trace for server errors in development
    if (
      errorResponse.statusCode >= 500 &&
      this.shouldIncludeStack() &&
      exception instanceof Error
    ) {
      this.logger.debug(exception.stack);
    }
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
