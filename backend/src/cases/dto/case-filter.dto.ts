import { IsEnum, IsOptional, IsString, IsInt, Min, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType, CaseStatus } from '../entities/case.entity';

export class CaseFilterDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(CaseStatus)
  @IsOptional()
  status?: CaseStatus;

  @IsEnum(CaseType)
  @IsOptional()
  type?: CaseType;

  @IsString()
  @IsOptional()
  practiceArea?: string;

  @IsUUID()
  @IsOptional()
  assignedTeamId?: string;

  @IsUUID()
  @IsOptional()
  leadAttorneyId?: string;

  @IsString()
  @IsOptional()
  jurisdiction?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isArchived?: boolean;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeParties?: boolean = false;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includeTeam?: boolean = false;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  includePhases?: boolean = false;
}
