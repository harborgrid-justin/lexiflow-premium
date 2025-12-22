import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  IsUUID,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ProductionFormat, ProductionStatus } from '../entities/production.entity';

export class UpdateProductionDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  productionName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  productionNumber?: string;

  @IsOptional()
  @IsEnum(ProductionStatus)
  status?: ProductionStatus;

  @IsOptional()
  @IsEnum(ProductionFormat)
  format?: ProductionFormat;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientParty?: string;

  @IsOptional()
  @IsDateString()
  requestDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsDateString()
  productionDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  batesPrefix?: string;

  @IsOptional()
  @IsNumber()
  batesStart?: number;

  @IsOptional()
  @IsNumber()
  batesEnd?: number;

  @IsOptional()
  @IsNumber()
  totalDocuments?: number;

  @IsOptional()
  @IsNumber()
  totalPages?: number;

  @IsOptional()
  @IsNumber()
  totalSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  outputPath?: string;

  @IsOptional()
  @IsArray()
  volumes?: Array<{
    volumeNumber: number;
    volumeName: string;
    documentCount: number;
    pageCount: number;
    path: string;
  }>;

  @IsOptional()
  @IsBoolean()
  includePrivilegeLog?: boolean;

  @IsOptional()
  @IsBoolean()
  includeRedactions?: boolean;

  @IsOptional()
  searchCriteria?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  productionNotes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  deliveryMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  trackingNumber?: string;

  @IsOptional()
  @IsNumber()
  productionCost?: number;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsUUID()
  updatedBy: string;
}
