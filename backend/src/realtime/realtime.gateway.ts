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
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

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
}

/**
 * WebSocket Gateway
 * Provides real-time updates with JWT authentication
 * Supports rooms for multi-tenant isolation and targeted broadcasts
 * 
 * @example Client
 * const socket = io('http://localhost:3000', {
 *   auth: { token: 'jwt-token' }
 * });
 * socket.on('case:updated', (data) => console.log(data));
 */
@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
  namespace: '/events',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients: Map<string, ClientInfo> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Authenticate client
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub || payload.userId;

      // Store client info
      this.connectedClients.set(client.id, {
        userId,
        socketId: client.id,
        connectedAt: new Date(),
      });

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
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      this.logger.log(`Client ${client.id} disconnected (user: ${clientInfo.userId})`);
      this.connectedClients.delete(client.id);
    }
  }

  /**
   * Subscribe to case updates
   */
  @SubscribeMessage('subscribe:case')
  handleSubscribeCase(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { caseId: string },
  ) {
    client.join(`case:${data.caseId}`);
    this.logger.debug(`Client ${client.id} subscribed to case ${data.caseId}`);
    return { status: 'subscribed', caseId: data.caseId };
  }

  /**
   * Unsubscribe from case updates
   */
  @SubscribeMessage('unsubscribe:case')
  handleUnsubscribeCase(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { caseId: string },
  ) {
    client.leave(`case:${data.caseId}`);
    this.logger.debug(`Client ${client.id} unsubscribed from case ${data.caseId}`);
    return { status: 'unsubscribed', caseId: data.caseId };
  }

  /**
   * Broadcast to all clients
   */
  broadcastToAll(event: WSEvent, data: any): void {
    this.server.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast to specific user
   */
  broadcastToUser(userId: string, event: WSEvent, data: any): void {
    this.server.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast to case room
   */
  broadcastToCase(caseId: string, event: WSEvent, data: any): void {
    this.server.to(`case:${caseId}`).emit(event, {
      ...data,
      caseId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Broadcast to multiple users
   */
  broadcastToUsers(userIds: string[], event: WSEvent, data: any): void {
    for (const userId of userIds) {
      this.broadcastToUser(userId, event, data);
    }
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
