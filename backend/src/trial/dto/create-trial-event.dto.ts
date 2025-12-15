import { IsString, IsOptional, IsDateString, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TrialEventType {
  HEARING = 'Hearing',
  DEPOSITION = 'Deposition',
  MOTION_HEARING = 'Motion Hearing',
  TRIAL_DATE = 'Trial Date',
  CONFERENCE = 'Conference',
  OTHER = 'Other'
}

export class CreateTrialEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: TrialEventType })
  @IsEnum(TrialEventType)
  type: TrialEventType;

  @ApiProperty()
  @IsDateString()
  date: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty()
  @IsString()
  caseId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsOptional()
  attendees?: string[];
}
