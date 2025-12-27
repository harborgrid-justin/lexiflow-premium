import { IsOptional, IsEnum, IsUUID, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PrivilegeType, PrivilegeStatus } from '@discovery/privilege-log/entities/privilege-log-entry.entity';

export class QueryPrivilegeLogEntryDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsEnum(PrivilegeType)
  privilegeType?: PrivilegeType;

  @IsOptional()
  @IsEnum(PrivilegeStatus)
  status?: PrivilegeStatus;

  @IsOptional()
  @IsUUID()
  custodianId?: string;

  @IsOptional()
  @IsUUID()
  reviewedBy?: string;

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
  sortBy?: string = 'documentDate';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
