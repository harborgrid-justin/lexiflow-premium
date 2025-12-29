import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional, IsEnum, IsUUID, ArrayMinSize } from 'class-validator';

/**
 * Bulk Operations DTOs for Analytics Dashboard
 */

export enum BulkOperationType {
  EXPORT = 'export',
  ARCHIVE = 'archive',
  DELETE = 'delete',
  UPDATE = 'update',
  REFRESH = 'refresh'
}

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
  JSON = 'json'
}

/**
 * Bulk Export Analytics Data DTO
 */
export class BulkExportAnalyticsDto {
  @ApiProperty({
    description: 'Type of analytics data to export',
    enum: ['kpis', 'case-metrics', 'financial-metrics', 'team-performance', 'client-metrics', 'all']
  })
  @IsString()
  dataType!: 'kpis' | 'case-metrics' | 'financial-metrics' | 'team-performance' | 'client-metrics' | 'all';

  @ApiProperty({
    description: 'Export format',
    enum: ExportFormat,
    default: ExportFormat.CSV
  })
  @IsEnum(ExportFormat)
  format!: ExportFormat;

  @ApiPropertyOptional({ description: 'Start date for data export' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for data export' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Include metadata in export' })
  @IsOptional()
  includeMetadata?: boolean;

  @ApiPropertyOptional({ description: 'Filter by specific fields', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({ description: 'Email address to send export to' })
  @IsOptional()
  @IsString()
  emailTo?: string;
}

/**
 * Bulk Export Response DTO
 */
export class BulkExportResponseDto {
  @ApiProperty({ description: 'Export job ID' })
  @IsString()
  jobId!: string;

  @ApiProperty({ description: 'Export status' })
  @IsString()
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: 'Export format' })
  @IsEnum(ExportFormat)
  format!: ExportFormat;

  @ApiPropertyOptional({ description: 'Download URL (when completed)' })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Expiration date of download link' })
  @IsOptional()
  @IsString()
  expiresAt?: string;

  @ApiProperty({ description: 'Created timestamp' })
  @IsString()
  createdAt!: string;

  @ApiPropertyOptional({ description: 'Completed timestamp' })
  @IsOptional()
  @IsString()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}

/**
 * Bulk Refresh Dashboards DTO
 */
export class BulkRefreshDashboardsDto {
  @ApiProperty({ description: 'Dashboard IDs to refresh', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  dashboardIds!: string[];

  @ApiPropertyOptional({ description: 'Force refresh even if recently updated' })
  @IsOptional()
  forceRefresh?: boolean;

  @ApiPropertyOptional({ description: 'Refresh cache' })
  @IsOptional()
  refreshCache?: boolean;
}

/**
 * Bulk Refresh Response DTO
 */
export class BulkRefreshResponseDto {
  @ApiProperty({ description: 'Number of dashboards refreshed' })
  refreshedCount!: number;

  @ApiProperty({ description: 'Number of dashboards failed to refresh' })
  failedCount!: number;

  @ApiProperty({ description: 'Refresh results', type: 'object', additionalProperties: true })
  results!: Record<string, { success: boolean; message?: string }>;

  @ApiProperty({ description: 'Timestamp of refresh operation' })
  @IsString()
  timestamp!: string;
}

/**
 * Bulk Delete Analytics Events DTO
 */
export class BulkDeleteEventsDto {
  @ApiProperty({ description: 'Event IDs to delete', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  eventIds!: string[];

  @ApiPropertyOptional({ description: 'Soft delete (archive) instead of permanent delete' })
  @IsOptional()
  softDelete?: boolean;
}

/**
 * Bulk Delete Response DTO
 */
export class BulkDeleteResponseDto {
  @ApiProperty({ description: 'Number of items deleted' })
  deletedCount!: number;

  @ApiProperty({ description: 'Number of items failed to delete' })
  failedCount!: number;

  @ApiProperty({ description: 'IDs of successfully deleted items', type: [String] })
  @IsArray()
  @IsString({ each: true })
  deletedIds!: string[];

  @ApiProperty({ description: 'IDs of items that failed to delete', type: [String] })
  @IsArray()
  @IsString({ each: true })
  failedIds!: string[];

  @ApiPropertyOptional({ description: 'Error details', type: 'object', additionalProperties: true })
  @IsOptional()
  errors?: Record<string, string>;
}

/**
 * Bulk Archive Metrics DTO
 */
export class BulkArchiveMetricsDto {
  @ApiProperty({ description: 'Metric IDs to archive', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  metricIds!: string[];

  @ApiPropertyOptional({ description: 'Archive reason' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Archive to date' })
  @IsOptional()
  @IsString()
  archiveUntil?: string;
}
