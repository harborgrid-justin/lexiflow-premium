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
import { Logger, Injectable, UseGuards, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as MasterConfig from '../config/master.config';
import { WsRateLimitGuard } from '../common/guards/ws-rate-limit.guard';
import { WsRoomLimitGuard } from '../common/guards/ws-room-limit.guard';

/**
 * WebSocket Event Types
 */
export enum WSEvent {
  // Case events
  CASE_CREATED = 'case:created',
  CASE_UPDATED = 'case:updated',
  CASE_DELETED = 'case:deleted',

  // Document events
  DOCUMENT_UPLOADED = 'document:uploaded',
  DOCUMENT_PROCESSED = 'document:processed',

  // Docket events
  DOCKET_ENTRY_ADDED = 'docket:entry:added',

  // Notification events
  NOTIFICATION = 'notification',

  // System events
  SYSTEM_ALERT = 'system:alert',

  // Generic room events
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  MESSAGE = 'message',
}

/**
 * Consolidated WebSocket Gateway
 * Provides real-time updates with JWT authentication
 * Supports rooms for multi-tenant isolation and targeted broadcasts
 * Combines case-specific rooms with generic room management
 *
 * Resource protections:
 * - Max 5 connections per user (configurable via WS_MAX_CONNECTIONS_PER_USER)
 * - Max 10K global connections (configurable via WS_MAX_GLOBAL_CONNECTIONS)
 * - Max 50 room subscriptions per user (configurable via WS_MAX_ROOMS_PER_USER)
 * - Rate limit: 100 events/minute per client (configurable via WS_RATE_LIMIT_EVENTS_PER_MINUTE)
 *
 * @example Client with Auth
 * const socket = io('http://localhost:3000/events', {
 *   auth: { token: 'jwt-token' }
 * });
 * socket.on('case:updated', (data) => console.log(data));
 *
 * @example Generic Room
 * socket.emit('join_room', { room: 'chat-123', userId: 'user-1' });
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: MasterConfig.REALTIME_CORS_ORIGIN,
    credentials: true,
  },
  namespace: MasterConfig.REALTIME_NAMESPACE,
  maxHttpBufferSize: MasterConfig.REALTIME_MAX_HTTP_BUFFER_SIZE,
  pingTimeout: MasterConfig.REALTIME_PING_TIMEOUT_MS,
  pingInterval: MasterConfig.REALTIME_PING_INTERVAL_MS,
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients: Map<string, ClientInfo> = new Map();
  private rooms: Map<string, Set<RoomParticipant>> = new Map();
  private socketToUser: Map<string, string> = new Map();

  constructor(
    private jwtService: JwtService,
    // Guards available for WebSocket rate limiting if needed
    protected _wsRateLimitGuard: WsRateLimitGuard,
    private wsRoomLimitGuard: WsRoomLimitGuard,
  ) {}

  onModuleDestroy() {
    this.connectedClients.clear();
    this.rooms.clear();
    this.socketToUser.clear();
  }

  async handleConnection(client: Socket) {
    try {
      // Authenticate client
      const token = (client.handshake.auth.token as string | undefined) || 
                    (client.handshake.headers.authorization as string | undefined)?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync<{ sub?: string; userId?: string }>(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(`Client ${client.id} connection rejected: Invalid token payload`);
        client.disconnect();
        return;
      }

      // Store client info
      this.connectedClients.set(client.id, {
        userId,
        socketId: client.id,
        connectedAt: new Date(),
      });

      this.socketToUser.set(client.id, userId);

      // Join user room for targeted messages
      client.join(`user:${userId}`);

      this.logger.log(`Client ${client.id} connected (user: ${userId})`);

      // Send welcome message
      client.emit('connected', {
        message: 'Connected to real-time updates',
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Authentication failed for client ${client.id}:`, message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(`Client ${client.id} disconnected (user: ${clientInfo.userId})`);
      this.connectedClients.delete(client.id);
    }

    // Clean up room limits tracking
    this.wsRoomLimitGuard.cleanupUser(client);

    // Remove from all rooms
    for (const [roomName, participants] of this.rooms) {
      const participant = Array.from(participants).find(p => p.socketId === client.id);
      if (participant) {
        participants.delete(participant);
        this.server.to(roomName).emit(WSEvent.USER_LEFT, {
          socketId: client.id,
          userId: this.socketToUser.get(client.id),
        });
      }
    }

    this.socketToUser.delete(client.id);
  }

  /**
   * Subscribe to case updates
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('subscribe:case')
  handleSubscribeCase(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { caseId: string },
  ) {
    const roomId = `case:${data.caseId}`;

    // Check room limit
    const limitCheck = this.wsRoomLimitGuard.canJoinRoom(client, roomId);
    if (!limitCheck.allowed) {
      return {
        status: 'error',
        error: limitCheck.reason,
        currentRoomCount: limitCheck.currentCount,
      };
    }

    client.join(roomId);
    this.logger.debug(`Client ${client.id} subscribed to case ${data.caseId}`);
    return { status: 'subscribed', caseId: data.caseId };
  }

  /**
   * Unsubscribe from case updates
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('unsubscribe:case')
  handleUnsubscribeCase(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { caseId: string },
  ) {
    const roomId = `case:${data.caseId}`;
    client.leave(roomId);

    // Update room limit tracking
    this.wsRoomLimitGuard.leaveRoom(client, roomId);

    this.logger.debug(`Client ${client.id} unsubscribed from case ${data.caseId}`);
    return { status: 'unsubscribed', caseId: data.caseId };
  }

  /**
   * Join a generic room
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; userId?: string },
  ): { success: boolean; error?: string } {
    const { room, userId } = data;

    // Check room limit
    const limitCheck = this.wsRoomLimitGuard.canJoinRoom(client, room);
    if (!limitCheck.allowed) {
      this.logger.warn(`Client ${client.id} cannot join room ${room}: ${limitCheck.reason}`);
      client.emit('error', {
        code: 'ROOM_LIMIT_EXCEEDED',
        message: limitCheck.reason,
        currentRoomCount: limitCheck.currentCount,
      });
      return { success: false, error: limitCheck.reason };
    }

    client.join(room);

    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    const participant: RoomParticipant = {
      socketId: client.id,
      userId: userId || this.socketToUser.get(client.id),
      joinedAt: new Date(),
    };

    const roomParticipantsSet = this.rooms.get(room);
    if (roomParticipantsSet) {
      roomParticipantsSet.add(participant);
    }

    if (userId) {
      this.socketToUser.set(client.id, userId);
    }

    const roomParticipants = this.rooms.get(room);
    this.server.to(room).emit(WSEvent.USER_JOINED, {
      socketId: client.id,
      userId: participant.userId,
      participantCount: roomParticipants?.size ?? 0,
    });

    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { success: true };
  }

  /**
   * Leave a generic room
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): void {
    const { room } = data;

    client.leave(room);

    // Update room limit tracking
    this.wsRoomLimitGuard.leaveRoom(client, room);

    const roomParticipants = this.rooms.get(room);
    if (roomParticipants) {
      const participant = Array.from(roomParticipants).find(p => p.socketId === client.id);
      if (participant) {
        roomParticipants.delete(participant);
      }
    }

    this.server.to(room).emit(WSEvent.USER_LEFT, {
      socketId: client.id,
      userId: this.socketToUser.get(client.id),
    });

    this.logger.log(`Client ${client.id} left room: ${room}`);
  }

  /**
   * Send message to room
   */
  @UseGuards(WsRateLimitGuard)
  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; message: unknown },
  ): void {
    const { room, message } = data;

    this.server.to(room).emit(WSEvent.MESSAGE, {
      from: client.id,
      userId: this.socketToUser.get(client.id),
      message,
      timestamp: new Date(),
    });

    this.logger.debug(`Message sent to room ${room} from ${client.id}`);
  }

  /**
   * Broadcast to all clients
   */
  broadcastToAll(event: WSEvent | string, data: Record<string, unknown>): void {
    this.server.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast to specific user
   */
  broadcastToUser(userId: string, event: WSEvent | string, data: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast to case room
   */
  broadcastToCase(caseId: string, event: WSEvent | string, data: Record<string, unknown>): void {
    this.server.to(`case:${caseId}`).emit(event, {
      ...data,
      caseId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast to multiple users
   */
  broadcastToUsers(userIds: string[], event: WSEvent | string, data: Record<string, unknown>): void {
    for (const userId of userIds) {
      this.broadcastToUser(userId, event, data);
    }
  }

  /**
   * Emit to specific room
   */
  emitToRoom(room: string, event: string, data: Record<string, unknown>): void {
    this.server.to(room).emit(event, data);
    this.logger.debug(`Event ${event} emitted to room ${room}`);
  }

  /**
   * Emit to user (alias for broadcastToUser, for backwards compatibility)
   */
  emitToUser(userId: string, event: string, data: Record<string, unknown>): void {
    for (const [socketId, uid] of this.socketToUser) {
      if (uid === userId) {
        this.server.to(socketId).emit(event, data);
        this.logger.debug(`Event ${event} emitted to user ${userId}`);
      }
    }
  }

  /**
   * Emit to all (alias for broadcastToAll, for backwards compatibility)
   */
  emitToAll(event: string, data: Record<string, unknown>): void {
    this.server.emit(event, data);
    this.logger.debug(`Event ${event} emitted to all clients`);
  }

  /**
   * Get room participants
   */
  getRoomParticipants(room: string): RoomParticipant[] {
    return Array.from(this.rooms.get(room) || []);
  }

  /**
   * Get room participant count
   */
  getRoomCount(room: string): number {
    return this.rooms.get(room)?.size || 0;
  }

  /**
   * Get all rooms
   */
  getAllRooms(): string[] {
    return Array.from(this.rooms.keys());
  }

  /**
   * Get connected clients count
   */
  getConnectedCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get user's active connections
   */
  getUserConnections(userId: string): ClientInfo[] {
    return Array.from(this.connectedClients.values()).filter(
      (client) => client.userId === userId,
    );
  }
}

interface ClientInfo {
  userId: string;
  socketId: string;
  connectedAt: Date;
}

interface RoomParticipant {
  socketId: string;
  userId?: string;
  joinedAt: Date;
}
