import { IsString, IsOptional, IsDateString, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CalendarEventType {
  HEARING = 'Hearing',
  DEADLINE = 'Deadline',
  MEETING = 'Meeting',
  REMINDER = 'Reminder',
  COURT_DATE = 'CourtDate',
  FILING = 'Filing'
}

export class CreateCalendarEventDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: CalendarEventType })
  @IsEnum(CalendarEventType)
  eventType: CalendarEventType;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  attendees?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reminder?: string;
}

export class UpdateCalendarEventDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ enum: CalendarEventType })
  @IsEnum(CalendarEventType)
  @IsOptional()
  eventType?: CalendarEventType;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  attendees?: string[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reminder?: string;
}
