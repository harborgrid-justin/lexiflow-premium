import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum, IsBoolean, IsArray, IsDateString, IsObject, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ConsentType } from '@compliance/entities/consent.entity';

export class DataExportRequestDto {
  @ApiProperty({ description: 'User ID for data export' })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({ description: 'Specific data categories to export', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataCategories?: string[];

  @ApiPropertyOptional({ description: 'Export format', enum: ['json', 'csv', 'pdf'] })
  @IsOptional()
  @IsEnum(['json', 'csv', 'pdf'])
  format?: string;

  @ApiPropertyOptional({ description: 'Include archived data' })
  @IsOptional()
  @IsBoolean()
  includeArchived?: boolean;

  @ApiPropertyOptional({ description: 'Include deleted data (if available)' })
  @IsOptional()
  @IsBoolean()
  includeDeleted?: boolean;
}

export class DataDeletionRequestDto {
  @ApiProperty({ description: 'User ID for data deletion' })
  @IsUUID()
  userId!: string;

  @ApiPropertyOptional({ description: 'Reason for deletion' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Specific data categories to delete', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataCategories?: string[];

  @ApiPropertyOptional({ description: 'Perform soft delete (anonymize) instead of hard delete' })
  @IsOptional()
  @IsBoolean()
  softDelete?: boolean;

  @ApiPropertyOptional({ description: 'Notify user of deletion completion' })
  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean;

  @ApiPropertyOptional({ description: 'Requesting user ID (for audit purposes)' })
  @IsOptional()
  @IsUUID()
  requestedBy?: string;
}

export class ConsentDto {
  @ApiProperty({ description: 'User ID' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ConsentType, description: 'Type of consent' })
  @IsEnum(ConsentType)
  consentType!: ConsentType;

  @ApiProperty({ description: 'Purpose of data processing' })
  @IsString()
  purpose!: string;

  @ApiPropertyOptional({ description: 'Scope of consent' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ description: 'Consent version' })
  @IsOptional()
  @IsString()
  consentVersion?: string;

  @ApiPropertyOptional({ description: 'Data categories covered', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dataCategories?: string[];

  @ApiPropertyOptional({ description: 'Third parties data may be shared with', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  thirdParties?: string[];

  @ApiPropertyOptional({ description: 'Legal basis for processing' })
  @IsOptional()
  @IsString()
  legalBasis?: string;

  @ApiPropertyOptional({ description: 'Expiration date' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class RevokeConsentDto {
  @ApiProperty({ description: 'Consent ID to revoke' })
  @IsUUID()
  consentId!: string;

  @ApiPropertyOptional({ description: 'Reason for revocation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AuditReportQueryDto {
  @ApiPropertyOptional({ description: 'Start date for report' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for report' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by action' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Include only failed actions' })
  @IsOptional()
  @IsBoolean()
  onlyFailures?: boolean;

  @ApiPropertyOptional({ description: 'Include only security-relevant events' })
  @IsOptional()
  @IsBoolean()
  securityEventsOnly?: boolean;

  @ApiPropertyOptional({ description: 'Export format', enum: ['json', 'csv', 'pdf'] })
  @IsOptional()
  @IsEnum(['json', 'csv', 'pdf'])
  format?: string;

  @ApiPropertyOptional({ description: 'Verify audit trail integrity' })
  @IsOptional()
  @IsBoolean()
  verifyIntegrity?: boolean;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export class RetentionStatusQueryDto {
  @ApiPropertyOptional({ description: 'Filter by entity type' })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsEnum(['pending', 'active', 'expired', 'processed', 'hold'])
  status?: string;

  @ApiPropertyOptional({ description: 'Show only items on legal hold' })
  @IsOptional()
  @IsBoolean()
  legalHoldOnly?: boolean;

  @ApiPropertyOptional({ description: 'Show only items expiring soon (within days)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  expiringWithinDays?: number;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}

export class DataClassificationDto {
  @ApiProperty({ description: 'Entity type to classify' })
  @IsString()
  entityType!: string;

  @ApiProperty({ description: 'Entity ID to classify' })
  @IsString()
  entityId!: string;

  @ApiPropertyOptional({ description: 'Force re-classification' })
  @IsOptional()
  @IsBoolean()
  forceReclassification?: boolean;
}

export class CreateRetentionPolicyDto {
  @ApiProperty({ description: 'Policy name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Policy description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Entity type this policy applies to' })
  @IsString()
  entityType!: string;

  @ApiProperty({ description: 'Retention period in days', minimum: 1 })
  @IsNumber()
  @Min(1)
  retentionPeriodDays!: number;

  @ApiProperty({ enum: ['archive', 'delete', 'anonymize', 'retain'], description: 'Action when retention expires' })
  @IsEnum(['archive', 'delete', 'anonymize', 'retain'])
  retentionAction!: string;

  @ApiPropertyOptional({ description: 'Legal basis for policy' })
  @IsOptional()
  @IsString()
  legalBasis?: string;

  @ApiPropertyOptional({ description: 'Jurisdictions this policy applies to', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jurisdictions?: string[];

  @ApiPropertyOptional({ description: 'Conditions for policy application' })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Priority level', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ description: 'Effective date' })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class LegalHoldDto {
  @ApiProperty({ description: 'Entity type to place hold on' })
  @IsString()
  entityType!: string;

  @ApiProperty({ description: 'Entity ID to place hold on' })
  @IsString()
  entityId!: string;

  @ApiProperty({ description: 'Reason for legal hold' })
  @IsString()
  reason!: string;

  @ApiPropertyOptional({ description: 'Case or matter ID related to hold' })
  @IsOptional()
  @IsUUID()
  relatedCaseId?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RemoveLegalHoldDto {
  @ApiProperty({ description: 'Retention record ID to remove hold from' })
  @IsUUID()
  retentionRecordId!: string;

  @ApiPropertyOptional({ description: 'Reason for removing hold' })
  @IsOptional()
  @IsString()
  reason?: string;
}
