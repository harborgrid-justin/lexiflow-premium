import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

// Entities
import { Communication } from "./entities/communication.entity";
import { Template } from "./entities/template.entity";

// Main service
import { CommunicationsController } from "./communications.controller";
import { CommunicationsService } from "./communications.service";

import { CorrespondenceModule } from "./correspondence/correspondence.module";
import { EmailModule } from "./email/email.module";
import { MessagingModule } from "./messaging/messaging.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { ServiceJobsModule } from "./service-jobs/service-jobs.module";

/**
 * Communications Module
 *
 * Centralized communications hub for LexiFlow Enterprise
 * Handles:
 * - Real-time messaging via WebSocket
 * - System and user notifications
 * - Legal correspondence management
 * - Service of process tracking
 * - Email integration and templates
 *
 * @module CommunicationsModule
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Communication, Template]),
    MessagingModule,
    NotificationsModule,
    CorrespondenceModule,
    ServiceJobsModule,
    EmailModule,
  ],
  controllers: [CommunicationsController],
  providers: [CommunicationsService],
  exports: [
    CommunicationsService,
    MessagingModule,
    NotificationsModule,
    CorrespondenceModule,
    ServiceJobsModule,
    EmailModule,
  ],
})
export class CommunicationsModule {}
