import { IsString, IsEnum, IsOptional, IsUUID, IsDate, IsNotEmpty, IsBoolean, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CalendarEventType } from '../entities/calendar-event.entity';

export class CreateCalendarEventDto {
  @ApiProperty({ 
    description: 'Event title',
    example: 'Motion Hearing'
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ 
    description: 'Type of calendar event',
    enum: CalendarEventType,
    example: CalendarEventType.HEARING
  })
  @IsEnum(CalendarEventType)
  @IsNotEmpty()
  eventType!: CalendarEventType;

  @ApiProperty({ 
    description: 'Start date and time',
    example: '2025-01-15T10:00:00Z'
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startDate!: Date;

  @ApiProperty({ 
    description: 'End date and time',
    example: '2025-01-15T11:00:00Z'
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endDate!: Date;

  @ApiPropertyOptional({ 
    description: 'Event description'
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Event location',
    example: 'Courtroom 3A'
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'List of attendee emails or IDs',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attendees?: string[];

  @ApiPropertyOptional({ 
    description: 'Associated case ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional({ 
    description: 'Reminder time',
    example: '30 minutes'
  })
  @IsString()
  @IsOptional()
  reminder?: string;

  @ApiPropertyOptional({ 
    description: 'Event completion status',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
