import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsEmail,
  IsNumber,
  IsDate,
  IsBoolean,
  IsObject,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MatterStatus, MatterType, MatterPriority } from '../entities/matter.entity';

export class CreateMatterDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @IsEnum(MatterStatus)
  @IsOptional()
  status?: MatterStatus;

  @IsEnum(MatterType)
  @IsOptional()
  matterType?: MatterType;

  @IsEnum(MatterPriority)
  @IsOptional()
  priority?: MatterPriority;

  // Client Information
  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsEmail()
  @IsOptional()
  clientEmail?: string;

  @IsString()
  @IsOptional()
  clientPhone?: string;

  // Assignment
  @IsString()
  @IsOptional()
  leadAttorneyId?: string;

  @IsString()
  @IsOptional()
  leadAttorneyName?: string;

  @IsOptional()
  @IsString()
  originatingAttorneyId?: string;

  @IsOptional()
  @IsString()
  originatingAttorneyName?: string;

  // Jurisdictional Information
  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  // Financial
  @IsString()
  @IsOptional()
  billingType?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  hourlyRate?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  flatFee?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  contingencyPercentage?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  retainerAmount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  estimatedValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  budgetAmount?: number;

  // Dates
  @IsDate()
  @Type(() => Date)
  openedDate: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  targetCloseDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  closedDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  statute_of_limitations?: Date;

  // Practice Area & Tags
  @IsString()
  @IsOptional()
  practiceArea?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  // Opposing Party
  @IsString()
  @IsOptional()
  opposingPartyName?: string;

  @IsString()
  @IsOptional()
  opposingCounsel?: string;

  @IsString()
  @IsOptional()
  opposingCounselFirm?: string;

  // Risk & Conflict
  @IsString()
  @IsOptional()
  conflictCheckStatus?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  conflictCheckNotes?: string;

  @IsString()
  @IsOptional()
  riskLevel?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  riskNotes?: string;

  // Resources
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedCaseIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedDocumentIds?: string[];

  // Notes & Custom Fields
  @IsString()
  @IsOptional()
  @MaxLength(10000)
  internalNotes?: string;

  @IsObject()
  @IsOptional()
  customFields?: Record<string, unknown>;

  // Metadata
  @IsString()
  @IsOptional()
  userId?: string;

  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
