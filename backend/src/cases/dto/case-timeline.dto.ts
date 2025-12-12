import { IsEnum, IsString, IsOptional, IsUUID, IsObject, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TimelineEventType } from '../entities/case-timeline.entity';

export class CreateTimelineEventDto {
  @IsUUID()
  caseId: string;

  @IsEnum(TimelineEventType)
  eventType: TimelineEventType;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  @IsOptional()
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  eventDate?: Date;
}

export class TimelineEventResponseDto {
  id: string;
  caseId: string;
  eventType: TimelineEventType;
  title: string;
  description?: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
  changes?: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  eventDate: Date;
  createdAt: Date;
}
