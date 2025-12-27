import { IsOptional, IsEnum, IsUUID, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DepositionMethod, DepositionStatus } from '@discovery/depositions/entities/deposition.entity';

export class QueryDepositionDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsEnum(DepositionMethod)
  method?: DepositionMethod;

  @IsOptional()
  @IsEnum(DepositionStatus)
  status?: DepositionStatus;

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
