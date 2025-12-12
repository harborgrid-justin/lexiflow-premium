import { IsOptional, IsEnum, IsUUID, IsString, IsNumber, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CustodianStatus } from '../entities/custodian.entity';

export class QueryCustodianDto {
  @IsOptional()
  @IsUUID()
  caseId?: string;

  @IsOptional()
  @IsEnum(CustodianStatus)
  status?: CustodianStatus;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isKeyPlayer?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isOnLegalHold?: boolean;

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
  sortBy?: string = 'fullName';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
