import { IsString, IsDateString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CalendarIntegrationEventDto {
  @ApiProperty({ description: 'Event title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Event description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Event start time' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Event end time' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Event location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Attendee email addresses', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attendees?: string[];

  @ApiProperty({ description: 'Related case ID', required: false })
  @IsOptional()
  @IsString()
  caseId?: string;
}

export class CalendarSyncDto {
  @ApiProperty({ description: 'Sync from date' })
  @IsDateString()
  fromDate: string;

  @ApiProperty({ description: 'Sync to date' })
  @IsDateString()
  toDate: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  organizer?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  meetingLink?: string;
  caseId?: string;
}
