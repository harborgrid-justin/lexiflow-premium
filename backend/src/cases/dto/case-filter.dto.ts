import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min, IsBoolean, IsUUID, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType, CaseStatus } from '../entities/case.entity';

export class CaseFilterDto {
  @ApiPropertyOptional({
    description: 'Search term for case title, number, or description',
    example: 'Smith v. Johnson',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by case status',
    enum: CaseStatus,
    example: CaseStatus.ACTIVE,
  })
  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @ApiPropertyOptional({
    description: 'Filter by case type',
    enum: CaseType,
    example: CaseType.LITIGATION,
  })
  @IsEnum(CaseType)
  @IsOptional()
  type?: CaseType;

  @ApiPropertyOptional({
    description: 'Filter by practice area',
    example: 'Construction Law',
  })
  @IsString()
  @IsOptional()
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Filter by assigned team UUID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  assignedTeamId?: string;

  @ApiPropertyOptional({
    description: 'Filter by lead attorney UUID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  leadAttorneyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by client UUID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by jurisdiction',
    example: 'State of California',
  })
  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @ApiPropertyOptional({
    description: 'Filter by court',
    example: 'Superior Court',
  })
  @IsString()
  @IsOptional()
  court?: string;

  @ApiPropertyOptional({
    description: 'Filter cases filed after this date',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  filingDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter cases filed before this date',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  filingDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by archived status',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isArchived?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by billable status',
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isBillable?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by pro bono status',
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isProBono?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by confidential status',
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isConfidential?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    default: 20,
    type: Number,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({
    description: 'Include related parties in response',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeParties?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include team members in response',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeTeam?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include case phases in response',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includePhases?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include documents in response',
    default: false,
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeDocuments?: boolean = false;
}
