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
import { PrivilegeType, PrivilegeStatus } from '../entities/privilege-log-entry.entity';

export class UpdatePrivilegeLogEntryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  privilegeLogNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  batesNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  documentId?: string;

  @IsOptional()
  @IsDateString()
  documentDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  author?: string;

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

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PrivilegeType)
  privilegeType?: PrivilegeType;

  @IsOptional()
  @IsString()
  privilegeBasis?: string;

  @IsOptional()
  @IsEnum(PrivilegeStatus)
  status?: PrivilegeStatus;

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
  challengeNotes?: string;

  @IsOptional()
  @IsDateString()
  dateChallenged?: string;

  @IsOptional()
  @IsDateString()
  dateResolved?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  reviewedBy?: string;

  @IsUUID()
  updatedBy!: string;
}
