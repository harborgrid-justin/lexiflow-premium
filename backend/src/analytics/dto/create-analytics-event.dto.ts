import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  IsNotEmpty,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AnalyticsEventCategory {
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  BUSINESS_METRIC = 'business_metric',
  PERFORMANCE = 'performance',
  ERROR = 'error',
}

export class CreateAnalyticsEventDto {
  @ApiProperty({ description: 'Event name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  eventName: string;

  @ApiProperty({ enum: AnalyticsEventCategory, description: 'Event category' })
  @IsEnum(AnalyticsEventCategory)
  @IsNotEmpty()
  category: AnalyticsEventCategory;

  @ApiPropertyOptional({ description: 'Event description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'User ID who triggered the event' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Case ID if applicable' })
  @IsString()
  @IsOptional()
  caseId?: string;

  @ApiPropertyOptional({ description: 'Numeric value associated with event' })
  @IsNumber()
  @IsOptional()
  value?: number;

  @ApiPropertyOptional({ description: 'Event properties as JSON' })
  @IsObject()
  @IsOptional()
  properties?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Session ID' })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiPropertyOptional({ description: 'IP address' })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ description: 'User agent string' })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
