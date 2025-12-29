import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SortOrderEnum } from './pagination.dto';

/**
 * Advanced Query Pagination DTO
 * Extends basic pagination with date range filtering
 */
export class QueryPaginationDto {
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    maximum: 10000,
    description: 'Page number (1-based)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
    description: 'Items per page',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    maxLength: 100,
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly sortBy?: string;

  @ApiPropertyOptional({
    enum: SortOrderEnum,
    description: 'Sort order',
    default: SortOrderEnum.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  readonly sortOrder?: SortOrderEnum = SortOrderEnum.DESC;

  @ApiPropertyOptional({
    description: 'Search query string',
    maxLength: 500,
    example: 'search term',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly search?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly startDate?: Date;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly endDate?: Date;

  /**
   * Calculate skip/offset for database queries
   */
  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 10);
  }

  /**
   * Get take/limit for database queries
   */
  get take(): number {
    return this.limit || 10;
  }
}
