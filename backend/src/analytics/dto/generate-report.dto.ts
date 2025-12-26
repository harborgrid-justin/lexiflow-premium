import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsObject,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  CASE_ANALYTICS = 'case_analytics',
  BILLING_SUMMARY = 'billing_summary',
  USER_ACTIVITY = 'user_activity',
  PERFORMANCE = 'performance',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
}

export class GenerateReportDto {
  @ApiProperty({
    description: 'Report type',
    enum: ReportType
  })
  @IsEnum(ReportType)
  @IsNotEmpty()
  reportType!: ReportType;

  @ApiPropertyOptional({
    description: 'Report format',
    enum: ReportFormat,
    default: ReportFormat.PDF
  })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;

  @ApiPropertyOptional({ description: 'Start date for the report period' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for the report period' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by case IDs' })
  @IsArray()
  @IsOptional()
  caseIds?: string[];

  @ApiPropertyOptional({ description: 'Filter by user IDs' })
  @IsArray()
  @IsOptional()
  userIds?: string[];

  @ApiPropertyOptional({ description: 'Additional filters' })
  @IsObject()
  @IsOptional()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Report parameters' })
  @IsObject()
  @IsOptional()
  parameters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Include charts in report' })
  @IsOptional()
  includeCharts?: boolean;

  @ApiPropertyOptional({ description: 'Report title' })
  @IsString()
  @IsOptional()
  title?: string;
}

export class GenerateReportResponseDto {
  @ApiProperty({ description: 'Report ID' })
  reportId!: string;

  @ApiProperty({ description: 'Report type' })
  reportType!: ReportType;

  @ApiProperty({ description: 'Report format' })
  format!: ReportFormat;

  @ApiPropertyOptional({ description: 'Download URL for the report' })
  downloadUrl?: string;

  @ApiPropertyOptional({ description: 'Report generation status' })
  status?: string;

  @ApiPropertyOptional({ description: 'Report data (for JSON format)' })
  data?: Record<string, unknown>;

  @ApiProperty({ description: 'Timestamp of generation' })
  generatedAt!: string;
}
