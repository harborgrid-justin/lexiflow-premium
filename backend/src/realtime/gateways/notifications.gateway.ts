import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Injectable, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as MasterConfig from '@config/master.config';
import { WsRateLimitGuard } from '@common/guards/ws-rate-limit.guard';

/**
 * Notifications WebSocket Gateway
 *
 * Provides real-time notification delivery with:
 * - Instant notification push to connected users
 * - Notification acknowledgment tracking
 * - Unread count updates
 * - Priority-based delivery
 * - Multi-device support
 *
 * Events:
 * - notification:new - New notification received
 * - notification:read - Notification marked as read
 * - notification:deleted - Notification deleted
 * - notification:count - Updated unread count
 *
 * Security:
 * - JWT authentication required
 * - User-specific notification delivery
 * - Rate limiting on all events
 *
 * @class NotificationsGateway
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: MasterConfig.REALTIME_CORS_ORIGIN,
    credentials: true,
  },
  namespace: '/notifications',
  maxHttpBufferSize: MasterConfig.REALTIME_MAX_HTTP_BUFFER_SIZE,
  pingTimeout: MasterConfig.REALTIME_PING_TIMEOUT_MS,
  pingInterval: MasterConfig.REALTIME_PING_INTERVAL_MS,
  transports: ['websocket', 'polling'],
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private userConnections = new Map<string, Set<string>>(); // userId -> Set<socketId>
  private socketToUser = new Map<string, string>(); // socketId -> userId
  private unreadCounts = new Map<string, number>(); // userId -> unread count

  constructor(private jwtService: JwtService) {}

  /**
   * Handle client connection with authentication
   */
  async handleConnection(client: Socket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      // Extract and verify JWT token
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<{ sub?: string; userId?: string }>(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(`Client ${client.id} connection rejected: Invalid token`);
        client.disconnect();
        return;
      }

      // Store connection mapping
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId)!.add(client.id);
      this.socketToUser.set(client.id, userId);

      // Join user's notification room
      client.join(`user:${userId}`);

      this.logger.log(
        `Notification client connected: ${client.id} (User: ${userId}, Total connections: ${
          this.userConnections.get(userId)!.size
        })`,
      );

      // Send initial unread count
      const unreadCount = this.unreadCounts.get(userId) || 0;
      client.emit('notification:count', {
        count: unreadCount,
        timestamp: new Date().toISOString(),
      });

      // Send connection acknowledgment
      client.emit('connected', {
        userId,
        socketId: client.id,
        namespace: 'notifications',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Authentication failed for client ${client.id}: ${message}`);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection with cleanup
   */
  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);

    if (userId) {
      const connections = this.userConnections.get(userId);
      if (connections) {
        connections.delete(client.id);
        if (connections.size === 0) {
          this.userConnections.delete(userId);
          this.logger.log(`User ${userId} fully disconnected from notifications`);
        } else {
          this.logger.log(
            `Client ${client.id} disconnected (User: ${userId}, Remaining: ${connections.size})`,
          );
        }
      }
      this.socketToUser.delete(client.id);
    } else {
      this.logger.log(`Client ${client.id} disconnected (no user mapping)`);
    }
  }

  /**
   * Mark notification as read
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('notification:mark-read')
  handleMarkRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId || !data.notificationId) {
      return { success: false, error: 'Invalid request' };
    }

    // Decrement unread count
    const currentCount = this.unreadCounts.get(userId) || 0;
    const newCount = Math.max(0, currentCount - 1);
    this.unreadCounts.set(userId, newCount);

    // Broadcast to all user's devices
    this.server.to(`user:${userId}`).emit('notification:read', {
      notificationId: data.notificationId,
      userId,
      timestamp: new Date().toISOString(),
    });

    // Send updated count
    this.server.to(`user:${userId}`).emit('notification:count', {
      count: newCount,
      timestamp: new Date().toISOString(),
    });

    return { success: true, unreadCount: newCount };
  }

  /**
   * Mark all notifications as read
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('notification:mark-all-read')
  handleMarkAllRead(@ConnectedSocket() client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) {
      return { success: false, error: 'User not found' };
    }

    // Reset unread count
    this.unreadCounts.set(userId, 0);

    // Broadcast to all user's devices
    this.server.to(`user:${userId}`).emit('notification:all-read', {
      userId,
      timestamp: new Date().toISOString(),
    });

    // Send updated count
    this.server.to(`user:${userId}`).emit('notification:count', {
      count: 0,
      timestamp: new Date().toISOString(),
    });

    return { success: true, unreadCount: 0 };
  }

  /**
   * Delete notification
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('notification:delete')
  handleDelete(
    @MessageBody() data: { notificationId: string; wasUnread?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId || !data.notificationId) {
      return { success: false, error: 'Invalid request' };
    }

    // Decrement unread count if notification was unread
    if (data.wasUnread) {
      const currentCount = this.unreadCounts.get(userId) || 0;
      const newCount = Math.max(0, currentCount - 1);
      this.unreadCounts.set(userId, newCount);

      // Send updated count
      this.server.to(`user:${userId}`).emit('notification:count', {
        count: newCount,
        timestamp: new Date().toISOString(),
      });
    }

    // Broadcast deletion to all user's devices
    this.server.to(`user:${userId}`).emit('notification:deleted', {
      notificationId: data.notificationId,
      userId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Send notification to user (called by NotificationsService)
   */
  sendNotificationToUser(
    userId: string,
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      priority: string;
      createdAt: string;
      metadata?: Record<string, unknown>;
      actionUrl?: string;
    },
  ) {
    // Increment unread count
    const currentCount = this.unreadCounts.get(userId) || 0;
    this.unreadCounts.set(userId, currentCount + 1);

    // Send notification to all user's connected devices
    this.server.to(`user:${userId}`).emit('notification:new', {
      ...notification,
      timestamp: new Date().toISOString(),
    });

    // Send updated unread count
    this.server.to(`user:${userId}`).emit('notification:count', {
      count: currentCount + 1,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(
      `Notification sent to user ${userId}: ${notification.type} - ${notification.title}`,
    );
  }

  /**
   * Broadcast notification to multiple users
   */
  broadcastNotification(
    userIds: string[],
    notification: {
      id: string;
      type: string;
      title: string;
      message: string;
      priority: string;
      createdAt: string;
      metadata?: Record<string, unknown>;
      actionUrl?: string;
    },
  ) {
    for (const userId of userIds) {
      this.sendNotificationToUser(userId, notification);
    }
  }

  /**
   * Update unread count for user (called externally)
   */
  updateUnreadCount(userId: string, count: number) {
    this.unreadCounts.set(userId, count);
    this.server.to(`user:${userId}`).emit('notification:count', {
      count,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const totalConnections = Array.from(this.userConnections.values()).reduce(
      (sum, sockets) => sum + sockets.size,
      0,
    );

    return {
      totalUsers: this.userConnections.size,
      totalConnections,
      userDetails: Array.from(this.userConnections.entries()).map(([userId, sockets]) => ({
        userId,
        connectionCount: sockets.size,
        unreadCount: this.unreadCounts.get(userId) || 0,
      })),
    };
  }

  /**
   * Extract JWT token from socket handshake
   */
  private extractToken(client: Socket): string | null {
    // Try auth object first (recommended)
    if (client.handshake.auth.token) {
      return client.handshake.auth.token as string;
    }

    // Try Authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try query parameter (fallback)
    if (client.handshake.query.token) {
      return client.handshake.query.token as string;
    }

    return null;
  }
}
