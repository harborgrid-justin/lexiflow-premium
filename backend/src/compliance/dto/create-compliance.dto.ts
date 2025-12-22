import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum ComplianceType {
  CONFLICT_CHECK = 'conflict_check',
  ETHICAL_REVIEW = 'ethical_review',
  REGULATORY_COMPLIANCE = 'regulatory_compliance',
  DATA_PRIVACY = 'data_privacy',
  PRIVILEGE_REVIEW = 'privilege_review',
}

export enum ComplianceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  NEEDS_REVIEW = 'needs_review',
  REVIEW_REQUIRED = 'review_required',
}

export class CreateComplianceDto {
  @ApiProperty({ description: 'Case ID associated with compliance check' })
  @IsUUID()
  caseId!: string;

  @ApiProperty({ 
    description: 'Type of compliance check',
    enum: ComplianceType,
    example: ComplianceType.CONFLICT_CHECK
  })
  @IsEnum(ComplianceType)
  type!: ComplianceType;

  @ApiProperty({ 
    description: 'Compliance status',
    enum: ComplianceStatus,
    example: ComplianceStatus.PENDING,
    required: false,
    default: ComplianceStatus.PENDING
  })
  @IsEnum(ComplianceStatus)
  @IsOptional()
  status?: ComplianceStatus;

  @ApiProperty({ description: 'Additional notes or details', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Auto-approve if passed', required: false, default: false })
  @IsBoolean()
  @IsOptional()
  autoApprove?: boolean;

  @ApiProperty({ description: 'Assigned reviewer ID', required: false })
  @IsUUID()
  @IsOptional()
  reviewerId?: string;
}
