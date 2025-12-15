import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  MESSAGE = 'message',
  NOTIFICATION = 'notification',
  UPDATE = 'update',
  ALERT = 'alert'
}

export class EmitEventDto {
  @ApiProperty({ description: 'Event type', enum: EventType })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ description: 'Event name' })
  @IsString()
  event: string;

  @ApiProperty({ description: 'Room/Channel name', required: false })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({ description: 'Event data' })
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({ description: 'Target user ID', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
