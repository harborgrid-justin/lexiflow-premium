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
import { DepositionMethod, DepositionStatus } from '../entities/deposition.entity';

export class UpdateDepositionDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  deponentName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deponentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  deponentOrganization?: string;

  @IsOptional()
  @IsEnum(DepositionMethod)
  method?: DepositionMethod;

  @IsOptional()
  @IsEnum(DepositionStatus)
  status?: DepositionStatus;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  actualStartTime?: string;

  @IsOptional()
  @IsDateString()
  actualEndTime?: string;

  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  courtReporter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  videographer?: string;

  @IsOptional()
  @IsArray()
  attendees?: Array<{
    name: string;
    role: string;
    organization?: string;
  }>;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  keyTestimony?: string;

  @IsOptional()
  @IsArray()
  exhibits?: Array<{
    exhibitNumber: string;
    description: string;
    documentId?: string;
  }>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  transcriptPath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  videoPath?: string;

  @IsOptional()
  @IsBoolean()
  isTranscriptOrdered?: boolean;

  @IsOptional()
  @IsDateString()
  transcriptOrderedDate?: string;

  @IsOptional()
  @IsDateString()
  transcriptReceivedDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  assignedAttorney?: string;

  @IsUUID()
  updatedBy!: string;
}
