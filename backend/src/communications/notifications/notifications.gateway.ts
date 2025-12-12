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
import { Logger } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

/**
 * Notifications WebSocket Gateway
 *
 * Handles real-time notification events:
 * - notification:new - New notification received
 * - notification:read - Notification marked as read
 * - notification:deleted - Notification deleted
 * - notification:count - Unread notification count updated
 * - notification:preferences:updated - User preferences changed
 *
 * @class NotificationsGateway
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');
  private userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private socketUsers = new Map<string, string>(); // socketId -> userId

  /**
   * Initialize WebSocket server
   */
  afterInit(server: Server) {
    this.logger.log('Notifications Gateway initialized');
  }

  /**
   * Handle client connection with authentication
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Notifications client attempting connection: ${client.id}`);

      const userId = await this.authenticateSocket(client);

      if (!userId) {
        this.logger.warn(`Unauthenticated notification connection: ${client.id}`);
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

      this.logger.log(`Notifications client authenticated: ${client.id} (User: ${userId})`);

      // Send authentication success
      client.emit('connection:authenticated', {
        userId,
        timestamp: new Date().toISOString(),
      });

      // Join user's personal notification room
      client.join(`user:${userId}`);

      // Send current unread count on connect
      this.sendUnreadCount(userId);
    } catch (error) {
      this.logger.error(`Notification connection error: ${error.message}`);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`Notifications client disconnected: ${client.id}`);

    const userId = this.socketUsers.get(client.id);

    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);

        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }

      this.socketUsers.delete(client.id);
    }
  }

  /**
   * Subscribe to notification:mark_read event
   */
  @SubscribeMessage('notification:mark_read')
  handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    this.logger.log(`Notification ${data.notificationId} marked as read by ${userId}`);

    // Broadcast to all user's devices
    this.server.to(`user:${userId}`).emit('notification:read', {
      notificationId: data.notificationId,
      readAt: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Subscribe to notification:mark_all_read event
   */
  @SubscribeMessage('notification:mark_all_read')
  handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    this.logger.log(`All notifications marked as read by ${userId}`);

    // Broadcast to all user's devices
    this.server.to(`user:${userId}`).emit('notification:all_read', {
      timestamp: new Date().toISOString(),
    });

    // Update count
    this.sendUnreadCount(userId, 0);

    return { success: true };
  }

  /**
   * Subscribe to notification:delete event
   */
  @SubscribeMessage('notification:delete')
  handleDeleteNotification(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    this.logger.log(`Notification ${data.notificationId} deleted by ${userId}`);

    // Broadcast to all user's devices
    this.server.to(`user:${userId}`).emit('notification:deleted', {
      notificationId: data.notificationId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Subscribe to notification:preferences:update event
   */
  @SubscribeMessage('notification:preferences:update')
  handleUpdatePreferences(
    @MessageBody() data: { preferences: Record<string, any> },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketUsers.get(client.id);

    if (!userId) {
      throw new WsException('User not authenticated');
    }

    this.logger.log(`Notification preferences updated by ${userId}`);

    // Broadcast to all user's devices
    this.server.to(`user:${userId}`).emit('notification:preferences:updated', {
      preferences: data.preferences,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Send new notification to user
   * Called by NotificationsService
   */
  sendNotificationToUser(
    userId: string,
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, any>;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      actionUrl?: string;
      createdAt: string;
    },
  ) {
    this.logger.log(`Sending notification ${notification.id} to user ${userId}`);

    // Send to all user's connected devices
    this.server.to(`user:${userId}`).emit('notification:new', notification);

    // Update unread count
    this.incrementUnreadCount(userId);
  }

  /**
   * Send bulk notifications to multiple users
   */
  sendBulkNotifications(
    userIds: string[],
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, any>;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      actionUrl?: string;
      createdAt: string;
    },
  ) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Send unread notification count to user
   */
  private sendUnreadCount(userId: string, count?: number) {
    // If count not provided, it would be fetched from database in production
    const unreadCount = count !== undefined ? count : 0;

    this.server.to(`user:${userId}`).emit('notification:count', {
      count: unreadCount,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Increment unread count for user
   */
  private incrementUnreadCount(userId: string) {
    // In production, this would fetch from database
    // For now, we just emit an event to refetch count
    this.server.to(`user:${userId}`).emit('notification:count:update', {
      timestamp: new Date().toISOString(),
    });
  }

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
        // For development, allow userId from query
        const userId = client.handshake.query?.userId as string;
        if (userId) {
          this.logger.warn(`Development mode: Using userId from query: ${userId}`);
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
}
