import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsString, IsOptional, IsNumber } from 'class-validator';

/**
 * Error details structure
 * Provides detailed error information for failed requests
 */
export class ErrorDetails {
  @ApiProperty({
    description: 'Error code identifier',
    example: 'VAL_INVALID_INPUT',
  })
  @IsString()
  code!: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  @IsNumber()
  statusCode!: number;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Invalid input data provided',
  })
  @IsString()
  message!: string;

  @ApiPropertyOptional({
    description: 'Additional error details',
  })
  @IsOptional()
  details?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Stack trace (development only)',
    example: 'Error: Something went wrong\n    at ...',
  })
  @IsOptional()
  @IsString()
  stack?: string;
}

/**
 * Standard API Response Wrapper
 * Ensures all API responses follow a consistent structure
 */
export class ApiResponseDto<T = unknown> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  @IsBoolean()
  success!: boolean;

  @ApiPropertyOptional({
    description: 'Optional message',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'Response data payload',
  })
  @IsOptional()
  data?: T;

  @ApiPropertyOptional({
    description: 'Error information (if success is false)',
    type: ErrorDetails,
  })
  @IsOptional()
  error?: ErrorDetails;

  @ApiProperty({
    description: 'Response timestamp (ISO 8601)',
    example: '2025-01-15T10:30:00Z',
  })
  @IsString()
  timestamp!: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = this.timestamp || new Date().toISOString();
  }

  /**
   * Create a success response
   */
  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Create an error response
   */
  static error<T>(
    error: ErrorDetails | Error | string,
    message?: string,
  ): ApiResponseDto<T> {
    const errorDetails: ErrorDetails =
      typeof error === 'string'
        ? {
            code: 'UNKNOWN_ERROR',
            statusCode: 500,
            message: error,
          }
        : error instanceof Error
        ? {
            code: 'SYSTEM_ERROR',
            statusCode: 500,
            message: error.message,
            stack: error.stack,
          }
        : error;

    return new ApiResponseDto({
      success: false,
      message,
      error: errorDetails,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Paginated Response DTO
 * For endpoints that return paginated lists
 */
export class PaginatedResponseDto<T = unknown> {
  @ApiProperty({
    type: 'array',
    description: 'List of items',
    isArray: true,
  })
  readonly data!: T[];

  @ApiProperty({
    example: 100,
    description: 'Total count of items',
  })
  @IsNumber()
  readonly total!: number;

  @ApiProperty({
    example: 1,
    description: 'Current page number',
  })
  @IsNumber()
  readonly page!: number;

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
  })
  @IsNumber()
  readonly limit!: number;

  @ApiProperty({
    example: 10,
    description: 'Total number of pages',
  })
  @IsNumber()
  readonly totalPages!: number;

  @ApiProperty({
    example: true,
    description: 'Whether there is a next page',
  })
  @IsBoolean()
  readonly hasNextPage!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether there is a previous page',
  })
  @IsBoolean()
  readonly hasPreviousPage!: boolean;

  constructor(items: T[], total: number, page: number, limit: number) {
    this.data = items;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}
