import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { verify } from 'jsonwebtoken';
import { WS_EVENTS, WS_ROOMS } from './events/event-types';
import type {
  CaseCreatedEvent,
  CaseUpdatedEvent,
  DocumentUploadedEvent,
  DocumentUpdatedEvent,
  NotificationEvent,
  UserPresenceEvent,
  ChatMessageEvent,
} from './events/event-types';

/**
 * Main WebSocket Gateway
 * Handles all real-time communication for LexiFlow AI Legal Suite
 *
 * Features:
 * - JWT Authentication
 * - Room-based subscriptions
 * - Event acknowledgments
 * - Automatic reconnection
 * - Presence tracking
 * - Message queuing
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocketGateway');
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private socketUsers = new Map<string, string>(); // socketId -> userId
  private socketRooms = new Map<string, Set<string>>(); // socketId -> Set<roomId>
  private typingUsers = new Map<string, Map<string, NodeJS.Timeout>>(); // contextId -> Map<userId, timeout>

  /**
   * Initialize WebSocket server
   */
  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway initialized');
    this.logger.log(`📡 Listening on namespace: /`);
  }

  /**
   * Handle client connection with authentication
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`🔌 Client attempting connection: ${client.id}`);

      // Authenticate socket
      const userId = await this.authenticateSocket(client);

      if (!userId) {
        this.logger.warn(`❌ Unauthenticated connection: ${client.id}`);
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Store socket mapping
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId).add(client.id);
      this.socketUsers.set(client.id, userId);
      this.socketRooms.set(client.id, new Set());

      this.logger.log(`✅ Client authenticated: ${client.id} (User: ${userId})`);

      // Send authentication success
      client.emit(WS_EVENTS.CONNECTION_AUTHENTICATED, {
        userId,
        timestamp: new Date().toISOString(),
      });

      // Join user's personal room
      client.join(WS_ROOMS.user(userId));

      // Broadcast presence update
      const isFirstConnection = this.userSockets.get(userId).size === 1;
      if (isFirstConnection) {
        this.broadcastPresence(userId, 'online');
      }

      // Send presence snapshot
      this.sendPresenceSnapshot(client);
    } catch (error) {
      this.logger.error(`❌ Connection error: ${error.message}`);
      client.emit(WS_EVENTS.CONNECTION_ERROR, { message: 'Connection failed' });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 Client disconnected: ${client.id}`);

    const userId = this.socketUsers.get(client.id);

    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);

        // Broadcast offline status if no more connections
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          this.broadcastPresence(userId, 'offline');
        }
      }

      this.socketUsers.delete(client.id);
    }

    // Cleanup rooms
    this.socketRooms.delete(client.id);

    // Cleanup typing indicators
    this.cleanupTypingForUser(userId);
  }

  // ==================== CASE EVENTS ====================

  /**
   * Subscribe to case:subscribe event
   * Client subscribes to case updates
   */
  @SubscribeMessage('case:subscribe')
  handleCaseSubscribe(
    @MessageBody() data: { caseId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = WS_ROOMS.case(data.caseId);
    client.join(roomName);
    this.addRoomToSocket(client.id, roomName);

    this.logger.log(`Client ${client.id} subscribed to case ${data.caseId}`);
    return { success: true, caseId: data.caseId };
  }

  /**
   * Subscribe to case:unsubscribe event
   */
  @SubscribeMessage('case:unsubscribe')
  handleCaseUnsubscribe(
    @MessageBody() data: { caseId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = WS_ROOMS.case(data.caseId);
    client.leave(roomName);
    this.removeRoomFromSocket(client.id, roomName);

    this.logger.log(`Client ${client.id} unsubscribed from case ${data.caseId}`);
    return { success: true, caseId: data.caseId };
  }

  // ==================== DOCUMENT EVENTS ====================

  /**
   * Subscribe to document:subscribe event
   */
  @SubscribeMessage('document:subscribe')
  handleDocumentSubscribe(
    @MessageBody() data: { documentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = WS_ROOMS.document(data.documentId);
    client.join(roomName);
    this.addRoomToSocket(client.id, roomName);

    this.logger.log(`Client ${client.id} subscribed to document ${data.documentId}`);
    return { success: true, documentId: data.documentId };
  }

  /**
   * Subscribe to document:unsubscribe event
   */
  @SubscribeMessage('document:unsubscribe')
  handleDocumentUnsubscribe(
    @MessageBody() data: { documentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = WS_ROOMS.document(data.documentId);
    client.leave(roomName);
    this.removeRoomFromSocket(client.id, roomName);

    this.logger.log(`Client ${client.id} unsubscribed from document ${data.documentId}`);
    return { success: true, documentId: data.documentId };
  }

  // ==================== PRESENCE EVENTS ====================

  /**
   * Subscribe to presence:status_change event
   */
  @SubscribeMessage('presence:status_change')
  handlePresenceStatusChange(
    @MessageBody() data: { status: 'online' | 'away' | 'busy' },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      throw new WsException('User not authenticated');
    }

    this.broadcastPresence(userId, data.status);
    return { success: true, status: data.status };
  }

  /**
   * Subscribe to presence:typing event
   */
  @SubscribeMessage('presence:typing')
  handleTyping(
    @MessageBody()
    data: {
      contextId: string;
      contextType: 'conversation' | 'document' | 'comment';
      isTyping: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      throw new WsException('User not authenticated');
    }

    const event = data.isTyping
      ? WS_EVENTS.USER_TYPING
      : WS_EVENTS.USER_TYPING.replace('typing', 'typing_stop');

    // Broadcast to context room
    const roomName =
      data.contextType === 'conversation'
        ? WS_ROOMS.conversation(data.contextId)
        : WS_ROOMS.document(data.contextId);

    client.to(roomName).emit(event, {
      userId,
      contextId: data.contextId,
      contextType: data.contextType,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString(),
    });

    // Manage typing timeout
    this.manageTypingIndicator(data.contextId, userId, data.isTyping);

    return { success: true };
  }

  // ==================== CHAT EVENTS ====================

  /**
   * Subscribe to chat:join event
   */
  @SubscribeMessage('chat:join')
  handleChatJoin(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = WS_ROOMS.conversation(data.conversationId);
    client.join(roomName);
    this.addRoomToSocket(client.id, roomName);

    const userId = this.socketUsers.get(client.id);
    this.logger.log(
      `User ${userId} joined conversation ${data.conversationId}`,
    );

    return { success: true, conversationId: data.conversationId };
  }

  /**
   * Subscribe to chat:leave event
   */
  @SubscribeMessage('chat:leave')
  handleChatLeave(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomName = WS_ROOMS.conversation(data.conversationId);
    client.leave(roomName);
    this.removeRoomFromSocket(client.id, roomName);

    const userId = this.socketUsers.get(client.id);
    this.logger.log(
      `User ${userId} left conversation ${data.conversationId}`,
    );

    return { success: true, conversationId: data.conversationId };
  }

  /**
   * Subscribe to chat:message:send event
   */
  @SubscribeMessage('chat:message:send')
  handleChatMessage(
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      attachments?: any[];
      replyToId?: string;
      metadata?: Record<string, any>;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      throw new WsException('User not authenticated');
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message: ChatMessageEvent = {
      id: messageId,
      conversationId: data.conversationId,
      senderId: userId,
      content: data.content,
      attachments: data.attachments || [],
      replyToId: data.replyToId,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
    };

    // Broadcast to conversation
    const roomName = WS_ROOMS.conversation(data.conversationId);
    this.server.to(roomName).emit(WS_EVENTS.CHAT_MESSAGE_NEW, message);

    // Confirm to sender
    client.emit('chat:message:sent', {
      tempId: data.metadata?.tempId,
      messageId,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Message ${messageId} sent in conversation ${data.conversationId}`,
    );

    return { success: true, messageId };
  }

  /**
   * Subscribe to chat:message:read event
   */
  @SubscribeMessage('chat:message:read')
  handleChatMessageRead(
    @MessageBody()
    data: { conversationId: string; messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      throw new WsException('User not authenticated');
    }

    const roomName = WS_ROOMS.conversation(data.conversationId);
    this.server.to(roomName).emit(WS_EVENTS.CHAT_MESSAGE_READ, {
      messageId: data.messageId,
      conversationId: data.conversationId,
      userId,
      readAt: new Date().toISOString(),
    });

    return { success: true };
  }

  // ==================== NOTIFICATION EVENTS ====================

  /**
   * Subscribe to notification:mark_read event
   */
  @SubscribeMessage('notification:mark_read')
  handleNotificationMarkRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);
    if (!userId) {
      throw new WsException('User not authenticated');
    }

    // Broadcast to all user's devices
    this.server.to(WS_ROOMS.user(userId)).emit(WS_EVENTS.NOTIFICATION_READ, {
      notificationId: data.notificationId,
      readAt: new Date().toISOString(),
    });

    return { success: true };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Authenticate socket connection
   */
  private async authenticateSocket(client: Socket): Promise<string | null> {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        // Development mode: allow userId from query
        const userId = client.handshake.query?.userId as string;
        if (userId && process.env.NODE_ENV === 'development') {
          this.logger.warn(`⚠️ Dev mode: Using userId from query: ${userId}`);
          return userId;
        }
        return null;
      }

      // Verify JWT token
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = verify(token, secret) as { sub: string; userId: string };

      return decoded.sub || decoded.userId;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      return null;
    }
  }

  /**
   * Broadcast presence update
   */
  private broadcastPresence(
    userId: string,
    status: 'online' | 'offline' | 'away' | 'busy',
  ) {
    const presenceEvent: UserPresenceEvent = {
      userId,
      status,
      lastSeen: status === 'offline' ? new Date().toISOString() : undefined,
      timestamp: new Date().toISOString(),
    };

    this.server.emit(WS_EVENTS.PRESENCE_UPDATE, presenceEvent);
  }

  /**
   * Send presence snapshot to client
   */
  private sendPresenceSnapshot(client: Socket) {
    const onlineUsers = Array.from(this.userSockets.keys());

    client.emit(WS_EVENTS.PRESENCE_SNAPSHOT, {
      users: onlineUsers.map((userId) => ({
        userId,
        status: 'online',
        timestamp: new Date().toISOString(),
      })),
    });
  }

  /**
   * Manage typing indicator timeout
   */
  private manageTypingIndicator(
    contextId: string,
    userId: string,
    isTyping: boolean,
  ) {
    if (!this.typingUsers.has(contextId)) {
      this.typingUsers.set(contextId, new Map());
    }

    const contextTyping = this.typingUsers.get(contextId);

    if (isTyping) {
      // Clear existing timeout
      const existingTimeout = contextTyping.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Set new timeout to auto-stop typing after 5 seconds
      const timeout = setTimeout(() => {
        contextTyping.delete(userId);
      }, 5000);

      contextTyping.set(userId, timeout);
    } else {
      // Clear timeout
      const existingTimeout = contextTyping.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      contextTyping.delete(userId);
    }
  }

  /**
   * Cleanup typing indicators for user
   */
  private cleanupTypingForUser(userId: string) {
    this.typingUsers.forEach((contextMap, contextId) => {
      const timeout = contextMap.get(userId);
      if (timeout) {
        clearTimeout(timeout);
        contextMap.delete(userId);
      }
    });
  }

  /**
   * Add room to socket tracking
   */
  private addRoomToSocket(socketId: string, roomName: string) {
    const rooms = this.socketRooms.get(socketId);
    if (rooms) {
      rooms.add(roomName);
    }
  }

  /**
   * Remove room from socket tracking
   */
  private removeRoomFromSocket(socketId: string, roomName: string) {
    const rooms = this.socketRooms.get(socketId);
    if (rooms) {
      rooms.delete(roomName);
    }
  }

  // ==================== PUBLIC API FOR SERVICES ====================

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  /**
   * Send event to specific user (all devices)
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(WS_ROOMS.user(userId)).emit(event, data);
  }

  /**
   * Send event to case room
   */
  sendToCase(caseId: string, event: string, data: any) {
    this.server.to(WS_ROOMS.case(caseId)).emit(event, data);
  }

  /**
   * Send event to document room
   */
  sendToDocument(documentId: string, event: string, data: any) {
    this.server.to(WS_ROOMS.document(documentId)).emit(event, data);
  }

  /**
   * Send event to conversation room
   */
  sendToConversation(conversationId: string, event: string, data: any) {
    this.server.to(WS_ROOMS.conversation(conversationId)).emit(event, data);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
