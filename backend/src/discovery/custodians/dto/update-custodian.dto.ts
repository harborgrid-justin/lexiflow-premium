import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  IsBoolean,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { CustodianStatus } from '@discovery/custodians/entities/custodian.entity';

export class UpdateCustodianDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(300)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  organization?: string;

  @IsOptional()
  @IsEnum(CustodianStatus)
  status?: CustodianStatus;

  @IsOptional()
  @IsDateString()
  dateIdentified?: string;

  @IsOptional()
  @IsDateString()
  dateNotified?: string;

  @IsOptional()
  @IsDateString()
  dateInterviewed?: string;

  @IsOptional()
  @IsDateString()
  dataCollectionDate?: string;

  @IsOptional()
  @IsBoolean()
  isKeyPlayer?: boolean;

  @IsOptional()
  @IsString()
  relevance?: string;

  @IsOptional()
  @IsArray()
  dataSources?: Array<{
    sourceId: string;
    sourceName: string;
    sourceType: string;
    status: string;
  }>;

  @IsOptional()
  @IsBoolean()
  isOnLegalHold?: boolean;

  @IsOptional()
  @IsUUID()
  legalHoldId?: string;

  @IsOptional()
  @IsDateString()
  legalHoldDate?: string;

  @IsOptional()
  @IsDateString()
  legalHoldReleasedDate?: string;

  @IsOptional()
  @IsArray()
  interviews?: Array<{
    date: Date;
    interviewer: string;
    summary: string;
  }>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsUUID()
  updatedBy!: string;
}
