import { HttpException, HttpStatus } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    public readonly code?: string,
    public readonly details?: any,
  ) {
    super(
      {
        statusCode: status,
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      status,
    );
  }
}

export class EntityNotFoundException extends BaseException {
  constructor(entityName: string, id: string) {
    super(
      `${entityName} with ID ${id} not found`,
      HttpStatus.NOT_FOUND,
      'ENTITY_NOT_FOUND',
      { entityName, id },
    );
  }
}

export class DuplicateEntityException extends BaseException {
  constructor(entityName: string, field: string, value: string) {
    super(
      `${entityName} with ${field} '${value}' already exists`,
      HttpStatus.CONFLICT,
      'DUPLICATE_ENTITY',
      { entityName, field, value },
    );
  }
}

export class ValidationException extends BaseException {
  constructor(message: string, errors?: any) {
    super(
      message,
      HttpStatus.BAD_REQUEST,
      'VALIDATION_ERROR',
      { errors },
    );
  }
}

export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized access') {
    super(
      message,
      HttpStatus.UNAUTHORIZED,
      'UNAUTHORIZED',
    );
  }
}

export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden resource') {
    super(
      message,
      HttpStatus.FORBIDDEN,
      'FORBIDDEN',
    );
  }
}

export class BusinessLogicException extends BaseException {
  constructor(message: string, details?: any) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'BUSINESS_LOGIC_ERROR',
      details,
    );
  }
}

export class ExternalServiceException extends BaseException {
  constructor(serviceName: string, message: string, details?: any) {
    super(
      `External service error: ${serviceName} - ${message}`,
      HttpStatus.SERVICE_UNAVAILABLE,
      'EXTERNAL_SERVICE_ERROR',
      { serviceName, ...details },
    );
  }
}

export class DatabaseException extends BaseException {
  constructor(operation: string, message: string, details?: any) {
    super(
      `Database operation failed: ${operation} - ${message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'DATABASE_ERROR',
      { operation, ...details },
    );
  }
}

export class FileNotFoundException extends BaseException {
  constructor(filePath: string) {
    super(
      `File not found: ${filePath}`,
      HttpStatus.NOT_FOUND,
      'FILE_NOT_FOUND',
      { filePath },
    );
  }
}

export class FileSizeException extends BaseException {
  constructor(maxSize: number, actualSize: number) {
    super(
      `File size exceeds maximum allowed size of ${maxSize} bytes`,
      HttpStatus.PAYLOAD_TOO_LARGE,
      'FILE_SIZE_EXCEEDED',
      { maxSize, actualSize },
    );
  }
}

export class InvalidFileTypeException extends BaseException {
  constructor(allowedTypes: string[], actualType: string) {
    super(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      HttpStatus.BAD_REQUEST,
      'INVALID_FILE_TYPE',
      { allowedTypes, actualType },
    );
  }
}

export class RateLimitException extends BaseException {
  constructor(limit: number, windowMs: number) {
    super(
      `Rate limit exceeded. Maximum ${limit} requests per ${windowMs}ms`,
      HttpStatus.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED',
      { limit, windowMs },
    );
  }
}

export class ConflictCheckException extends BaseException {
  constructor(message: string, conflicts: any[]) {
    super(
      message,
      HttpStatus.CONFLICT,
      'CONFLICT_CHECK_FAILED',
      { conflicts },
    );
  }
}

export class InsufficientPermissionsException extends BaseException {
  constructor(requiredPermissions: string[]) {
    super(
      'Insufficient permissions to perform this action',
      HttpStatus.FORBIDDEN,
      'INSUFFICIENT_PERMISSIONS',
      { requiredPermissions },
    );
  }
}
