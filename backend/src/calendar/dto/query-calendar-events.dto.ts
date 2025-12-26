import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum CalendarEventType {
  HEARING = 'Hearing',
  DEADLINE = 'Deadline',
  MEETING = 'Meeting',
  CONFERENCE = 'Conference',
  DEPOSITION = 'Deposition',
  TRIAL = 'Trial',
  FILING = 'Filing',
  OTHER = 'Other',
}

export class QueryCalendarEventsDto {
  @ApiPropertyOptional({
    description: 'Filter by event type',
    enum: CalendarEventType
  })
  @IsEnum(CalendarEventType)
  @IsOptional()
  eventType?: CalendarEventType;

  @ApiPropertyOptional({
    description: 'Filter by case ID'
  })
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID'
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO format)'
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO format)'
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Search term for title or description'
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    example: 50
  })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    example: 0
  })
  @IsOptional()
  offset?: number;
}
