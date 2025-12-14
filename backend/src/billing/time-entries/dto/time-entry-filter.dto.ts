import { IsOptional, IsString, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { TimeEntryStatus } from '../entities/time-entry.entity';
import { CreateTimeEntryDto } from './create-time-entry.dto';

export class TimeEntryFilterDto {
  @IsOptional()
  @IsString()
  caseId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  invoiceId?: string;

  @IsOptional()
  @IsEnum(TimeEntryStatus)
  status?: TimeEntryStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  billable?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  activity?: string;

  @IsOptional()
  @IsString()
  phaseCode?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  sortBy?: string = 'date';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class BulkCreateTimeEntryDto {
  @Type(() => CreateTimeEntryDto)
  entries: CreateTimeEntryDto[];
}
