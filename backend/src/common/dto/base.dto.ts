import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsString,
  MaxLength,
  IsDate,
  IsUUID,
} from 'class-validator';

/**
 * Sort Order Enum
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Base Pagination DTO
 * Provides standard pagination parameters with validation
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
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  readonly sortOrder?: SortOrder = SortOrder.DESC;

  /**
   * Calculate skip/offset for database queries
   */
  get skip(): number {
    return ((this.page || 1) - 1) * (this.limit || 20);
  }

  /**
   * Get take/limit for database queries
   */
  get take(): number {
    return this.limit || 20;
  }
}

/**
 * Base Filter DTO
 * Provides standard filtering parameters
 */
export class FilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Search query string',
    example: 'john doe',
    maxLength: 500,
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
}

/**
 * Base ID Parameter DTO
 */
export class IdParamDto {
  @ApiPropertyOptional({
    description: 'Resource UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  readonly id!: string;
}

/**
 * Base Timestamp DTO
 * For entities with creation and update timestamps
 */
export abstract class TimestampDto {
  @ApiPropertyOptional({
    description: 'Creation timestamp',
    example: '2025-01-15T10:30:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly createdAt?: Date;

  @ApiPropertyOptional({
    description: 'Last update timestamp',
    example: '2025-01-15T15:45:00Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly updatedAt?: Date;
}

/**
 * Base Entity Response DTO
 * Standard response for single entities
 */
export abstract class EntityResponseDto extends TimestampDto {
  @ApiPropertyOptional({
    description: 'Entity UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  readonly id!: string;
}

/**
 * Base Soft Delete DTO
 * For entities with soft delete capability
 */
export abstract class SoftDeleteDto extends EntityResponseDto {
  @ApiPropertyOptional({
    description: 'Deletion timestamp (null if not deleted)',
    example: null,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly deletedAt?: Date | null;

  /**
   * Check if entity is deleted
   */
  get isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }
}

/**
 * Bulk Operation Request DTO
 */
export class BulkOperationDto {
  @ApiPropertyOptional({
    description: 'Array of entity IDs to operate on',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsUUID('4', { each: true })
  readonly ids!: string[];
}
