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
import { ProductionFormat } from '../entities/production.entity';

export class CreateProductionDto {
  @IsUUID()
  caseId!: string;

  @IsString()
  @MaxLength(300)
  productionName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  productionNumber?: string;

  @IsEnum(ProductionFormat)
  format!: ProductionFormat;

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
  @IsString()
  @MaxLength(50)
  batesPrefix?: string;

  @IsOptional()
  @IsNumber()
  batesStart?: number;

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
  @IsNumber()
  productionCost?: number;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsUUID()
  createdBy!: string;
}
