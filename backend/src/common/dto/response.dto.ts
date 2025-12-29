import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Standard API Response Wrapper
 * Ensures all API responses follow a consistent structure
 */
export class ApiResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  readonly success!: boolean;

  @ApiPropertyOptional({
    description: 'Response data payload',
  })
  readonly data?: T;

  @ApiPropertyOptional({
    description: 'Error information (if success is false)',
  })
  readonly error?: ApiErrorDto;

  @ApiProperty({
    description: 'Response metadata',
  })
  readonly meta!: ResponseMetaDto;
}

/**
 * Success Response DTO
 */
export class SuccessResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Success flag',
    example: true,
  })
  readonly success: boolean = true;

  @ApiProperty({
    description: 'Response data',
  })
  readonly data!: T;

  @ApiProperty({
    description: 'Response metadata',
  })
  readonly meta!: ResponseMetaDto;

  constructor(data: T, meta: ResponseMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}

/**
 * Error Response DTO
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'Success flag',
    example: false,
  })
  readonly success: boolean = false;

  @ApiProperty({
    description: 'Error details',
  })
  readonly error!: ApiErrorDto;

  @ApiProperty({
    description: 'Response metadata',
  })
  readonly meta!: ResponseMetaDto;

  constructor(error: ApiErrorDto, meta: ResponseMetaDto) {
    this.error = error;
    this.meta = meta;
  }
}

/**
 * API Error Details
 */
export class ApiErrorDto {
  @ApiProperty({
    description: 'Error code',
    example: 'VAL_INVALID_INPUT',
  })
  readonly code!: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Invalid input data provided',
  })
  readonly message!: string;

  @ApiPropertyOptional({
    description: 'HTTP status code',
    example: 400,
  })
  readonly statusCode?: number;

  @ApiPropertyOptional({
    description: 'Validation errors (for validation failures)',
    type: [String],
    example: ['email must be a valid email address'],
  })
  readonly validationErrors?: string[];

  @ApiPropertyOptional({
    description: 'Additional error details',
  })
  readonly details?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Stack trace (development only)',
    example: 'Error: Something went wrong\n    at ...',
  })
  readonly stack?: string;
}

/**
 * Response Metadata
 */
export class ResponseMetaDto {
  @ApiProperty({
    description: 'Request timestamp (ISO 8601)',
    example: '2025-01-15T10:30:00Z',
  })
  readonly timestamp!: string;

  @ApiProperty({
    description: 'Correlation ID for request tracking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly correlationId!: string;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: '45ms',
  })
  readonly responseTime!: string;

  @ApiProperty({
    description: 'Request path',
    example: '/api/cases',
  })
  readonly path!: string;

  @ApiProperty({
    description: 'HTTP method',
    example: 'GET',
  })
  readonly method!: string;

  @ApiPropertyOptional({
    description: 'API version',
    example: 'v1',
  })
  readonly version?: string;

  // Additional metadata fields can be added dynamically
  readonly [key: string]: unknown;
}

/**
 * Paginated Response DTO
 */
export class PaginatedResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Array of data items',
    isArray: true,
  })
  readonly data!: T[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  readonly pagination!: PaginationMetaDto;

  @ApiProperty({
    description: 'Response metadata',
  })
  readonly meta!: ResponseMetaDto;

  constructor(data: T[], pagination: PaginationMetaDto, meta: ResponseMetaDto) {
    this.data = data;
    this.pagination = pagination;
    this.meta = meta;
  }
}

/**
 * Pagination Metadata
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  readonly total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  readonly page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  readonly limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  readonly totalPages!: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  readonly hasNextPage!: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  readonly hasPreviousPage!: boolean;

  constructor(total: number, page: number, limit: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

/**
 * Batch Operation Response DTO
 */
export class BatchOperationResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Successfully processed items',
    isArray: true,
  })
  readonly succeeded!: T[];

  @ApiProperty({
    description: 'Failed items with error details',
    isArray: true,
  })
  readonly failed!: BatchOperationErrorDto[];

  @ApiProperty({
    description: 'Total number of items processed',
    example: 10,
  })
  readonly totalProcessed!: number;

  @ApiProperty({
    description: 'Number of successful operations',
    example: 8,
  })
  readonly successCount!: number;

  @ApiProperty({
    description: 'Number of failed operations',
    example: 2,
  })
  readonly failureCount!: number;

  constructor(
    succeeded: T[],
    failed: BatchOperationErrorDto[],
  ) {
    this.succeeded = succeeded;
    this.failed = failed;
    this.totalProcessed = succeeded.length + failed.length;
    this.successCount = succeeded.length;
    this.failureCount = failed.length;
  }
}

/**
 * Batch Operation Error Item
 */
export class BatchOperationErrorDto {
  @ApiProperty({
    description: 'The item that failed',
  })
  readonly item!: unknown;

  @ApiProperty({
    description: 'Error details',
  })
  readonly error!: ApiErrorDto;

  constructor(item: unknown, error: ApiErrorDto) {
    this.item = item;
    this.error = error;
  }
}

/**
 * Health Check Response DTO
 */
export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'Overall health status',
    example: 'healthy',
    enum: ['healthy', 'degraded', 'unhealthy'],
  })
  readonly status!: 'healthy' | 'degraded' | 'unhealthy';

  @ApiProperty({
    description: 'Timestamp of health check',
    example: '2025-01-15T10:30:00Z',
  })
  readonly timestamp!: string;

  @ApiProperty({
    description: 'Service uptime in milliseconds',
    example: 3600000,
  })
  readonly uptime!: number;

  @ApiProperty({
    description: 'Individual component health checks',
  })
  readonly checks!: Record<string, ComponentHealthDto>;
}

/**
 * Component Health DTO
 */
export class ComponentHealthDto {
  @ApiProperty({
    description: 'Component status',
    example: 'up',
    enum: ['up', 'down', 'degraded'],
  })
  readonly status!: 'up' | 'down' | 'degraded';

  @ApiPropertyOptional({
    description: 'Response time in milliseconds',
    example: 5,
  })
  readonly responseTime?: number;

  @ApiPropertyOptional({
    description: 'Additional component details',
  })
  readonly details?: Record<string, unknown>;
}
