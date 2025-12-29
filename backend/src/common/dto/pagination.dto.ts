import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Sort Order Enum
 */
export enum SortOrderEnum {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Base Pagination DTO
 * Provides standard pagination and filtering parameters with validation
 */
export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    maximum: 10000,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

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
    description: 'Field to sort by',
    maxLength: 100,
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrderEnum,
    default: SortOrderEnum.DESC,
    example: SortOrderEnum.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrderEnum)
  readonly sortOrder?: SortOrderEnum = SortOrderEnum.DESC;

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
