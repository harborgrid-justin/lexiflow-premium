import { IsBoolean, IsOptional, IsEnum, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Delivery channel for notifications
 */
export enum DeliveryChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  SLACK = 'slack',
}

/**
 * Notification digest frequency
 */
export enum DigestFrequency {
  REALTIME = 'realtime',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
}

/**
 * Quiet hours configuration
 */
export class QuietHoursDto {
  @ApiProperty({
    description: 'Enable quiet hours',
    default: false,
  })
  @IsBoolean()
  enabled!: boolean;

  @ApiProperty({
    description: 'Start time (24h format, e.g., "22:00")',
    example: '22:00',
  })
  @IsString()
  startTime!: string;

  @ApiProperty({
    description: 'End time (24h format, e.g., "08:00")',
    example: '08:00',
  })
  @IsString()
  endTime!: string;

  @ApiProperty({
    description: 'Timezone (e.g., "America/New_York")',
    example: 'America/New_York',
  })
  @IsString()
  timezone!: string;
}

/**
 * Channel-specific preferences
 */
export class ChannelPreferencesDto {
  @ApiProperty({
    description: 'Enable in-app notifications',
    default: true,
  })
  @IsBoolean()
  inApp!: boolean;

  @ApiProperty({
    description: 'Enable email notifications',
    default: true,
  })
  @IsBoolean()
  email!: boolean;

  @ApiProperty({
    description: 'Enable push notifications',
    default: true,
  })
  @IsBoolean()
  push!: boolean;

  @ApiProperty({
    description: 'Enable SMS notifications',
    default: false,
  })
  @IsBoolean()
  sms!: boolean;

  @ApiProperty({
    description: 'Enable Slack notifications',
    default: false,
  })
  @IsBoolean()
  slack!: boolean;
}

/**
 * Notification type preferences
 */
export class NotificationTypePreferencesDto {
  @ApiProperty({
    description: 'Case update notifications',
    default: true,
  })
  @IsBoolean()
  caseUpdates!: boolean;

  @ApiProperty({
    description: 'Document upload notifications',
    default: true,
  })
  @IsBoolean()
  documentUploads!: boolean;

  @ApiProperty({
    description: 'Deadline reminder notifications',
    default: true,
  })
  @IsBoolean()
  deadlineReminders!: boolean;

  @ApiProperty({
    description: 'Task assignment notifications',
    default: true,
  })
  @IsBoolean()
  taskAssignments!: boolean;

  @ApiProperty({
    description: 'Message notifications',
    default: true,
  })
  @IsBoolean()
  messages!: boolean;

  @ApiProperty({
    description: 'Invoice notifications',
    default: true,
  })
  @IsBoolean()
  invoices!: boolean;

  @ApiProperty({
    description: 'Approval request notifications',
    default: true,
  })
  @IsBoolean()
  approvals!: boolean;

  @ApiProperty({
    description: 'System alert notifications',
    default: true,
  })
  @IsBoolean()
  systemAlerts!: boolean;
}

/**
 * Priority-based delivery preferences
 */
export class PriorityDeliveryDto {
  @ApiProperty({
    description: 'Channels for low priority notifications',
    type: [String],
    enum: DeliveryChannel,
    default: [DeliveryChannel.IN_APP],
  })
  @IsOptional()
  @IsEnum(DeliveryChannel, { each: true })
  low?: DeliveryChannel[];

  @ApiProperty({
    description: 'Channels for medium priority notifications',
    type: [String],
    enum: DeliveryChannel,
    default: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL],
  })
  @IsOptional()
  @IsEnum(DeliveryChannel, { each: true })
  medium?: DeliveryChannel[];

  @ApiProperty({
    description: 'Channels for high priority notifications',
    type: [String],
    enum: DeliveryChannel,
    default: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL, DeliveryChannel.PUSH],
  })
  @IsOptional()
  @IsEnum(DeliveryChannel, { each: true })
  high?: DeliveryChannel[];

  @ApiProperty({
    description: 'Channels for urgent priority notifications',
    type: [String],
    enum: DeliveryChannel,
    default: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL, DeliveryChannel.PUSH, DeliveryChannel.SMS],
  })
  @IsOptional()
  @IsEnum(DeliveryChannel, { each: true })
  urgent?: DeliveryChannel[];
}

/**
 * Enhanced Delivery Preferences DTO
 *
 * Comprehensive notification delivery configuration including:
 * - Channel preferences (in-app, email, push, SMS, Slack)
 * - Notification type preferences
 * - Digest frequency
 * - Quiet hours
 * - Priority-based delivery
 */
export class DeliveryPreferencesDto {
  @ApiProperty({
    description: 'User ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Channel preferences',
    type: ChannelPreferencesDto,
  })
  @ValidateNested()
  @Type(() => ChannelPreferencesDto)
  channels!: ChannelPreferencesDto;

  @ApiProperty({
    description: 'Notification type preferences',
    type: NotificationTypePreferencesDto,
  })
  @ValidateNested()
  @Type(() => NotificationTypePreferencesDto)
  types!: NotificationTypePreferencesDto;

  @ApiProperty({
    description: 'Digest frequency for email notifications',
    enum: DigestFrequency,
    default: DigestFrequency.REALTIME,
  })
  @IsEnum(DigestFrequency)
  digestFrequency!: DigestFrequency;

  @ApiProperty({
    description: 'Quiet hours configuration',
    type: QuietHoursDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;

  @ApiProperty({
    description: 'Priority-based delivery channels',
    type: PriorityDeliveryDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PriorityDeliveryDto)
  priorityDelivery?: PriorityDeliveryDto;

  @ApiProperty({
    description: 'Email address for notifications',
    required: false,
  })
  @IsOptional()
  @IsString()
  emailAddress?: string;

  @ApiProperty({
    description: 'Phone number for SMS notifications',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Slack webhook URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  slackWebhookUrl?: string;

  @ApiProperty({
    description: 'Push notification device tokens',
    type: [String],
    required: false,
  })
  @IsOptional()
  deviceTokens?: string[];

  @ApiProperty({
    description: 'Additional custom preferences',
    required: false,
  })
  @IsOptional()
  @IsObject()
  customPreferences?: Record<string, unknown>;
}

/**
 * Get default delivery preferences
 */
export function getDefaultDeliveryPreferences(): DeliveryPreferencesDto {
  return {
    channels: {
      inApp: true,
      email: true,
      push: true,
      sms: false,
      slack: false,
    },
    types: {
      caseUpdates: true,
      documentUploads: true,
      deadlineReminders: true,
      taskAssignments: true,
      messages: true,
      invoices: true,
      approvals: true,
      systemAlerts: true,
    },
    digestFrequency: DigestFrequency.REALTIME,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'America/New_York',
    },
    priorityDelivery: {
      low: [DeliveryChannel.IN_APP],
      medium: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL],
      high: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL, DeliveryChannel.PUSH],
      urgent: [DeliveryChannel.IN_APP, DeliveryChannel.EMAIL, DeliveryChannel.PUSH, DeliveryChannel.SMS],
    },
  };
}
