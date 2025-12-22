import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsDate, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EvidenceType, EvidenceStatus } from '../entities/evidence-item.entity';

export class CreateEvidenceItemDto {
  @ApiProperty({ description: 'Case ID this evidence belongs to' })
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ description: 'Evidence identifier/number' })
  @IsString()
  @IsNotEmpty()
  evidenceNumber: string;

  @ApiPropertyOptional({ description: 'Evidence title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Evidence description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: EvidenceType, description: 'Type of evidence' })
  @IsEnum(EvidenceType)
  evidenceType: EvidenceType;

  @ApiPropertyOptional({ enum: EvidenceStatus, description: 'Current status', default: EvidenceStatus.COLLECTED })
  @IsOptional()
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus;

  @ApiPropertyOptional({ description: 'Date evidence was collected', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  collectionDate?: Date;

  @ApiPropertyOptional({ description: 'Location where evidence was collected' })
  @IsOptional()
  @IsString()
  collectionLocation?: string;

  @ApiPropertyOptional({ description: 'Person who collected the evidence' })
  @IsOptional()
  @IsString()
  collectedBy?: string;

  @ApiPropertyOptional({ description: 'Current custodian of evidence' })
  @IsOptional()
  @IsString()
  currentCustodian?: string;

  @ApiPropertyOptional({ description: 'Storage location' })
  @IsOptional()
  @IsString()
  storageLocation?: string;

  @ApiPropertyOptional({ description: 'Chain of custody description' })
  @IsOptional()
  @IsString()
  chainOfCustody?: string;

  @ApiPropertyOptional({ description: 'Chain of custody intact', default: true })
  @IsOptional()
  @IsBoolean()
  chainOfCustodyIntact?: boolean;

  @ApiPropertyOptional({ description: 'File path for digital evidence' })
  @IsOptional()
  @IsString()
  filePath?: string;

  @ApiPropertyOptional({ description: 'File hash for integrity verification' })
  @IsOptional()
  @IsString()
  fileHash?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @ApiPropertyOptional({ description: 'Bates number' })
  @IsOptional()
  @IsString()
  batesNumber?: string;

  @ApiPropertyOptional({ description: 'Exhibit number' })
  @IsOptional()
  @IsString()
  exhibitNumber?: string;

  @ApiPropertyOptional({ description: 'Is admitted as evidence', default: false })
  @IsOptional()
  @IsBoolean()
  isAdmitted?: boolean;

  @ApiPropertyOptional({ description: 'Date admitted', type: Date })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  admittedDate?: Date;

  @ApiPropertyOptional({ description: 'Person who admitted the evidence' })
  @IsOptional()
  @IsString()
  admittedBy?: string;

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
  metadata?: Record<string, unknown>;
}
