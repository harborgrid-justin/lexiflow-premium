import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  IsBoolean,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { CustodianStatus } from '../entities/custodian.entity';

export class CreateCustodianDto {
  @IsUUID()
  caseId: string;

  @IsString()
  @MaxLength(200)
  firstName: string;

  @IsString()
  @MaxLength(200)
  lastName: string;

  @IsString()
  @MaxLength(400)
  fullName: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(300)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  organization?: string;

  @IsOptional()
  @IsDateString()
  dateIdentified?: string;

  @IsOptional()
  @IsBoolean()
  isKeyPlayer?: boolean;

  @IsOptional()
  @IsString()
  relevance?: string;

  @IsOptional()
  @IsArray()
  dataSources?: Array<{
    sourceId: string;
    sourceName: string;
    sourceType: string;
    status: string;
  }>;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsUUID()
  createdBy: string;
}
