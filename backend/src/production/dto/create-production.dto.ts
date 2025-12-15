import { IsString, IsUUID, IsEnum, IsOptional, IsBoolean, IsInt, IsDate, IsObject, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductionFormat } from '../entities/production.entity';

export class CreateProductionDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsUUID()
  caseId: string;

  @IsEnum(ProductionFormat)
  format: ProductionFormat;

  @IsString()
  @MaxLength(50)
  productionNumber: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  productionDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  requestedBy?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  producedTo?: string;

  @IsBoolean()
  @IsOptional()
  includeMetadata?: boolean;

  @IsBoolean()
  @IsOptional()
  includeNatives?: boolean;

  @IsBoolean()
  @IsOptional()
  includeText?: boolean;

  @IsBoolean()
  @IsOptional()
  includeImages?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  beginBates?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  endBates?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsUUID()
  createdBy: string;
}
