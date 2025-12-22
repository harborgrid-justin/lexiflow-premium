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
import { LegalHoldStatus } from '../entities/legal-hold.entity';

export class UpdateLegalHoldDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  holdName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  holdNumber?: string;

  @IsOptional()
  @IsEnum(LegalHoldStatus)
  status?: LegalHoldStatus;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  holdInstructions?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsArray()
  custodians?: Array<{
    custodianId: string;
    custodianName: string;
    email: string;
    notifiedDate?: Date;
    acknowledgedDate?: Date;
    status: string;
  }>;

  @IsOptional()
  @IsNumber()
  totalCustodians?: number;

  @IsOptional()
  @IsNumber()
  acknowledgedCount?: number;

  @IsOptional()
  @IsNumber()
  pendingCount?: number;

  @IsOptional()
  @IsArray()
  dataSourcesToPreserve?: Array<{
    sourceType: string;
    description: string;
    location?: string;
  }>;

  @IsOptional()
  @IsArray()
  notifications?: Array<{
    date: Date;
    type: string;
    recipients: string[];
    subject: string;
    status: string;
  }>;

  @IsOptional()
  @IsNumber()
  reminderIntervalDays?: number;

  @IsOptional()
  @IsDateString()
  lastReminderDate?: string;

  @IsOptional()
  @IsDateString()
  nextReminderDate?: string;

  @IsOptional()
  @IsBoolean()
  isAutoReminder?: boolean;

  @IsOptional()
  @IsString()
  releaseReason?: string;

  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  issuedBy?: string;

  @IsOptional()
  @IsUUID()
  releasedBy?: string;

  @IsUUID()
  updatedBy!: string;
}
