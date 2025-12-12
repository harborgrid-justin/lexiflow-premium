import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CaseType, CaseStatus } from '../entities/case.entity';

export class CaseResponseDto {
  @ApiProperty({
    description: 'Case UUID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Case title',
    example: 'Smith v. Johnson Construction',
  })
  title: string;

  @ApiProperty({
    description: 'Case number',
    example: 'CV-2024-12345',
  })
  caseNumber: string;

  @ApiPropertyOptional({
    description: 'Case description',
    example: 'Contract dispute arising from construction defects',
  })
  description?: string;

  @ApiProperty({
    description: 'Case type',
    enum: CaseType,
    example: CaseType.LITIGATION,
  })
  type: CaseType;

  @ApiProperty({
    description: 'Case status',
    enum: CaseStatus,
    example: CaseStatus.ACTIVE,
  })
  status: CaseStatus;

  @ApiPropertyOptional({
    description: 'Practice area',
    example: 'Construction Law',
  })
  practiceArea?: string;

  @ApiPropertyOptional({
    description: 'Jurisdiction',
    example: 'State of California',
  })
  jurisdiction?: string;

  @ApiPropertyOptional({
    description: 'Court name',
    example: 'Superior Court of Los Angeles County',
  })
  court?: string;

  @ApiPropertyOptional({
    description: 'Judge name',
    example: 'Hon. Margaret Williams',
  })
  judge?: string;

  @ApiPropertyOptional({
    description: 'Filing date',
    type: Date,
    example: '2024-01-15T00:00:00.000Z',
  })
  filingDate?: Date;

  @ApiPropertyOptional({
    description: 'Trial date',
    type: Date,
    example: '2025-06-01T00:00:00.000Z',
  })
  trialDate?: Date;

  @ApiPropertyOptional({
    description: 'Close date',
    type: Date,
    example: '2025-12-15T00:00:00.000Z',
  })
  closeDate?: Date;

  @ApiPropertyOptional({
    description: 'Assigned team UUID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  assignedTeamId?: string;

  @ApiPropertyOptional({
    description: 'Lead attorney UUID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  leadAttorneyId?: string;

  @ApiPropertyOptional({
    description: 'Custom metadata',
    type: 'object',
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Whether case is archived',
    type: Boolean,
    example: false,
  })
  isArchived: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    type: Date,
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    type: Date,
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Deletion timestamp (soft delete)',
    type: Date,
    example: '2024-01-15T10:30:00.000Z',
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: 'Related parties (when includeParties=true)',
    type: 'array',
  })
  parties?: any[];

  @ApiPropertyOptional({
    description: 'Team members (when includeTeam=true)',
    type: 'array',
  })
  team?: any[];

  @ApiPropertyOptional({
    description: 'Case phases (when includePhases=true)',
    type: 'array',
  })
  phases?: any[];
}

export class PaginatedCaseResponseDto {
  @ApiProperty({
    description: 'Array of cases',
    type: [CaseResponseDto],
  })
  data: CaseResponseDto[];

  @ApiProperty({
    description: 'Total number of cases',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Items per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;
}

export class BulkDeleteDto {
  @ApiProperty({
    description: 'Array of case UUIDs to delete',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
  })
  ids: string[];
}

export class BulkUpdateStatusDto {
  @ApiProperty({
    description: 'Array of case UUIDs to update',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
  })
  ids: string[];

  @ApiProperty({
    description: 'New status for all cases',
    enum: CaseStatus,
    example: CaseStatus.CLOSED,
  })
  status: CaseStatus;
}

export class CaseExportDto {
  @ApiProperty({
    description: 'Export format',
    enum: ['csv', 'excel', 'pdf'],
    example: 'excel',
  })
  format: 'csv' | 'excel' | 'pdf';

  @ApiPropertyOptional({
    description: 'Filter criteria for export',
  })
  filters?: any;
}
