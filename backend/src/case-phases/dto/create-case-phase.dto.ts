import { IsString, IsEnum, IsOptional, IsUUID, IsNotEmpty, MaxLength, IsDate, IsInt, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PhaseType, PhaseStatus } from '../entities/case-phase.entity';

export class CreateCasePhaseDto {
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsEnum(PhaseType)
  @IsNotEmpty()
  type: PhaseType;

  @IsEnum(PhaseStatus)
  @IsOptional()
  status?: PhaseStatus;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expectedEndDate?: Date;

  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  completionPercentage?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  milestones?: Array<{
    name: string;
    dueDate?: Date;
    completedDate?: Date;
    status: string;
  }>;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
