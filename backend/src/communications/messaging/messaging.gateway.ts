import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';

/**
 * Messaging WebSocket Gateway
 *
 * Handles real-time messaging events:
 * - message:new - New message received
 * - message:read - Message read receipt
 * - typing:start - User started typing
 * - typing:stop - User stopped typing
 * - presence:update - User presence change
 *
 * @class MessagingGateway
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure properly in production
    credentials: true,
  },
  namespace: '/messaging',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger('MessagingGateway');
  private userSockets = new Map<string, string>(); // userId -> socketId
  private socketUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      // Extract user ID from authentication
      const userId = await this.extractUserIdFromSocket(client);

      if (userId) {
        this.userSockets.set(userId, client.id);
        this.socketUsers.set(client.id, userId);

        this.logger.log(`Client connected: ${client.id} (User: ${userId})`);

        // Broadcast presence update
        this.broadcastPresenceUpdate(userId, 'online');
      } else {
        // Disconnect if authentication fails
        this.logger.warn(`Client ${client.id} failed authentication`);
        client.disconnect();
      }
    } catch (error) {
      const _message = error instanceof Error ? error._message : 'Unknown error';
      const _stack = error instanceof Error ? error._stack : undefined;
      this.logger.error(`Connection error for client ${client.id}:`, error);
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
      this.userSockets.delete(userId);
      this.socketUsers.delete(client.id);

      // Broadcast presence update
      this.broadcastPresenceUpdate(userId, 'offline');
    }
  }

  /**
   * Subscribe to message:send event
   * Client sends a message
   */
  @SubscribeMessage('message:send')
  handleMessageSend(
    @MessageBody() data: { conversationId: string; content: string; attachments?: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    this.logger.log(`Message sent by ${userId} to conversation ${data.conversationId}`);

    // Broadcast to conversation participants
    this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
      id: 'msg-' + Date.now(),
      conversationId: data.conversationId,
      content: data.content,
      senderId: userId,
      attachments: data.attachments || [],
      createdAt: new Date().toISOString(),
    });

    return { success: true };
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
   * Extract and validate user ID from socket handshake
   * Supports both Authorization header and token query parameter
   *
   * @param client Socket connection
   * @returns userId if valid, null otherwise
   */
  private async extractUserIdFromSocket(client: Socket): Promise<string | null> {
    try {
      // Try to extract token from Authorization header first
      let token: string | null = null;

      const authHeader = client.handshake.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // Fallback to query parameter (less secure but common for WebSocket)
      if (!token && client.handshake.query.token) {
        token = client.handshake.query.token as string;
      }

      if (!token) {
        this.logger.warn('No authentication token provided in WebSocket handshake');
        return null;
      }

      // Verify JWT token
      const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'your-secret-key';
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtSecret,
      });

      // Verify token type is access token
      if (payload.type !== 'access') {
        this.logger.warn(`Invalid token type for WebSocket: ${payload.type}`);
        return null;
      }

      return payload.sub;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const _stack = error instanceof Error ? error._stack : undefined;
      this.logger.error('JWT verification failed for WebSocket connection:', message);
      return null;
    }
  }

  /**
   * Send notification to specific user
   */
  sendToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit(event, data);
    }
  }
}
