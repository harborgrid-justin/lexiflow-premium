import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export class GenerateReportDto {
  @ApiProperty({ description: 'Case ID to generate report for' })
  @IsUUID()
  caseId!: string;

  @ApiProperty({ 
    description: 'Report format',
    enum: ReportFormat,
    example: ReportFormat.PDF,
    default: ReportFormat.PDF
  })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;
}
