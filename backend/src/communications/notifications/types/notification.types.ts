/**
 * Notification System Type Definitions
 *
 * Comprehensive type definitions for the notification system,
 * ensuring type safety throughout the delivery pipeline.
 */

import { DeliveryChannel } from '../dto/delivery-preferences.dto';

/**
 * Rendered notification content with metadata
 */
export interface RenderedNotificationContent {
  title: string;
  body: string;
  subject?: string;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata: Record<string, unknown>;
}

/**
 * Notification storage record
 */
export interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
}

/**
 * Email delivery payload
 */
export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  metadata?: Record<string, unknown>;
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

/**
 * SMS delivery payload
 */
export interface SMSPayload {
  to: string;
  body: string;
  from?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Push notification payload
 */
export interface PushPayload {
  deviceTokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
  priority?: 'high' | 'normal';
  ttl?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Slack message payload
 */
export interface SlackPayload {
  webhookUrl: string;
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
  username?: string;
  iconEmoji?: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Slack block structure
 */
export interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  accessory?: unknown;
  elements?: unknown[];
}

/**
 * Slack attachment structure
 */
export interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: Array<{
    title: string;
    value: string;
    short?: boolean;
  }>;
  footer?: string;
  ts?: number;
}

/**
 * Delivery attempt record for retry logic
 */
export interface DeliveryAttempt {
  attemptNumber: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Queued delivery job
 */
export interface QueuedDelivery {
  id: string;
  userId: string;
  channel: DeliveryChannel;
  payload: EmailPayload | SMSPayload | PushPayload | SlackPayload;
  attempts: DeliveryAttempt[];
  maxAttempts: number;
  nextRetryAt?: Date;
  createdAt: Date;
  completedAt?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Delivery service configuration
 */
export interface DeliveryServiceConfig {
  maxRetries: number;
  retryDelayMs: number;
  retryBackoffMultiplier: number;
  timeout: number;
}

/**
 * Email service configuration
 */
export interface EmailServiceConfig extends DeliveryServiceConfig {
  provider: 'sendgrid' | 'ses' | 'smtp';
  apiKey?: string;
  fromAddress: string;
  fromName: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

/**
 * SMS service configuration
 */
export interface SMSServiceConfig extends DeliveryServiceConfig {
  provider: 'twilio' | 'sns';
  accountSid?: string;
  authToken?: string;
  fromNumber: string;
  awsRegion?: string;
}

/**
 * Push notification service configuration
 */
export interface PushServiceConfig extends DeliveryServiceConfig {
  provider: 'fcm' | 'apns';
  fcmServerKey?: string;
  apnsCertPath?: string;
  apnsKeyPath?: string;
  apnsTeamId?: string;
  apnsKeyId?: string;
  apnsBundleId?: string;
}

/**
 * Delivery statistics
 */
export interface DeliveryStats {
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  pendingDeliveries: number;
  averageRetries: number;
  byChannel: Record<DeliveryChannel, {
    total: number;
    successful: number;
    failed: number;
  }>;
}
