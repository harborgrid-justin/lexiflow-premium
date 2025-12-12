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
import { InterviewType, InterviewStatus } from '../entities/custodian-interview.entity';

export class UpdateCustodianInterviewDto {
  @IsOptional()
  @IsEnum(InterviewType)
  type?: InterviewType;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

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
  @IsArray()
  interviewers?: Array<{
    userId: string;
    name: string;
    role: string;
  }>;

  @IsOptional()
  @IsArray()
  attendees?: Array<{
    name: string;
    role: string;
    organization?: string;
  }>;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsArray()
  topics?: string[];

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  keyFindings?: string;

  @IsOptional()
  @IsArray()
  dataSourcesDiscussed?: Array<{
    sourceName: string;
    sourceType: string;
    location?: string;
    notes?: string;
  }>;

  @IsOptional()
  @IsArray()
  documentsIdentified?: Array<{
    description: string;
    location?: string;
    custodian?: string;
  }>;

  @IsOptional()
  @IsArray()
  followUpActions?: Array<{
    action: string;
    assignedTo?: string;
    dueDate?: Date;
    status: string;
  }>;

  @IsOptional()
  @IsBoolean()
  isRecorded?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  recordingPath?: string;

  @IsOptional()
  @IsBoolean()
  isTranscribed?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  transcriptPath?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  conductedBy?: string;

  @IsUUID()
  updatedBy: string;
}
