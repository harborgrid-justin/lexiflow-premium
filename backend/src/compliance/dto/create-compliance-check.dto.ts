import { IsString, IsUUID, IsEnum, IsOptional, IsDateString, IsObject, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ComplianceCheckType {
  CONFLICT_CHECK = 'conflict_check',
  ETHICAL_REVIEW = 'ethical_review',
  REGULATORY_CHECK = 'regulatory_check',
  PRIVILEGE_REVIEW = 'privilege_review',
  DATA_PRIVACY = 'data_privacy'
}

export enum ComplianceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  NEEDS_REVIEW = 'needs_review'
}

export class CreateComplianceCheckDto {
  @ApiProperty({ description: 'Check type', enum: ComplianceCheckType })
  @IsEnum(ComplianceCheckType)
  checkType: ComplianceCheckType;

  @ApiProperty({ description: 'Target entity ID (case, client, document, etc.)' })
  @IsUUID()
  entityId: string;

  @ApiProperty({ description: 'Entity type (case, client, document, etc.)' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Assigned reviewer ID', required: false })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @ApiProperty({ 
    description: 'Check status',
    enum: ComplianceStatus,
    default: ComplianceStatus.PENDING
  })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @ApiProperty({ description: 'Due date', required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ description: 'Check parameters', required: false })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
