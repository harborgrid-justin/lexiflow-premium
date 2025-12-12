import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

/**
 * Notifications Module
 *
 * Provides notification management functionality
 * Includes user preferences and notification delivery
 *
 * @module NotificationsModule
 */
@Module({
  imports: [
    // TypeORM entities will be imported here once created by Agent 1
    // TypeOrmModule.forFeature([SystemNotification, NotificationPreference]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
