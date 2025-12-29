import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional, IsUUID, ArrayMinSize, IsDateString } from 'class-validator';

/**
 * Bulk Analytics Operations DTOs
 */

export enum AnalyticsBulkOperationType {
  IMPORT_EVENTS = 'import_events',
  ARCHIVE_EVENTS = 'archive_events',
  DELETE_EVENTS = 'delete_events',
  RECALCULATE_METRICS = 'recalculate_metrics',
  EXPORT_METRICS = 'export_metrics'
}

/**
 * Bulk Import Analytics Events DTO
 */
export class BulkImportEventsDto {
  @ApiProperty({ description: 'Events to import', type: 'array' })
  @IsArray()
  @ArrayMinSize(1)
  events!: Array<{
    eventName: string;
    category: string;
    userId?: string;
    caseId?: string;
    value?: number;
    properties?: Record<string, unknown>;
    timestamp?: string;
  }>;

  @ApiPropertyOptional({ description: 'Skip validation errors' })
  @IsOptional()
  skipErrors?: boolean;

  @ApiPropertyOptional({ description: 'Batch size for processing' })
  @IsOptional()
  batchSize?: number;
}

/**
 * Bulk Import Response DTO
 */
export class BulkImportResponseDto {
  @ApiProperty({ description: 'Number of events successfully imported' })
  successCount!: number;

  @ApiProperty({ description: 'Number of events failed to import' })
  failedCount!: number;

  @ApiProperty({ description: 'Total events processed' })
  totalProcessed!: number;

  @ApiPropertyOptional({ description: 'Error details for failed events', type: 'array' })
  @IsOptional()
  errors?: Array<{ index: number; error: string; event: any }>;

  @ApiProperty({ description: 'Import job ID' })
  @IsString()
  jobId!: string;

  @ApiProperty({ description: 'Import timestamp' })
  @IsString()
  timestamp!: string;
}

/**
 * Bulk Recalculate Metrics DTO
 */
export class BulkRecalculateMetricsDto {
  @ApiProperty({
    description: 'Metric types to recalculate',
    enum: ['case', 'user-activity', 'billing', 'all'],
    isArray: true
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  metricTypes!: string[];

  @ApiPropertyOptional({ description: 'Start date for recalculation' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for recalculation' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Force recalculation even if up to date' })
  @IsOptional()
  forceRecalculate?: boolean;
}

/**
 * Bulk Recalculate Response DTO
 */
export class BulkRecalculateResponseDto {
  @ApiProperty({ description: 'Recalculation job ID' })
  @IsString()
  jobId!: string;

  @ApiProperty({ description: 'Job status' })
  @IsString()
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: 'Metrics recalculated' })
  @IsArray()
  metricsRecalculated!: string[];

  @ApiProperty({ description: 'Started timestamp' })
  @IsString()
  startedAt!: string;

  @ApiPropertyOptional({ description: 'Completed timestamp' })
  @IsOptional()
  @IsString()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Progress percentage' })
  @IsOptional()
  progress?: number;
}

/**
 * Bulk Archive Analytics Events DTO
 */
export class BulkArchiveAnalyticsEventsDto {
  @ApiProperty({ description: 'Event IDs to archive', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  eventIds!: string[];

  @ApiPropertyOptional({ description: 'Archive reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Archive until date (null for indefinite)' })
  @IsOptional()
  @IsDateString()
  archiveUntil?: string;
}

/**
 * Bulk Archive Response DTO
 */
export class BulkArchiveResponseDto {
  @ApiProperty({ description: 'Number of events archived' })
  archivedCount!: number;

  @ApiProperty({ description: 'Number of events failed to archive' })
  failedCount!: number;

  @ApiProperty({ description: 'Archived event IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  archivedIds!: string[];

  @ApiProperty({ description: 'Failed event IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  failedIds!: string[];

  @ApiPropertyOptional({ description: 'Error details', type: 'object', additionalProperties: true })
  @IsOptional()
  errors?: Record<string, string>;

  @ApiProperty({ description: 'Archive timestamp' })
  @IsString()
  timestamp!: string;
}

/**
 * Bulk Delete Analytics Events DTO
 */
export class BulkDeleteAnalyticsEventsDto {
  @ApiProperty({ description: 'Event IDs to delete', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  eventIds!: string[];

  @ApiPropertyOptional({ description: 'Permanent delete (cannot be undone)' })
  @IsOptional()
  permanentDelete?: boolean;

  @ApiPropertyOptional({ description: 'Delete reason for audit log' })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Bulk Delete Response DTO
 */
export class BulkDeleteAnalyticsResponseDto {
  @ApiProperty({ description: 'Number of events deleted' })
  deletedCount!: number;

  @ApiProperty({ description: 'Number of events failed to delete' })
  failedCount!: number;

  @ApiProperty({ description: 'Deleted event IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  deletedIds!: string[];

  @ApiProperty({ description: 'Failed event IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  failedIds!: string[];

  @ApiPropertyOptional({ description: 'Error details', type: 'object', additionalProperties: true })
  @IsOptional()
  errors?: Record<string, string>;

  @ApiProperty({ description: 'Deletion timestamp' })
  @IsString()
  timestamp!: string;
}
