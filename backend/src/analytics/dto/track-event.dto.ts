import { IsString, IsOptional, IsEnum, IsDateString, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  PAGE_VIEW = 'page_view',
  DOCUMENT_ACCESS = 'document_access',
  CASE_ACTION = 'case_action',
  USER_LOGIN = 'user_login',
  API_CALL = 'api_call',
  ERROR = 'error',
  CUSTOM = 'custom'
}

export class TrackEventDto {
  @ApiProperty({ 
    description: 'Event type',
    enum: EventType
  })
  @IsEnum(EventType)
  eventType: EventType;

  @ApiProperty({ 
    description: 'Event name',
    example: 'case_created'
  })
  @IsString()
  eventName: string;

  @ApiProperty({ 
    description: 'User ID who triggered the event',
    required: false
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ 
    description: 'Session ID',
    required: false
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiProperty({ 
    description: 'Event properties as JSON',
    required: false
  })
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @ApiProperty({ 
    description: 'Event timestamp',
    required: false
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;
}
