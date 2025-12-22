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
import { ESISourceType } from '../entities/esi-source.entity';

export class CreateESISourceDto {
  @IsUUID()
  caseId!: string;

  @IsString()
  @MaxLength(300)
  sourceName!: string;

  @IsEnum(ESISourceType)
  sourceType!: ESISourceType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  custodian?: string;

  @IsOptional()
  @IsUUID()
  custodianId?: string;

  @IsOptional()
  @IsDateString()
  dateIdentified?: string;

  @IsOptional()
  @IsDateString()
  datePreserved?: string;

  @IsOptional()
  @IsNumber()
  estimatedVolume?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  volumeUnit?: string;

  @IsOptional()
  @IsDateString()
  dateRangeStart?: string;

  @IsOptional()
  @IsDateString()
  dateRangeEnd?: string;

  @IsOptional()
  @IsArray()
  fileTypes?: string[];

  @IsOptional()
  @IsString()
  searchTerms?: string;

  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresSpecialProcessing?: boolean;

  @IsOptional()
  @IsString()
  processingNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  collectionMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  collectionVendor?: string;

  @IsOptional()
  @IsNumber()
  collectionCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsUUID()
  createdBy!: string;
}
