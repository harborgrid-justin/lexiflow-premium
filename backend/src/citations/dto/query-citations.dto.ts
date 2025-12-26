import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum CitationType {
  CASE = 'case',
  STATUTE = 'statute',
  REGULATION = 'regulation',
  CONSTITUTIONAL = 'constitutional',
  SECONDARY = 'secondary',
  OTHER = 'other',
}

export enum CitationStatus {
  VALID = 'valid',
  OVERRULED = 'overruled',
  QUESTIONED = 'questioned',
  SUPERSEDED = 'superseded',
  UNKNOWN = 'unknown',
}

export class QueryCitationsDto {
  @ApiPropertyOptional({
    description: 'Filter by citation type',
    enum: CitationType
  })
  @IsEnum(CitationType)
  @IsOptional()
  type?: CitationType;

  @ApiPropertyOptional({
    description: 'Filter by case ID'
  })
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by document ID'
  })
  @IsString()
  @IsOptional()
  documentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by citation status',
    enum: CitationStatus
  })
  @IsEnum(CitationStatus)
  @IsOptional()
  status?: CitationStatus;

  @ApiPropertyOptional({
    description: 'Filter by verified status'
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Search term for citation text or reference'
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    example: 50
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    example: 0
  })
  @IsOptional()
  offset?: number;
}
