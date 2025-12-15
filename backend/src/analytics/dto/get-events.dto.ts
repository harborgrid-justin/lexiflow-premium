import { IsOptional, IsString, IsDateString, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EventType } from './track-event.dto';

export class GetEventsDto {
  @ApiProperty({ 
    description: 'Filter by event type',
    enum: EventType,
    required: false
  })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;

  @ApiProperty({ 
    description: 'Filter by user ID',
    required: false
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ 
    description: 'Start date for events',
    required: false
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date for events',
    required: false
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    description: 'Page number',
    default: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Items per page',
    default: 50,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
