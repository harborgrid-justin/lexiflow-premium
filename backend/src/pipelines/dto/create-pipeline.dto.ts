import { IsString, IsEnum, IsOptional, IsObject} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PipelineType {
  ETL = 'ETL',
  ELT = 'ELT',
  STREAMING = 'Streaming',
  BATCH = 'Batch',
}

export enum PipelineStatus {
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  FAILED = 'Failed',
  DRAFT = 'Draft',
}

export class CreatePipelineDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ enum: PipelineType })
  @IsEnum(PipelineType)
  type!: PipelineType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  sourceConnector!: string;

  @ApiProperty()
  @IsString()
  targetConnector!: string;

  @ApiProperty()
  @IsObject()
  configuration!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  schedule?: string; // Cron expression

  @ApiProperty({ enum: PipelineStatus, default: PipelineStatus.DRAFT })
  @IsEnum(PipelineStatus)
  @IsOptional()
  status?: PipelineStatus;
}

export class UpdatePipelineDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  configuration?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  schedule?: string;

  @ApiProperty({ enum: PipelineStatus })
  @IsEnum(PipelineStatus)
  @IsOptional()
  status?: PipelineStatus;
}
