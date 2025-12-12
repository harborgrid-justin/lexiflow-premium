import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';

/**
 * Messaging Module
 *
 * Provides secure real-time messaging functionality
 * Includes REST API endpoints and WebSocket gateway
 *
 * @module MessagingModule
 */
@Module({
  imports: [
    // TypeORM entities will be imported here once created by Agent 1
    // TypeOrmModule.forFeature([Conversation, Message, Attachment]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
