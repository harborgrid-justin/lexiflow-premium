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
import { DiscoveryRequestType, DiscoveryRequestStatus } from '@discovery/discovery-requests/entities/discovery-request.entity';

export class UpdateDiscoveryRequestDto {
  @IsOptional()
  @IsEnum(DiscoveryRequestType)
  type?: DiscoveryRequestType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DiscoveryRequestStatus)
  status?: DiscoveryRequestStatus;

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
  @IsDateString()
  dateResponded?: string;

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
  @IsNumber()
  numberOfResponses?: number;

  @IsOptional()
  @IsNumber()
  numberOfObjections?: number;

  @IsOptional()
  @IsArray()
  requestItems?: unknown[];

  @IsOptional()
  @IsArray()
  responses?: unknown[];

  @IsOptional()
  @IsArray()
  objections?: unknown[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsUUID()
  updatedBy!: string;
}
