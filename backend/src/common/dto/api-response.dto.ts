import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Error details structure
 */
export interface ErrorDetails {
  code?: string;
  statusCode?: number;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export class ApiResponseDto<T> {
  @ApiProperty()
  success!: boolean;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  data?: T;

  @ApiPropertyOptional()
  error?: ErrorDetails;

  @ApiPropertyOptional()
  timestamp?: string;

  constructor(partial: Partial<ApiResponseDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = this.timestamp || new Date().toISOString();
  }

  static success<T>(data: T, message?: string): ApiResponseDto<T> {
    return new ApiResponseDto({
      success: true,
      message,
      data,
    });
  }

  static error<T>(error: ErrorDetails | Error | string, message?: string): ApiResponseDto<T> {
    const errorDetails: ErrorDetails = typeof error === 'string'
      ? { message: error }
      : error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;

    return new ApiResponseDto({
      success: false,
      message,
      error: errorDetails,
    });
  }
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ type: 'array', description: 'List of items' })
  data: T[];

  @ApiProperty({ example: 100, description: 'Total count of items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: true, description: 'Whether there is a next page' })
  hasNextPage: boolean;

  @ApiProperty({ example: false, description: 'Whether there is a previous page' })
  hasPreviousPage: boolean;

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
