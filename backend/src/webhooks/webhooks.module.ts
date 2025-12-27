import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

/**
 * Webhooks Module
 * Outbound webhook delivery and subscription management
 * Features:
 * - Event webhook subscriptions
 * - Automatic retry with exponential backoff
 * - Webhook signature verification
 * - Delivery status tracking and logs
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
