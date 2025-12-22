import { IsString, IsOptional, IsNotEmpty, MaxLength, IsObject, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class CreateReportDto {
  @ApiProperty({ 
    description: 'Report name',
    example: 'Monthly Case Summary',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ 
    description: 'Report type',
    example: 'case_summary',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type!: string;

  @ApiPropertyOptional({ 
    description: 'Report template ID'
  })
  @IsUUID()
  @IsOptional()
  templateId?: string;

  @ApiPropertyOptional({ 
    description: 'Report parameters'
  })
  @IsObject()
  @IsOptional()
  parameters?: Record<string, unknown>;

  @ApiPropertyOptional({ 
    description: 'File path for generated report',
    maxLength: 500
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  filePath?: string;

  @ApiPropertyOptional({ 
    description: 'User ID who created the report'
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ 
    description: 'Report generation status',
    enum: ReportStatus,
    default: ReportStatus.PENDING
  })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;
}
