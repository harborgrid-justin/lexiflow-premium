import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export enum ExportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export class ExportAuditLogsDto {
  @ApiProperty({ description: 'Start date for audit log export', example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  startDate!: Date;

  @ApiProperty({ description: 'End date for audit log export', example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  endDate!: Date;

  @ApiProperty({ 
    description: 'Export format',
    enum: ExportFormat,
    example: ExportFormat.CSV,
    default: ExportFormat.CSV
  })
  @IsEnum(ExportFormat)
  @IsOptional()
  format?: ExportFormat;
}
