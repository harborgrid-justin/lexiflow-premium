import {
  SuccessResponseDto,
  ErrorResponseDto,
  ResponseMetaDto,
  PaginatedResponseDto,
  PaginationMetaDto,
  ApiErrorDto,
  BatchOperationResponseDto,
  BatchOperationErrorDto,
} from '@common/dto';
import { HttpStatus } from '@nestjs/common';
import { Request } from 'express';

/**
 * Request with metadata
 */
export interface RequestWithMetadata extends Request {
  correlationId?: string;
}

/**
 * Response Helper Utilities
 * Provides consistent response formatting across the API
 */
export class ResponseHelper {
  /**
   * Create a success response
   */
  static success<T>(
    data: T,
    meta: Partial<ResponseMetaDto>,
  ): SuccessResponseDto<T> {
    return new SuccessResponseDto(data, this.buildMeta(meta));
  }

  /**
   * Create an error response
   */
  static error(
    error: Partial<ApiErrorDto>,
    meta: Partial<ResponseMetaDto>,
  ): ErrorResponseDto {
    const errorDto: ApiErrorDto = {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An error occurred',
      statusCode: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      validationErrors: error.validationErrors,
      details: error.details,
      stack: this.shouldIncludeStack() ? error.stack : undefined,
    };

    return new ErrorResponseDto(errorDto, this.buildMeta(meta));
  }

  /**
   * Create a paginated response
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    meta: Partial<ResponseMetaDto>,
  ): PaginatedResponseDto<T> {
    const pagination = new PaginationMetaDto(total, page, limit);
    return new PaginatedResponseDto(data, pagination, this.buildMeta(meta));
  }

  /**
   * Create a batch operation response
   */
  static batch<T>(
    succeeded: T[],
    failed: BatchOperationErrorDto[],
  ): BatchOperationResponseDto<T> {
    return new BatchOperationResponseDto(succeeded, failed);
  }

  /**
   * Create a no content response (for deletes)
   */
  static noContent(): void {
    return;
  }

  /**
   * Build response metadata
   */
  private static buildMeta(meta: Partial<ResponseMetaDto>): ResponseMetaDto {
    return {
      timestamp: meta.timestamp || new Date().toISOString(),
      correlationId: meta.correlationId || this.generateCorrelationId(),
      responseTime: meta.responseTime || '0ms',
      path: meta.path || '',
      method: meta.method || '',
      version: meta.version || 'v1',
      ...meta,
    };
  }

  /**
   * Generate a correlation ID
   */
  private static generateCorrelationId(): string {
    return require('crypto').randomUUID();
  }

  /**
   * Check if stack traces should be included
   */
  private static shouldIncludeStack(): boolean {
    return process.env.NODE_ENV !== 'production';
  }
}

/**
 * Pagination Helper Utilities
 */
export class PaginationHelper {
  /**
   * Calculate skip/offset for pagination
   */
  static calculateSkip(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Calculate total pages
   */
  static calculateTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
  }

  /**
   * Check if there is a next page
   */
  static hasNextPage(page: number, total: number, limit: number): boolean {
    return page < this.calculateTotalPages(total, limit);
  }

  /**
   * Check if there is a previous page
   */
  static hasPreviousPage(page: number): boolean {
    return page > 1;
  }

  /**
   * Validate pagination parameters
   */
  static validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('Page must be at least 1');
    }

    if (limit < 1) {
      throw new Error('Limit must be at least 1');
    }

    if (limit > 100) {
      throw new Error('Limit cannot exceed 100');
    }
  }

  /**
   * Build pagination metadata
   */
  static buildMetadata(
    total: number,
    page: number,
    limit: number,
  ): PaginationMetaDto {
    this.validatePagination(page, limit);
    return new PaginationMetaDto(total, page, limit);
  }
}

/**
 * Error Helper Utilities
 */
export class ErrorHelper {
  /**
   * Create a validation error response
   */
  static validationError(
    message: string,
    validationErrors: string[],
    meta: Partial<ResponseMetaDto>,
  ): ErrorResponseDto {
    return ResponseHelper.error(
      {
        code: 'VAL_INVALID_INPUT',
        message,
        statusCode: HttpStatus.BAD_REQUEST,
        validationErrors,
      },
      meta,
    );
  }

  /**
   * Create a not found error response
   */
  static notFound(
    resource: string,
    id: string,
    meta: Partial<ResponseMetaDto>,
  ): ErrorResponseDto {
    return ResponseHelper.error(
      {
        code: 'RESOURCE_NOT_FOUND',
        message: `${resource} with id ${id} not found`,
        statusCode: HttpStatus.NOT_FOUND,
      },
      meta,
    );
  }

  /**
   * Create an unauthorized error response
   */
  static unauthorized(
    message: string = 'Unauthorized',
    meta: Partial<ResponseMetaDto>,
  ): ErrorResponseDto {
    return ResponseHelper.error(
      {
        code: 'AUTH_TOKEN_INVALID',
        message,
        statusCode: HttpStatus.UNAUTHORIZED,
      },
      meta,
    );
  }

  /**
   * Create a forbidden error response
   */
  static forbidden(
    message: string = 'Forbidden',
    meta: Partial<ResponseMetaDto>,
  ): ErrorResponseDto {
    return ResponseHelper.error(
      {
        code: 'AUTHZ_INSUFFICIENT_PERMISSIONS',
        message,
        statusCode: HttpStatus.FORBIDDEN,
      },
      meta,
    );
  }

  /**
   * Create a conflict error response
   */
  static conflict(
    message: string,
    meta: Partial<ResponseMetaDto>,
  ): ErrorResponseDto {
    return ResponseHelper.error(
      {
        code: 'DB_DUPLICATE_ENTRY',
        message,
        statusCode: HttpStatus.CONFLICT,
      },
      meta,
    );
  }

  /**
   * Create an internal server error response
   */
  static internal(
    message: string = 'Internal server error',
    meta: Partial<ResponseMetaDto>,
    error?: Error,
  ): ErrorResponseDto {
    return ResponseHelper.error(
      {
        code: 'SYS_INTERNAL_ERROR',
        message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        stack: error?.stack,
      },
      meta,
    );
  }

  /**
   * Create a bad request error response
   */
  static badRequest(
    message: string,
    meta: Partial<ResponseMetaDto>,
  ): ErrorResponseDto {
    return ResponseHelper.error(
      {
        code: 'VAL_INVALID_INPUT',
        message,
        statusCode: HttpStatus.BAD_REQUEST,
      },
      meta,
    );
  }
}

/**
 * Query Helper Utilities
 */
export class QueryHelper {
  /**
   * Build WHERE clause from search query
   */
  static buildSearchClause(
    search: string | undefined,
    fields: string[],
  ): Record<string, unknown> | undefined {
    if (!search || !fields.length) {
      return undefined;
    }

    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    };
  }

  /**
   * Build date range clause
   */
  static buildDateRangeClause(
    field: string,
    startDate?: Date,
    endDate?: Date,
  ): Record<string, unknown> | undefined {
    if (!startDate && !endDate) {
      return undefined;
    }

    const clause: Record<string, unknown> = {};

    if (startDate) {
      clause.gte = startDate;
    }

    if (endDate) {
      clause.lte = endDate;
    }

    return { [field]: clause };
  }

  /**
   * Sanitize sort field
   */
  static sanitizeSortField(
    sortBy: string | undefined,
    allowedFields: string[],
    defaultField: string = 'createdAt',
  ): string {
    if (!sortBy) {
      return defaultField;
    }

    if (!allowedFields.includes(sortBy)) {
      return defaultField;
    }

    return sortBy;
  }

  /**
   * Sanitize sort order
   */
  static sanitizeSortOrder(
    sortOrder: string | undefined,
    defaultOrder: 'asc' | 'desc' = 'desc',
  ): 'asc' | 'desc' {
    if (!sortOrder) {
      return defaultOrder;
    }

    const normalized = sortOrder.toLowerCase();

    if (normalized !== 'asc' && normalized !== 'desc') {
      return defaultOrder;
    }

    return normalized as 'asc' | 'desc';
  }
}

/**
 * Metadata Helper Utilities
 */
export class MetadataHelper {
  /**
   * Extract request metadata from Express request
   */
  static extractFromRequest(
    request: RequestWithMetadata,
  ): Partial<ResponseMetaDto> {
    return {
      timestamp: new Date().toISOString(),
      correlationId: request.correlationId || this.generateCorrelationId(),
      path: request.url || '',
      method: request.method || 'UNKNOWN',
      version: this.extractVersion(request.url || ''),
    };
  }

  /**
   * Extract API version from URL
   */
  private static extractVersion(url: string): string {
    const match = url.match(/\/api\/v(\d+)\//);
    return match ? `v${match[1]}` : 'v1';
  }

  /**
   * Generate correlation ID
   */
  private static generateCorrelationId(): string {
    return require('crypto').randomUUID();
  }
}
