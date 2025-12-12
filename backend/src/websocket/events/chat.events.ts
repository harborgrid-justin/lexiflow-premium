/**
 * Chat Event Handlers
 * Real-time event handlers for chat/messaging operations
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebSocketService } from '../websocket.service';
import type { ChatMessageEvent } from './event-types';

/**
 * Chat Event Emitter
 * Handles broadcasting of chat-related events
 */
@Injectable()
export class ChatEventEmitter {
  private logger = new Logger('ChatEventEmitter');

  constructor(private websocketService: WebSocketService) {}

  /**
   * Send chat message to conversation
   */
  sendChatMessage(conversationId: string, message: ChatMessageEvent): void {
    this.logger.log(
      `Sending chat message ${message.id} to conversation ${conversationId}`,
    );
    this.websocketService.sendChatMessage(conversationId, message);
  }

  /**
   * Emit chat message updated event
   */
  emitChatMessageUpdated(data: {
    conversationId: string;
    messageId: string;
    changes: Record<string, any>;
  }): void {
    this.logger.log(`Emitting chat message updated: ${data.messageId}`);
    this.websocketService.broadcastChatMessageUpdated({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit chat message deleted event
   */
  emitChatMessageDeleted(data: {
    conversationId: string;
    messageId: string;
    deletedBy: string;
  }): void {
    this.logger.log(`Emitting chat message deleted: ${data.messageId}`);
    this.websocketService.broadcastChatMessageDeleted({
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit message read receipt
   */
  emitMessageRead(data: {
    conversationId: string;
    messageId: string;
    userId: string;
  }): void {
    this.websocketService.sendToConversation(
      data.conversationId,
      'chat:message:read',
      {
        ...data,
        readAt: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit typing indicator start
   */
  emitTypingStart(data: { conversationId: string; userId: string }): void {
    this.websocketService.sendToConversation(
      data.conversationId,
      'chat:typing:start',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit typing indicator stop
   */
  emitTypingStop(data: { conversationId: string; userId: string }): void {
    this.websocketService.sendToConversation(
      data.conversationId,
      'chat:typing:stop',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit user joined conversation
   */
  emitUserJoinedConversation(data: {
    conversationId: string;
    userId: string;
    userName: string;
  }): void {
    this.logger.log(
      `Emitting user joined conversation: ${data.userId} -> ${data.conversationId}`,
    );
    this.websocketService.sendToConversation(
      data.conversationId,
      'chat:user_joined',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit user left conversation
   */
  emitUserLeftConversation(data: {
    conversationId: string;
    userId: string;
    userName: string;
  }): void {
    this.logger.log(
      `Emitting user left conversation: ${data.userId} <- ${data.conversationId}`,
    );
    this.websocketService.sendToConversation(
      data.conversationId,
      'chat:user_left',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit conversation created event
   */
  emitConversationCreated(data: {
    conversationId: string;
    name: string;
    participants: string[];
    createdBy: string;
  }): void {
    this.logger.log(`Emitting conversation created: ${data.conversationId}`);

    // Notify all participants
    data.participants.forEach((userId) => {
      this.websocketService.sendToUser(userId, 'chat:conversation_created', {
        ...data,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Emit conversation updated event
   */
  emitConversationUpdated(data: {
    conversationId: string;
    changes: Record<string, any>;
    updatedBy: string;
  }): void {
    this.logger.log(`Emitting conversation updated: ${data.conversationId}`);
    this.websocketService.sendToConversation(
      data.conversationId,
      'chat:conversation_updated',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit message reaction added
   */
  emitMessageReactionAdded(data: {
    conversationId: string;
    messageId: string;
    userId: string;
    emoji: string;
  }): void {
    this.websocketService.sendToConversation(
      data.conversationId,
      'chat:reaction_added',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }

  /**
   * Emit message reaction removed
   */
  emitMessageReactionRemoved(data: {
    conversationId: string;
    messageId: string;
    userId: string;
    emoji: string;
  }): void {
    this.websocketService.sendToConversation(
      data.conversationId,
      'chat:reaction_removed',
      {
        ...data,
        timestamp: new Date().toISOString(),
      },
    );
  }
}
