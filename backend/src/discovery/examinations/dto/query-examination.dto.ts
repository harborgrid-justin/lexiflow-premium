import { IsOptional, IsEnum, IsUUID, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExaminationType, ExaminationStatus } from '@discovery/examinations/entities/examination.entity';

export class QueryExaminationDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsEnum(ExaminationType)
  type?: ExaminationType;

  @IsOptional()
  @IsEnum(ExaminationStatus)
  status?: ExaminationStatus;

  @IsOptional()
  @IsUUID()
  assignedAttorney?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'scheduledDate';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
