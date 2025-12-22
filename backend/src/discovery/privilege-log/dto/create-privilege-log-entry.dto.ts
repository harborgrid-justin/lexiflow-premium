import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  IsUUID,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { PrivilegeType } from '../entities/privilege-log-entry.entity';

export class CreatePrivilegeLogEntryDto {
  @IsUUID()
  caseId!: string;

  @IsString()
  @MaxLength(100)
  privilegeLogNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  batesNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentId?: string;

  @IsDateString()
  documentDate!: string;

  @IsString()
  @MaxLength(300)
  author!: string;

  @IsOptional()
  @IsArray()
  recipients?: string[];

  @IsOptional()
  @IsArray()
  ccRecipients?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentType?: string;

  @IsString()
  description!: string;

  @IsEnum(PrivilegeType)
  privilegeType!: PrivilegeType;

  @IsOptional()
  @IsString()
  privilegeBasis?: string;

  @IsOptional()
  @IsBoolean()
  isRedacted?: boolean;

  @IsOptional()
  @IsString()
  redactionDetails?: string;

  @IsOptional()
  @IsNumber()
  pageCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  custodian?: string;

  @IsOptional()
  @IsUUID()
  custodianId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  filePath?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  reviewedBy?: string;

  @IsUUID()
  createdBy!: string;
}
