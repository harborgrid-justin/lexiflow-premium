import { IsOptional, IsEnum, IsUUID, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscoveryRequestType, DiscoveryRequestStatus } from '@discovery/discovery-requests/entities/discovery-request.entity';

export class QueryDiscoveryRequestDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsEnum(DiscoveryRequestType)
  type?: DiscoveryRequestType;

  @IsOptional()
  @IsEnum(DiscoveryRequestStatus)
  status?: DiscoveryRequestStatus;

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
