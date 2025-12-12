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
import { ExaminationType } from '../entities/examination.entity';

export class CreateExaminationDto {
  @IsUUID()
  caseId: string;

  @IsString()
  @MaxLength(300)
  examinationTitle: string;

  @IsEnum(ExaminationType)
  type: ExaminationType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MaxLength(300)
  examinee: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  examiner?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  examinerOrganization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  examinerSpecialty?: string;

  @IsOptional()
  @IsDateString()
  requestDate?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  requestingParty?: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  scope?: string;

  @IsOptional()
  @IsArray()
  conditions?: string[];

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
