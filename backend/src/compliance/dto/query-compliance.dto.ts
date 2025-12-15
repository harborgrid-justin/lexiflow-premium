import { IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ComplianceCheckType, ComplianceStatus } from './create-compliance-check.dto';

export class QueryComplianceDto {
  @ApiProperty({ description: 'Filter by check type', enum: ComplianceCheckType, required: false })
  @IsOptional()
  @IsEnum(ComplianceCheckType)
  checkType?: ComplianceCheckType;

  @ApiProperty({ description: 'Filter by status', enum: ComplianceStatus, required: false })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @ApiProperty({ description: 'Filter by entity ID', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ description: 'Filter by reviewer ID', required: false })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @ApiProperty({ description: 'Start date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
