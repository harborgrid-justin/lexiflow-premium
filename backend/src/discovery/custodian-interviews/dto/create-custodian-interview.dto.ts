import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { InterviewType } from '../entities/custodian-interview.entity';

export class CreateCustodianInterviewDto {
  @IsUUID()
  caseId!: string;

  @IsUUID()
  custodianId!: string;

  @IsString()
  @MaxLength(300)
  custodianName!: string;

  @IsEnum(InterviewType)
  type!: InterviewType;

  @IsDateString()
  scheduledDate!: string;

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
  @IsBoolean()
  isRecorded?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  conductedBy?: string;

  @IsUUID()
  createdBy!: string;
}
