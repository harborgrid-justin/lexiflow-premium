import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { DiscoveryRequestType } from '../entities/discovery-request.entity';

export class CreateDiscoveryRequestDto {
  @IsUUID()
  caseId!: string;

  @IsEnum(DiscoveryRequestType)
  type!: DiscoveryRequestType;

  @IsString()
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  requestNumber?: string;

  @IsOptional()
  @IsDateString()
  dateSent?: string;

  @IsOptional()
  @IsDateString()
  dateReceived?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  requestingParty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  respondingParty?: string;

  @IsOptional()
  @IsNumber()
  numberOfRequests?: number;

  @IsOptional()
  @IsArray()
  requestItems?: Record<string, unknown>[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsUUID()
  createdBy!: string;
}
