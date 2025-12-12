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
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

export interface PresenceData {
  userId: string;
  status: PresenceStatus;
  lastSeen: Date;
  currentPage?: string;
  customStatus?: string;
}

export interface PresenceUpdate {
  status: PresenceStatus;
  customStatus?: string;
  currentPage?: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'presence',
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PresenceGateway.name);
  private presenceMap = new Map<string, PresenceData>();
  private userSocketMap = new Map<string, Set<string>>(); // userId -> socketIds
  private heartbeatIntervals = new Map<string, NodeJS.Timeout>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(`Invalid token payload for client ${client.id}`);
        client.disconnect();
        return;
      }

      client.data.userId = userId;

      // Track socket for this user
      if (!this.userSocketMap.has(userId)) {
        this.userSocketMap.set(userId, new Set());
      }
      this.userSocketMap.get(userId)!.add(client.id);

      // Update presence
      this.updatePresence(userId, {
        status: PresenceStatus.ONLINE,
      });

      // Setup heartbeat
      this.setupHeartbeat(client);

      // Send current presence state to the new client
      client.emit('presence:initial', Array.from(this.presenceMap.values()));

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (!userId) {
      return;
    }

    // Remove socket from user's socket set
    const userSockets = this.userSocketMap.get(userId);
    if (userSockets) {
      userSockets.delete(client.id);

      // If user has no more active sockets, mark as offline
      if (userSockets.size === 0) {
        this.userSocketMap.delete(userId);
        this.updatePresence(userId, {
          status: PresenceStatus.OFFLINE,
        });
      }
    }

    // Clear heartbeat
    const heartbeat = this.heartbeatIntervals.get(client.id);
    if (heartbeat) {
      clearInterval(heartbeat);
      this.heartbeatIntervals.delete(client.id);
    }

    this.logger.log(`User ${userId} disconnected socket ${client.id}`);
  }

  @SubscribeMessage('presence:update')
  handlePresenceUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PresenceUpdate,
  ) {
    const userId = client.data.userId;

    if (!userId) {
      return;
    }

    this.updatePresence(userId, data);
  }

  @SubscribeMessage('presence:subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() userIds: string[],
  ) {
    // Join rooms for specific users
    userIds.forEach((userId) => {
      client.join(`user:${userId}`);
    });

    // Send presence for subscribed users
    const presenceData = userIds
      .map((userId) => this.presenceMap.get(userId))
      .filter((p) => p !== undefined);

    client.emit('presence:subscribed', presenceData);
  }

  @SubscribeMessage('presence:unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() userIds: string[],
  ) {
    userIds.forEach((userId) => {
      client.leave(`user:${userId}`);
    });
  }

  @SubscribeMessage('presence:query')
  handleQuery(
    @ConnectedSocket() client: Socket,
    @MessageBody() userIds: string[],
  ) {
    const presenceData = userIds
      .map((userId) => this.presenceMap.get(userId))
      .filter((p) => p !== undefined);

    client.emit('presence:result', presenceData);
  }

  @SubscribeMessage('presence:heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;

    if (!userId) {
      return;
    }

    const presence = this.presenceMap.get(userId);
    if (presence) {
      presence.lastSeen = new Date();
      this.presenceMap.set(userId, presence);
    }

    client.emit('presence:heartbeat:ack');
  }

  private updatePresence(userId: string, update: PresenceUpdate) {
    const existing = this.presenceMap.get(userId);

    const presenceData: PresenceData = {
      userId,
      status: update.status,
      lastSeen: new Date(),
      currentPage: update.currentPage || existing?.currentPage,
      customStatus: update.customStatus || existing?.customStatus,
    };

    this.presenceMap.set(userId, presenceData);

    // Broadcast to all clients in the user's room
    this.server.to(`user:${userId}`).emit('presence:changed', presenceData);

    // Also broadcast to all connected clients
    this.server.emit('presence:update', presenceData);
  }

  private extractToken(client: Socket): string | null {
    const authHeader =
      client.handshake.headers.authorization ||
      client.handshake.auth?.token;

    if (typeof authHeader === 'string') {
      return authHeader.replace('Bearer ', '');
    }

    return null;
  }

  private setupHeartbeat(client: Socket) {
    const interval = setInterval(() => {
      client.emit('presence:ping');
    }, 30000); // 30 seconds

    this.heartbeatIntervals.set(client.id, interval);
  }

  // Public method to get presence for a user
  getPresence(userId: string): PresenceData | undefined {
    return this.presenceMap.get(userId);
  }

  // Public method to get all online users
  getOnlineUsers(): PresenceData[] {
    return Array.from(this.presenceMap.values()).filter(
      (p) => p.status !== PresenceStatus.OFFLINE,
    );
  }

  // Public method to broadcast presence to specific users
  broadcastToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit(event, data);
    });
  }
}
