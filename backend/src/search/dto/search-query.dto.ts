import { IsString, IsOptional, IsEnum, IsInt, Min, Max, IsDateString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SearchEntityType {
  ALL = 'all',
  CASE = 'case',
  DOCUMENT = 'document',
  CLIENT = 'client',
  PARTY = 'party',
  MOTION = 'motion',
  DOCKET = 'docket',
}

export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'contract dispute',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Entity type to search',
    enum: SearchEntityType,
    default: SearchEntityType.ALL,
  })
  @IsOptional()
  @IsEnum(SearchEntityType)
  entityType?: SearchEntityType = SearchEntityType.ALL;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Filter by practice area',
    example: 'Corporate Law',
  })
  @IsOptional()
  @IsString()
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Filter by case status',
    example: 'active',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering results',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering results',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Enable fuzzy matching',
    default: true,
  })
  @IsOptional()
  fuzzy?: boolean = true;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    example: ['urgent', 'high-priority'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SearchSuggestionsDto {
  @ApiProperty({
    description: 'Partial query for suggestions',
    example: 'cont',
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Maximum number of suggestions',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Entity type to suggest',
    enum: SearchEntityType,
  })
  @IsOptional()
  @IsEnum(SearchEntityType)
  entityType?: SearchEntityType;
}

export class ReindexDto {
  @ApiPropertyOptional({
    description: 'Entity type to reindex',
    enum: SearchEntityType,
  })
  @IsOptional()
  @IsEnum(SearchEntityType)
  entityType?: SearchEntityType;

  @ApiPropertyOptional({
    description: 'Force full reindex',
    default: false,
  })
  @IsOptional()
  force?: boolean = false;
}
