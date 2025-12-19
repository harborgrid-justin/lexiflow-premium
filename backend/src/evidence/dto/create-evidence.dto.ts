import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsDate, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EvidenceType, EvidenceStatus } from '../entities/evidence-item.entity';

export class CreateEvidenceDto {
  @ApiProperty({ description: 'Case ID this evidence belongs to' })
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ description: 'Evidence identifier/number' })
  @IsString()
  @IsNotEmpty()
  evidenceNumber: string;

  @ApiProperty({ description: 'Evidence description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: EvidenceType, description: 'Type of evidence' })
  @IsEnum(EvidenceType)
  type: EvidenceType;

  @ApiPropertyOptional({ description: 'Source of the evidence' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Current location of evidence' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Person currently responsible for evidence' })
  @IsOptional()
  @IsString()
  custodian?: string;

  @ApiPropertyOptional({ description: 'Custodian user ID' })
  @IsOptional()
  @IsString()
  custodianId?: string;

  @ApiPropertyOptional({ description: 'Date evidence was collected', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateCollected?: Date;

  @ApiPropertyOptional({ description: 'Date evidence was received', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateReceived?: Date;

  @ApiPropertyOptional({ enum: EvidenceStatus, description: 'Current status', default: EvidenceStatus.COLLECTED })
  @IsOptional()
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata', type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
