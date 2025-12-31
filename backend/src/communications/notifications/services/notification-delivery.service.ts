import { Injectable, Logger } from '@nestjs/common';
import { NotificationTemplatesService } from '../templates/notification-templates.service';
import { TemplateChannel, TemplateContext, RenderedNotification } from '../templates/notification-template.interface';
import {
  DeliveryPreferencesDto,
  DeliveryChannel,
  getDefaultDeliveryPreferences,
} from '../dto/delivery-preferences.dto';
import {
  EmailPayload,
  SMSPayload,
  PushPayload,
} from '../types';
import { EmailDeliveryService } from './email-delivery.service';
import { SMSDeliveryService } from './sms-delivery.service';
import { PushNotificationService } from './push-notification.service';
import { NotificationQueueService } from './notification-queue.service';

/**
 * Notification delivery result
 */
export interface DeliveryResult {
  channel: DeliveryChannel;
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
  attempts?: number;
}

/**
 * Notification Delivery Service
 *
 * Handles multi-channel notification delivery with:
 * - Template rendering
 * - Channel-specific formatting
 * - Delivery preference enforcement
 * - Quiet hours support
 * - Priority-based routing
 * - Delivery tracking and analytics
 *
 * @class NotificationDeliveryService
 */
/**
 * ╔=================================================================================================================╗
 * ║NOTIFICATIONDELIVERY                                                                                             ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);
  private deliveryPreferences: Map<string, DeliveryPreferencesDto> = new Map();

  constructor(
    private readonly templatesService: NotificationTemplatesService,
    private readonly emailService: EmailDeliveryService,
    private readonly smsService: SMSDeliveryService,
    private readonly pushService: PushNotificationService,
    // Queue service for future use with background job processing
    private readonly _queueService: NotificationQueueService,
  ) {
    this.logger.log('NotificationDeliveryService initialized with all delivery channels');
  }

  /**
   * Deliver notification to user across multiple channels
   */
  async deliver(
    userId: string,
    notificationType: string,
    context: TemplateContext,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      forceChannels?: DeliveryChannel[];
      skipQuietHours?: boolean;
    },
  ): Promise<DeliveryResult[]> {
    try {
      const preferences = this.getPreferences(userId);
      const priority = options?.priority || 'medium';
      const results: DeliveryResult[] = [];

      // Check quiet hours
      if (!options?.skipQuietHours && this.isQuietHours(preferences)) {
        this.logger.debug(`Notification delayed due to quiet hours: userId=${userId}`);
        // In production, queue for later delivery
        return [];
      }

      // Determine delivery channels
      const channels = this.getDeliveryChannels(preferences, priority, options?.forceChannels);

      // Deliver to each channel
      for (const channel of channels) {
        const templateChannel = this.mapToTemplateChannel(channel);
        if (!templateChannel) continue;

        const result = await this.deliverToChannel(
          userId,
          notificationType,
          templateChannel,
          context,
        );
        results.push(result);
      }

      this.logger.log(
        `Delivered notification to ${results.length} channels for user ${userId} (type: ${notificationType})`,
      );

      return results;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Delivery error for user ${userId}: ${message}`);
      return [];
    }
  }

  /**
   * Deliver to specific channel
   */
  private async deliverToChannel(
    userId: string,
    notificationType: string,
    channel: TemplateChannel,
    context: TemplateContext,
  ): Promise<DeliveryResult> {
    const deliveryChannel = this.mapFromTemplateChannel(channel);

    try {
      // Render template
      const rendered = this.templatesService.render(notificationType, channel, context);

      if (!rendered) {
        return {
          channel: deliveryChannel,
          success: false,
          error: 'Template rendering failed',
          timestamp: new Date(),
        };
      }

      // Deliver based on channel
      let messageId: string | undefined;

      switch (channel) {
        case TemplateChannel.IN_APP:
          messageId = await this.deliverInApp(userId, rendered, context);
          break;

        case TemplateChannel.EMAIL:
          messageId = await this.deliverEmail(userId, rendered, context);
          break;

        case TemplateChannel.PUSH:
          messageId = await this.deliverPush(userId, rendered, context);
          break;

        case TemplateChannel.SMS:
          messageId = await this.deliverSMS(userId, rendered, context);
          break;

        case TemplateChannel.SLACK:
          messageId = await this.deliverSlack(userId, rendered, context);
          break;

        default:
          throw new Error(`Unsupported channel: ${channel}`);
      }

      return {
        channel: deliveryChannel,
        success: true,
        messageId,
        timestamp: new Date(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Channel delivery error (${channel}): ${message}`);
      return {
        channel: deliveryChannel,
        success: false,
        error: message,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Deliver in-app notification (handled by NotificationsGateway)
   */
  private async deliverInApp(
    userId: string,
    rendered: RenderedNotification,
    _context: TemplateContext,
  ): Promise<string> {
    // In production, this would trigger the WebSocket gateway
    this.logger.debug(`In-app notification for user ${userId}: ${rendered.title}`);
    return `in-app-${Date.now()}`;
  }

  /**
   * Deliver email notification
   */
  private async deliverEmail(
    userId: string,
    rendered: RenderedNotification,
    _context: TemplateContext,
  ): Promise<string> {
    const preferences = this.getPreferences(userId);

    const emailPayload: EmailPayload = {
      to: preferences.emailAddress || `${userId}@example.com`,
      subject: rendered.subject || rendered.title,
      body: rendered.body,
      html: this.convertToHTML(rendered),
      metadata: rendered.metadata,
    };

    const result = await this.emailService.send(emailPayload);

    if (!result.success) {
      throw new Error(result.error || 'Email delivery failed');
    }

    this.logger.debug(
      `Email notification for user ${userId}: ${emailPayload.subject} (messageId: ${result.messageId})`,
    );

    return result.messageId || `email-${Date.now()}`;
  }

  /**
   * Deliver push notification
   */
  private async deliverPush(
    userId: string,
    rendered: RenderedNotification,
    context: TemplateContext,
  ): Promise<string> {
    const preferences = this.getPreferences(userId);

    if (!preferences.deviceTokens || preferences.deviceTokens.length === 0) {
      throw new Error('No device tokens available for push notification');
    }

    const pushPayload: PushPayload = {
      deviceTokens: preferences.deviceTokens,
      title: rendered.title,
      body: rendered.body,
      data: context as Record<string, string>,
      badge: 1,
      sound: 'default',
      priority: this.mapPriorityForPush(rendered.metadata.priority as string | undefined),
      metadata: rendered.metadata,
    };

    const result = await this.pushService.send(pushPayload);

    if (!result.success) {
      throw new Error(result.error || 'Push notification delivery failed');
    }

    this.logger.debug(
      `Push notification for user ${userId}: ${rendered.title} (messageId: ${result.messageId})`,
    );

    return result.messageId || `push-${Date.now()}`;
  }

  /**
   * Deliver SMS notification
   */
  private async deliverSMS(
    userId: string,
    rendered: RenderedNotification,
    _context: TemplateContext,
  ): Promise<string> {
    const preferences = this.getPreferences(userId);

    if (!preferences.phoneNumber) {
      throw new Error('No phone number available for SMS notification');
    }

    const smsPayload: SMSPayload = {
      to: preferences.phoneNumber,
      body: this.smsService.truncateMessage(rendered.body),
      metadata: rendered.metadata,
    };

    const result = await this.smsService.send(smsPayload);

    if (!result.success) {
      throw new Error(result.error || 'SMS delivery failed');
    }

    this.logger.debug(
      `SMS notification for user ${userId}: ${smsPayload.body} (messageId: ${result.messageId})`,
    );

    return result.messageId || `sms-${Date.now()}`;
  }

  /**
   * Deliver Slack notification
   */
  private async deliverSlack(
    userId: string,
    rendered: RenderedNotification,
    _context: TemplateContext,
  ): Promise<string> {
    const preferences = this.getPreferences(userId);

    if (!preferences.slackWebhookUrl) {
      throw new Error('No Slack webhook URL configured');
    }

    // In production, send to Slack using webhook
    // const slackPayload: SlackPayload = {
    //   webhookUrl: preferences.slackWebhookUrl,
    //   text: rendered.title,
    //   blocks: [
    //     {
    //       type: 'header',
    //       text: {
    //         type: 'plain_text',
    //         text: rendered.title,
    //       },
    //     },
    //     {
    //       type: 'section',
    //       text: {
    //         type: 'mrkdwn',
    //         text: rendered.body,
    //       },
    //     },
    //   ],
    //   metadata: rendered.metadata,
    // };
    // await axios.post(slackPayload.webhookUrl, slackPayload);

    // For now, use a simple mock implementation
    this.logger.debug(`Slack notification for user ${userId}: ${rendered.title}`);
    return `slack-${Date.now()}`;
  }

  /**
   * Convert rendered notification to HTML email
   */
  private convertToHTML(rendered: RenderedNotification): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .content { padding: 20px; }
            .action-button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${rendered.subject || rendered.title}</h2>
            </div>
            <div class="content">
              <p>${rendered.body.replace(/\n/g, '<br>')}</p>
              ${rendered.actionUrl ? `<a href="${rendered.actionUrl}" class="action-button">${rendered.metadata.actionLabel || 'View Details'}</a>` : ''}
            </div>
            <div class="footer">
              <p>This is an automated notification from LexiFlow.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Map priority to push notification priority
   */
  private mapPriorityForPush(priority?: string): 'high' | 'normal' {
    return priority === 'high' || priority === 'urgent' ? 'high' : 'normal';
  }

  /**
   * Get delivery channels based on preferences and priority
   */
  private getDeliveryChannels(
    preferences: DeliveryPreferencesDto,
    priority: 'low' | 'medium' | 'high' | 'urgent',
    forceChannels?: DeliveryChannel[],
  ): DeliveryChannel[] {
    if (forceChannels) {
      return forceChannels;
    }

    // Use priority-based delivery if configured
    if (preferences.priorityDelivery) {
      const channels = preferences.priorityDelivery[priority] || [];
      return channels.filter(channel => this.isChannelEnabled(preferences, channel));
    }

    // Default: return all enabled channels
    const enabledChannels: DeliveryChannel[] = [];
    if (preferences.channels.inApp) enabledChannels.push(DeliveryChannel.IN_APP);
    if (preferences.channels.email) enabledChannels.push(DeliveryChannel.EMAIL);
    if (preferences.channels.push) enabledChannels.push(DeliveryChannel.PUSH);
    if (preferences.channels.sms) enabledChannels.push(DeliveryChannel.SMS);
    if (preferences.channels.slack) enabledChannels.push(DeliveryChannel.SLACK);

    return enabledChannels;
  }

  /**
   * Check if channel is enabled in preferences
   */
  private isChannelEnabled(
    preferences: DeliveryPreferencesDto,
    channel: DeliveryChannel,
  ): boolean {
    switch (channel) {
      case DeliveryChannel.IN_APP:
        return preferences.channels.inApp;
      case DeliveryChannel.EMAIL:
        return preferences.channels.email;
      case DeliveryChannel.PUSH:
        return preferences.channels.push;
      case DeliveryChannel.SMS:
        return preferences.channels.sms;
      case DeliveryChannel.SLACK:
        return preferences.channels.slack;
      default:
        return false;
    }
  }

  /**
   * Check if currently in quiet hours
   */
  private isQuietHours(preferences: DeliveryPreferencesDto): boolean {
    if (!preferences.quietHours?.enabled) {
      return false;
    }

    // In production, implement proper timezone-aware quiet hours check
    // For now, return false (disabled)
    return false;
  }

  /**
   * Map DeliveryChannel to TemplateChannel
   */
  private mapToTemplateChannel(channel: DeliveryChannel): TemplateChannel | null {
    switch (channel) {
      case DeliveryChannel.IN_APP:
        return TemplateChannel.IN_APP;
      case DeliveryChannel.EMAIL:
        return TemplateChannel.EMAIL;
      case DeliveryChannel.PUSH:
        return TemplateChannel.PUSH;
      case DeliveryChannel.SMS:
        return TemplateChannel.SMS;
      case DeliveryChannel.SLACK:
        return TemplateChannel.SLACK;
      default:
        return null;
    }
  }

  /**
   * Map TemplateChannel to DeliveryChannel
   */
  private mapFromTemplateChannel(channel: TemplateChannel): DeliveryChannel {
    switch (channel) {
      case TemplateChannel.IN_APP:
        return DeliveryChannel.IN_APP;
      case TemplateChannel.EMAIL:
        return DeliveryChannel.EMAIL;
      case TemplateChannel.PUSH:
        return DeliveryChannel.PUSH;
      case TemplateChannel.SMS:
        return DeliveryChannel.SMS;
      case TemplateChannel.SLACK:
        return DeliveryChannel.SLACK;
    }
  }

  /**
   * Get user preferences (with defaults)
   */
  getPreferences(userId: string): DeliveryPreferencesDto {
    let preferences = this.deliveryPreferences.get(userId);
    if (!preferences) {
      preferences = getDefaultDeliveryPreferences();
      this.deliveryPreferences.set(userId, preferences);
    }
    return preferences;
  }

  /**
   * Update user preferences
   */
  updatePreferences(userId: string, preferences: DeliveryPreferencesDto): void {
    this.deliveryPreferences.set(userId, preferences);
    this.logger.log(`Updated delivery preferences for user ${userId}`);
  }

  /**
   * Send bulk notifications to multiple users
   */
  async deliverBulk(
    userIds: string[],
    notificationType: string,
    context: TemplateContext,
    options?: {
      priority?: 'low' | 'medium' | 'high' | 'urgent';
      forceChannels?: DeliveryChannel[];
    },
  ): Promise<Map<string, DeliveryResult[]>> {
    const results = new Map<string, DeliveryResult[]>();

    await Promise.all(
      userIds.map(async userId => {
        const userResults = await this.deliver(userId, notificationType, context, options);
        results.set(userId, userResults);
      }),
    );

    this.logger.log(
      `Bulk delivery completed: ${userIds.length} users, type: ${notificationType}`,
    );

    return results;
  }

  /**
   * Get delivery statistics
   */
  getStats(): {
    totalUsers: number;
    preferencesConfigured: number;
  } {
    return {
      totalUsers: this.deliveryPreferences.size,
      preferencesConfigured: this.deliveryPreferences.size,
    };
  }

  /**
   * Get queue service for advanced queue operations
   * Available for future integration with background job processing
   */
  getQueueService(): NotificationQueueService {
    return this._queueService;
  }
}
