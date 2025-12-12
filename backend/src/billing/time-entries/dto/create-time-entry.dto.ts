import { IsString, IsNumber, IsDate, IsOptional, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TimeEntryStatus } from '../entities/time-entry.entity';

export class CreateTimeEntryDto {
  @IsString()
  caseId: string;

  @IsString()
  userId: string;

  @IsString()
  date: string; // ISO date string YYYY-MM-DD

  @IsNumber()
  @Min(0.01)
  @Max(24)
  duration: number; // in hours

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsString()
  ledesCode?: string;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsOptional()
  @IsEnum(TimeEntryStatus)
  status?: TimeEntryStatus;

  @IsOptional()
  @IsBoolean()
  billable?: boolean;

  @IsOptional()
  @IsString()
  rateTableId?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  taskCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number; // percentage

  @IsOptional()
  @IsString()
  phaseCode?: string;

  @IsOptional()
  @IsString()
  expenseCategory?: string;
}
