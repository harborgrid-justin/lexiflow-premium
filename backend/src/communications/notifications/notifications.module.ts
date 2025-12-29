import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationTemplatesService } from './templates/notification-templates.service';
import {
  NotificationDeliveryService,
  EmailDeliveryService,
  SMSDeliveryService,
  PushNotificationService,
  NotificationQueueService,
} from './services';
import { Notification } from './entities/notification.entity';

/**
 * Notifications Module
 *
 * Provides comprehensive notification management functionality including:
 * - User notifications with preferences
 * - Multi-channel delivery (in-app, email, push, SMS, Slack)
 * - Template-based notification rendering
 * - Real-time WebSocket notifications
 * - Delivery tracking and analytics
 * - Retry logic and queue management
 * - Email, SMS, and Push notification services
 *
 * @module NotificationsModule
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
  ],
  controllers: [NotificationsController],
  providers: [
    // Core services
    NotificationsService,
    NotificationTemplatesService,
    NotificationDeliveryService,

    // Delivery channel services
    EmailDeliveryService,
    SMSDeliveryService,
    PushNotificationService,

    // Queue and retry management
    NotificationQueueService,
  ],
  exports: [
    // Export all services for use in other modules
    NotificationsService,
    NotificationTemplatesService,
    NotificationDeliveryService,
    EmailDeliveryService,
    SMSDeliveryService,
    PushNotificationService,
    NotificationQueueService,
  ],
})
export class NotificationsModule {}
