import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationType {
  CASE_UPDATE = 'case_update',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DEADLINE_REMINDER = 'deadline_reminder',
  TASK_ASSIGNED = 'task_assigned',
  MESSAGE_RECEIVED = 'message_received',
  INVOICE_SENT = 'invoice_sent',
  APPROVAL_REQUIRED = 'approval_required',
  SYSTEM_ALERT = 'system_alert',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.CASE_UPDATE,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Document Filed',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'A new motion has been filed in Case #12345',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'User ID to receive notification',
    example: 'user-123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Priority level',
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({
    description: 'Related entity ID (case, document, etc.)',
    required: false,
  })
  @IsOptional()
  @IsString()
  relatedEntityId?: string;

  @ApiProperty({
    description: 'Related entity type',
    required: false,
  })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiProperty({
    description: 'Additional metadata',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Action URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;
}
