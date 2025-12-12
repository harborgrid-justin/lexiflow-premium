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

/**
 * Messaging WebSocket Gateway
 *
 * Handles real-time messaging events:
 * - message:new - New message received
 * - message:read - Message read receipt
 * - message:delivered - Message delivered receipt
 * - typing:start - User started typing
 * - typing:stop - User stopped typing
 * - presence:update - User presence change
 * - file:upload:start - File upload initiated
 * - file:upload:progress - File upload progress
 * - file:upload:complete - File upload completed
 * - file:download:start - File download initiated
 * - connection:authenticated - Connection authenticated successfully
 *
 * @class MessagingGateway
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*', // Configure properly in production
    credentials: true,
  },
  namespace: '/messaging',
  transports: ['websocket', 'polling'],
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('MessagingGateway');
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId> (multiple devices)
  private socketUsers = new Map<string, string>(); // socketId -> userId
  private typingUsers = new Map<string, Set<string>>(); // conversationId -> Set<userId>

  /**
   * Initialize WebSocket server
   */
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  /**
   * Handle client connection with authentication
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting connection: ${client.id}`);

      // Extract and verify authentication token
      const userId = await this.authenticateSocket(client);

      if (!userId) {
        this.logger.warn(`Unauthenticated connection attempt: ${client.id}`);
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

      this.logger.log(`Client authenticated: ${client.id} (User: ${userId})`);

      // Send authentication success
      client.emit('connection:authenticated', {
        userId,
        timestamp: new Date().toISOString(),
      });

      // Broadcast presence update (only if first connection for this user)
      if (this.userSockets.get(userId).size === 1) {
        this.broadcastPresenceUpdate(userId, 'online');
      }

      // Send presence status of all users to the newly connected client
      this.sendPresenceSnapshot(client, userId);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const userId = this.socketUsers.get(client.id);

    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);

        // Only broadcast offline if no more sockets for this user
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
          this.broadcastPresenceUpdate(userId, 'offline');
        }
      }

      this.socketUsers.delete(client.id);

      // Clean up typing indicators
      this.cleanupTypingIndicators(userId);
    }
  }

  /**
   * Subscribe to message:send event
   * Client sends a message
   */
  @SubscribeMessage('message:send')
  handleMessageSend(
    @MessageBody()
    data: {
      conversationId: string;
      content: string;
      attachments?: Array<{ id: string; name: string; size: number; type: string; url: string }>;
      replyToId?: string;
      metadata?: Record<string, any>;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    this.logger.log(`Message sent by ${userId} to conversation ${data.conversationId}`);

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      conversationId: data.conversationId,
      content: data.content,
      senderId: userId,
      attachments: data.attachments || [],
      replyToId: data.replyToId,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      delivered: false,
      read: false,
    };

    // Broadcast to conversation participants (excluding sender)
    client.to(`conversation:${data.conversationId}`).emit('message:new', message);

    // Send delivery confirmation to sender
    client.emit('message:sent', {
      tempId: data.metadata?.tempId,
      messageId,
      timestamp: new Date().toISOString(),
    });

    // Broadcast delivery receipts to all conversation participants
    this.broadcastDeliveryReceipt(data.conversationId, messageId, userId);

    // Stop typing indicator for sender
    this.removeTypingIndicator(data.conversationId, userId);

    return { success: true, messageId };
  }

  /**
   * Subscribe to message:read event
   * Mark message as read
   */
  @SubscribeMessage('message:read')
  handleMessageRead(
    @MessageBody() data: { messageId: string; conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    // Broadcast read receipt to conversation
    this.server.to(`conversation:${data.conversationId}`).emit('message:read', {
      messageId: data.messageId,
      userId,
      readAt: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Subscribe to typing:start event
   * User started typing
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    // Broadcast typing indicator to others in conversation
    client.to(`conversation:${data.conversationId}`).emit('typing:start', {
      conversationId: data.conversationId,
      userId,
    });

    return { success: true };
  }

  /**
   * Subscribe to typing:stop event
   * User stopped typing
   */
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    // Broadcast typing stop to others in conversation
    client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
      conversationId: data.conversationId,
      userId,
    });

    return { success: true };
  }

  /**
   * Subscribe to conversation:join event
   * Join a conversation room
   */
  @SubscribeMessage('conversation:join')
  handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation:${data.conversationId}`);
    this.logger.log(`Client ${client.id} joined conversation ${data.conversationId}`);

    return { success: true, conversationId: data.conversationId };
  }

  /**
   * Subscribe to conversation:leave event
   * Leave a conversation room
   */
  @SubscribeMessage('conversation:leave')
  handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation:${data.conversationId}`);
    this.logger.log(`Client ${client.id} left conversation ${data.conversationId}`);

    return { success: true, conversationId: data.conversationId };
  }

  /**
   * Emit a new message to conversation participants
   * Called by MessagingService
   */
  emitNewMessage(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:new', message);
  }

  /**
   * Emit read receipt
   * Called by MessagingService
   */
  emitReadReceipt(conversationId: string, messageId: string, userId: string) {
    this.server.to(`conversation:${conversationId}`).emit('message:read', {
      messageId,
      userId,
      readAt: new Date().toISOString(),
    });
  }

  /**
   * Broadcast presence update
   */
  private broadcastPresenceUpdate(userId: string, status: 'online' | 'offline') {
    this.server.emit('presence:update', {
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Subscribe to file:upload:start event
   * Notify conversation participants that a file upload is starting
   */
  @SubscribeMessage('file:upload:start')
  handleFileUploadStart(
    @MessageBody() data: { conversationId: string; fileName: string; fileSize: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    // Notify conversation participants
    client.to(`conversation:${data.conversationId}`).emit('file:upload:start', {
      conversationId: data.conversationId,
      userId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Subscribe to file:upload:progress event
   * Broadcast file upload progress
   */
  @SubscribeMessage('file:upload:progress')
  handleFileUploadProgress(
    @MessageBody()
    data: { conversationId: string; fileId: string; progress: number },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    // Broadcast progress to conversation
    client.to(`conversation:${data.conversationId}`).emit('file:upload:progress', {
      conversationId: data.conversationId,
      userId,
      fileId: data.fileId,
      progress: data.progress,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Subscribe to file:upload:complete event
   * Notify conversation that file upload is complete
   */
  @SubscribeMessage('file:upload:complete')
  handleFileUploadComplete(
    @MessageBody()
    data: {
      conversationId: string;
      fileId: string;
      fileName: string;
      fileSize: number;
      fileUrl: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    // Notify conversation participants
    this.server.to(`conversation:${data.conversationId}`).emit('file:upload:complete', {
      conversationId: data.conversationId,
      userId,
      fileId: data.fileId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      fileUrl: data.fileUrl,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Authenticate socket connection
   * Extracts and verifies JWT token from handshake
   */
  private async authenticateSocket(client: Socket): Promise<string | null> {
    try {
      // Extract token from query parameters or auth header
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        // For development, allow userId from query
        const userId = client.handshake.query?.userId as string;
        if (userId) {
          this.logger.warn(`Development mode: Using userId from query: ${userId}`);
          return userId;
        }
        return null;
      }

      // Verify JWT token (integrate with auth service in production)
      const secret = process.env.JWT_SECRET || 'your-secret-key';
      const decoded = verify(token, secret) as { sub: string; userId: string };

      return decoded.sub || decoded.userId;
    } catch (error) {
      this.logger.error(`Authentication error: ${error.message}`);
      return null;
    }
  }

  /**
   * Send presence snapshot to newly connected client
   */
  private sendPresenceSnapshot(client: Socket, userId: string) {
    const onlineUsers = Array.from(this.userSockets.keys()).filter((uid) => uid !== userId);

    client.emit('presence:snapshot', {
      users: onlineUsers.map((uid) => ({
        userId: uid,
        status: 'online',
        timestamp: new Date().toISOString(),
      })),
    });
  }

  /**
   * Clean up typing indicators for a user
   */
  private cleanupTypingIndicators(userId: string) {
    this.typingUsers.forEach((users, conversationId) => {
      if (users.has(userId)) {
        users.delete(userId);
        // Broadcast typing stop
        this.server.to(`conversation:${conversationId}`).emit('typing:stop', {
          conversationId,
          userId,
        });
      }
    });
  }

  /**
   * Remove typing indicator for a user in a conversation
   */
  private removeTypingIndicator(conversationId: string, userId: string) {
    const users = this.typingUsers.get(conversationId);
    if (users && users.has(userId)) {
      users.delete(userId);
      this.server.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId,
      });
    }
  }

  /**
   * Broadcast delivery receipt
   */
  private broadcastDeliveryReceipt(
    conversationId: string,
    messageId: string,
    senderId: string,
  ) {
    this.server.to(`conversation:${conversationId}`).emit('message:delivered', {
      messageId,
      conversationId,
      senderId,
      deliveredAt: new Date().toISOString(),
    });
  }

  /**
   * Send notification to specific user (all their devices)
   */
  sendToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  /**
   * Get online status of a user
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
}
