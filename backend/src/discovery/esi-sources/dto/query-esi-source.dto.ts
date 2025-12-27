import { IsOptional, IsEnum, IsUUID, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ESISourceType, ESISourceStatus } from '@discovery/esi-sources/entities/esi-source.entity';

export class QueryESISourceDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsEnum(ESISourceType)
  sourceType?: ESISourceType;

  @IsOptional()
  @IsEnum(ESISourceStatus)
  status?: ESISourceStatus;

  @IsOptional()
  @IsUUID()
  custodianId?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

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
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
