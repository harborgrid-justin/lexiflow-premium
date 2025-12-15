import { IsString, IsOptional, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum WorkflowCategory {
  DISCOVERY = 'Discovery',
  LITIGATION = 'Litigation',
  COMPLIANCE = 'Compliance',
  CONTRACTS = 'Contracts',
  GENERAL = 'General'
}

export class WorkflowStageDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  order: number;

  @ApiPropertyOptional()
  durationDays?: number;
}

export class CreateWorkflowTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: WorkflowCategory })
  @IsEnum(WorkflowCategory)
  category: WorkflowCategory;

  @ApiProperty({ type: [WorkflowStageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStageDto)
  stages: WorkflowStageDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  createdBy?: string;
}
