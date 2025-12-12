import { IsString, IsEnum, IsOptional, IsDate, IsUUID, IsNotEmpty, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType, CaseStatus } from '../entities/case.entity';

export class CreateCaseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  caseNumber: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(CaseType)
  @IsOptional()
  type?: CaseType;

  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  practiceArea?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  jurisdiction?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  court?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  judge?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  filingDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  trialDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  closeDate?: Date;

  @IsUUID()
  @IsOptional()
  assignedTeamId?: string;

  @IsUUID()
  @IsOptional()
  leadAttorneyId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
