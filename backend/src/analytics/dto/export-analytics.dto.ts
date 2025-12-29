import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsArray, IsDateString, IsBoolean } from 'class-validator';

/**
 * Export Analytics Data DTOs
 */

export enum AnalyticsExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
  PDF = 'pdf',
  PARQUET = 'parquet'
}

export enum AnalyticsExportType {
  EVENTS = 'events',
  METRICS = 'metrics',
  DASHBOARDS = 'dashboards',
  REPORTS = 'reports',
  TIME_SERIES = 'time_series',
  ALL = 'all'
}

/**
 * Export Analytics Data DTO
 */
export class ExportAnalyticsDataDto {
  @ApiProperty({
    description: 'Type of analytics data to export',
    enum: AnalyticsExportType
  })
  @IsEnum(AnalyticsExportType)
  exportType!: AnalyticsExportType;

  @ApiProperty({
    description: 'Export format',
    enum: AnalyticsExportFormat,
    default: AnalyticsExportFormat.CSV
  })
  @IsEnum(AnalyticsExportFormat)
  format!: AnalyticsExportFormat;

  @ApiPropertyOptional({ description: 'Start date for data export' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for data export' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by event types', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];

  @ApiPropertyOptional({ description: 'Filter by user IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @ApiPropertyOptional({ description: 'Filter by case IDs', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  caseIds?: string[];

  @ApiPropertyOptional({ description: 'Include metadata in export' })
  @IsOptional()
  @IsBoolean()
  includeMetadata?: boolean;

  @ApiPropertyOptional({ description: 'Include properties in export' })
  @IsOptional()
  @IsBoolean()
  includeProperties?: boolean;

  @ApiPropertyOptional({ description: 'Specific fields to export', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @ApiPropertyOptional({ description: 'Email address to send export to' })
  @IsOptional()
  @IsString()
  emailTo?: string;

  @ApiPropertyOptional({ description: 'Export file name (without extension)' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'Compress export file' })
  @IsOptional()
  @IsBoolean()
  compress?: boolean;
}

/**
 * Export Analytics Response DTO
 */
export class ExportAnalyticsResponseDto {
  @ApiProperty({ description: 'Export job ID' })
  @IsString()
  jobId!: string;

  @ApiProperty({ description: 'Export status' })
  @IsString()
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @ApiProperty({ description: 'Export type' })
  @IsEnum(AnalyticsExportType)
  exportType!: AnalyticsExportType;

  @ApiProperty({ description: 'Export format' })
  @IsEnum(AnalyticsExportFormat)
  format!: AnalyticsExportFormat;

  @ApiPropertyOptional({ description: 'Download URL (when completed)' })
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'File name' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'Number of records exported' })
  @IsOptional()
  recordCount?: number;

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

  @ApiPropertyOptional({ description: 'Progress percentage (0-100)' })
  @IsOptional()
  progress?: number;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({ description: 'Email sent flag' })
  @IsOptional()
  @IsBoolean()
  emailSent?: boolean;
}

/**
 * Get Export Job Status DTO
 */
export class GetExportJobStatusDto {
  @ApiProperty({ description: 'Export job ID' })
  @IsString()
  jobId!: string;
}

/**
 * List Export Jobs Response DTO
 */
export class ExportJobDto {
  @ApiProperty({ description: 'Export job ID' })
  @IsString()
  jobId!: string;

  @ApiProperty({ description: 'Export status' })
  @IsString()
  status!: string;

  @ApiProperty({ description: 'Export type' })
  @IsString()
  exportType!: string;

  @ApiProperty({ description: 'Export format' })
  @IsString()
  format!: string;

  @ApiProperty({ description: 'Created timestamp' })
  @IsString()
  createdAt!: string;

  @ApiPropertyOptional({ description: 'Completed timestamp' })
  @IsOptional()
  @IsString()
  completedAt?: string;

  @ApiPropertyOptional({ description: 'File name' })
  @IsOptional()
  @IsString()
  fileName?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  fileSize?: number;
}

export class ListExportJobsResponseDto {
  @ApiProperty({ type: [ExportJobDto], description: 'List of export jobs' })
  jobs!: ExportJobDto[];

  @ApiProperty({ description: 'Total count of export jobs' })
  total!: number;

  @ApiProperty({ description: 'Current page number' })
  page!: number;

  @ApiProperty({ description: 'Items per page' })
  limit!: number;
}
