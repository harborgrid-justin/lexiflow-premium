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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLegalHoldDto {
  @IsUUID()
  caseId: string;

  @IsString()
  @MaxLength(300)
  holdName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  holdNumber?: string;

  @IsString()
  description: string;

  @IsString()
  holdInstructions: string;

  @IsDateString()
  issueDate: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsArray()
  custodians: Array<{
    custodianId: string;
    custodianName: string;
    email: string;
    notifiedDate?: Date;
    acknowledgedDate?: Date;
    status: string;
  }>;

  @IsOptional()
  @IsArray()
  dataSourcesToPreserve?: Array<{
    sourceType: string;
    description: string;
    location?: string;
  }>;

  @IsOptional()
  @IsNumber()
  reminderIntervalDays?: number;

  @IsOptional()
  @IsBoolean()
  isAutoReminder?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  issuedBy?: string;

  @IsUUID()
  createdBy: string;
}
