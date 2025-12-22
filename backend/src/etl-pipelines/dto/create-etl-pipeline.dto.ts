import { IsString, IsOptional, IsNotEmpty, MaxLength, IsObject, IsUUID, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PipelineStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
}

export class CreateETLPipelineDto {
  @ApiProperty({ 
    description: 'Pipeline name',
    example: 'PACER Data Import',
    maxLength: 255
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Pipeline description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Pipeline status',
    enum: PipelineStatus,
    default: PipelineStatus.DRAFT
  })
  @IsEnum(PipelineStatus)
  @IsOptional()
  status?: PipelineStatus;

  @ApiProperty({ 
    description: 'Pipeline configuration',
    example: {
      source: { type: 'database', config: {} },
      transformations: [],
      destination: { type: 'database', config: {} }
    }
  })
  @IsObject()
  @IsNotEmpty()
  config: {
    source: { type: string; config: any };
    transformations: unknown[];
    destination: { type: string; config: any };
    schedule?: string;
  };

  @ApiPropertyOptional({ 
    description: 'Total number of runs',
    default: 0
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  runsTotal?: number;

  @ApiPropertyOptional({ 
    description: 'Number of successful runs',
    default: 0
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  runsSuccessful?: number;

  @ApiPropertyOptional({ 
    description: 'Number of failed runs',
    default: 0
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  runsFailed?: number;

  @ApiProperty({ 
    description: 'User ID who created the pipeline'
  })
  @IsUUID()
  @IsNotEmpty()
  createdBy: string;
}
