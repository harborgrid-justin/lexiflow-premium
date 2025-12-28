import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingGateway } from './messaging.gateway';

/**
 * Messaging Module
 *
 * Provides secure real-time messaging functionality
 * Includes REST API endpoints and WebSocket gateway
 * WebSocket connections are secured with JWT authentication
 *
 * @module MessagingModule
 */
@Module({
  imports: [
    ConfigModule,
    // JWT available globally from AuthModule
    // TypeORM entities will be imported here once created by Agent 1
    // TypeOrmModule.forFeature([Conversation, Message, Attachment]),
  ],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService, MessagingGateway],
})
export class MessagingModule {}
