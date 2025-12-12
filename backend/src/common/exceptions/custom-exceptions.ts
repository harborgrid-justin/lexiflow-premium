import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base custom exception class with correlation ID support
 */
export class BaseCustomException extends HttpException {
  public readonly correlationId: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    status: HttpStatus,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(message, status);
    this.correlationId = correlationId || this.generateCorrelationId();
    this.timestamp = new Date();
    this.context = context;
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  toJSON() {
    return {
      statusCode: this.getStatus(),
      message: this.message,
      correlationId: this.correlationId,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}

/**
 * Business logic validation exception
 */
export class ValidationException extends BaseCustomException {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(message, HttpStatus.BAD_REQUEST, correlationId, context);
  }
}

/**
 * Resource not found exception
 */
export class NotFoundException extends BaseCustomException {
  constructor(
    resource: string,
    identifier?: string | number,
    correlationId?: string,
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, HttpStatus.NOT_FOUND, correlationId, { resource, identifier });
  }
}

/**
 * Unauthorized access exception
 */
export class UnauthorizedException extends BaseCustomException {
  constructor(message = 'Unauthorized access', correlationId?: string) {
    super(message, HttpStatus.UNAUTHORIZED, correlationId);
  }
}

/**
 * Forbidden access exception
 */
export class ForbiddenException extends BaseCustomException {
  constructor(message = 'Forbidden resource', correlationId?: string, context?: Record<string, any>) {
    super(message, HttpStatus.FORBIDDEN, correlationId, context);
  }
}

/**
 * Conflict exception (e.g., duplicate entries)
 */
export class ConflictException extends BaseCustomException {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(message, HttpStatus.CONFLICT, correlationId, context);
  }
}

/**
 * External service failure exception
 */
export class ExternalServiceException extends BaseCustomException {
  constructor(
    serviceName: string,
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(
      `External service '${serviceName}' error: ${message}`,
      HttpStatus.BAD_GATEWAY,
      correlationId,
      { serviceName, ...context },
    );
  }
}

/**
 * Database operation exception
 */
export class DatabaseException extends BaseCustomException {
  constructor(
    operation: string,
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Database ${operation} failed: ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      correlationId,
      { operation, ...context },
    );
  }
}

/**
 * Rate limit exceeded exception
 */
export class RateLimitException extends BaseCustomException {
  constructor(
    limit: number,
    window: string,
    correlationId?: string,
  ) {
    super(
      `Rate limit exceeded: ${limit} requests per ${window}`,
      HttpStatus.TOO_MANY_REQUESTS,
      correlationId,
      { limit, window },
    );
  }
}

/**
 * File processing exception
 */
export class FileProcessingException extends BaseCustomException {
  constructor(
    fileName: string,
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(
      `File processing error for '${fileName}': ${message}`,
      HttpStatus.UNPROCESSABLE_ENTITY,
      correlationId,
      { fileName, ...context },
    );
  }
}

/**
 * AI/ML service exception
 */
export class AIServiceException extends BaseCustomException {
  constructor(
    operation: string,
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(
      `AI service error during '${operation}': ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      correlationId,
      { operation, ...context },
    );
  }
}

/**
 * Payment processing exception
 */
export class PaymentException extends BaseCustomException {
  constructor(
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Payment processing error: ${message}`,
      HttpStatus.PAYMENT_REQUIRED,
      correlationId,
      context,
    );
  }
}

/**
 * Legal compliance exception
 */
export class ComplianceException extends BaseCustomException {
  constructor(
    regulation: string,
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Compliance violation (${regulation}): ${message}`,
      HttpStatus.FORBIDDEN,
      correlationId,
      { regulation, ...context },
    );
  }
}

/**
 * Document generation exception
 */
export class DocumentGenerationException extends BaseCustomException {
  constructor(
    documentType: string,
    message: string,
    correlationId?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Document generation error for '${documentType}': ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      correlationId,
      { documentType, ...context },
    );
  }
}
