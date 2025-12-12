import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';

/**
 * Notifications Module
 *
 * Provides notification management functionality
 * Includes user preferences, notification delivery, and real-time WebSocket notifications
 *
 * @module NotificationsModule
 */
@Module({
  imports: [
    // TypeORM entities will be imported here once created by Agent 1
    // TypeOrmModule.forFeature([SystemNotification, NotificationPreference]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
