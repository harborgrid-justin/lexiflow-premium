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
import { DepositionType } from '../entities/deposition.entity';

export class CreateDepositionDto {
  @IsUUID()
  caseId: string;

  @IsString()
  @MaxLength(300)
  deponentName: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deponentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  deponentOrganization?: string;

  @IsEnum(DepositionType)
  type: DepositionType;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  courtReporter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  videographer?: string;

  @IsOptional()
  @IsArray()
  attendees?: Array<{
    name: string;
    role: string;
    organization?: string;
  }>;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  keyTestimony?: string;

  @IsOptional()
  @IsArray()
  exhibits?: Array<{
    exhibitNumber: string;
    description: string;
    documentId?: string;
  }>;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  assignedAttorney?: string;

  @IsUUID()
  createdBy: string;
}
