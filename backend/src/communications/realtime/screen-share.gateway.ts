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
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface ScreenShareSession {
  sessionId: string;
  presenterId: string;
  presenterName: string;
  roomId: string;
  startedAt: Date;
  viewers: Set<string>;
  quality: 'low' | 'medium' | 'high';
  fps: number;
  isActive: boolean;
}

export interface ScreenShareOffer {
  sessionId: string;
  sdp: string;
  type: 'offer';
}

export interface ScreenShareAnswer {
  sessionId: string;
  sdp: string;
  type: 'answer';
}

export interface ICECandidate {
  sessionId: string;
  candidate: any;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'screen-share',
})
export class ScreenShareGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ScreenShareGateway.name);
  private sessions = new Map<string, ScreenShareSession>();
  private userSocketMap = new Map<string, string>(); // socketId -> userId

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
      const userName = payload.name || payload.email;

      if (!userId) {
        this.logger.warn(`Invalid token payload for client ${client.id}`);
        client.disconnect();
        return;
      }

      client.data.userId = userId;
      client.data.userName = userName;
      this.userSocketMap.set(client.id, userId);

      this.logger.log(`User ${userId} connected to screen share`);
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

    // Stop any active screen share sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.presenterId === userId) {
        this.stopScreenShare(sessionId);
      } else if (session.viewers.has(userId)) {
        this.leaveScreenShare(sessionId, userId);
      }
    });

    this.userSocketMap.delete(client.id);

    this.logger.log(`User ${userId} disconnected from screen share`);
  }

  @SubscribeMessage('screenshare:start')
  handleStartScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      quality?: 'low' | 'medium' | 'high';
      fps?: number;
    },
  ) {
    const userId = client.data.userId;
    const userName = client.data.userName;
    const { roomId, quality = 'medium', fps = 30 } = data;

    if (!userId || !roomId) {
      client.emit('screenshare:error', { error: 'Invalid request' });
      return;
    }

    // Check if user already has an active session
    const existingSession = Array.from(this.sessions.values()).find(
      (s) => s.presenterId === userId && s.isActive,
    );

    if (existingSession) {
      client.emit('screenshare:error', {
        error: 'Already presenting in another session',
      });
      return;
    }

    const sessionId = this.generateSessionId();

    const session: ScreenShareSession = {
      sessionId,
      presenterId: userId,
      presenterName: userName,
      roomId,
      startedAt: new Date(),
      viewers: new Set(),
      quality,
      fps,
      isActive: true,
    };

    this.sessions.set(sessionId, session);

    // Join presenter to session room
    client.join(sessionId);
    client.join(`room:${roomId}`);

    // Notify room members
    client.to(`room:${roomId}`).emit('screenshare:started', {
      sessionId,
      presenterId: userId,
      presenterName: userName,
      quality,
      fps,
    });

    client.emit('screenshare:started:ack', { sessionId });

    this.logger.log(
      `User ${userId} started screen share session ${sessionId} in room ${roomId}`,
    );
  }

  @SubscribeMessage('screenshare:stop')
  handleStopScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const userId = client.data.userId;
    const { sessionId } = data;

    if (!userId || !sessionId) {
      return;
    }

    const session = this.sessions.get(sessionId);

    if (!session || session.presenterId !== userId) {
      client.emit('screenshare:error', { error: 'Invalid session' });
      return;
    }

    this.stopScreenShare(sessionId);
    client.emit('screenshare:stopped:ack', { sessionId });
  }

  @SubscribeMessage('screenshare:join')
  handleJoinScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const userId = client.data.userId;
    const userName = client.data.userName;
    const { sessionId } = data;

    if (!userId || !sessionId) {
      client.emit('screenshare:error', { error: 'Invalid request' });
      return;
    }

    const session = this.sessions.get(sessionId);

    if (!session || !session.isActive) {
      client.emit('screenshare:error', { error: 'Session not found or inactive' });
      return;
    }

    // Add viewer
    session.viewers.add(userId);

    // Join session room
    client.join(sessionId);

    // Notify presenter
    this.server.to(sessionId).emit('screenshare:viewer:joined', {
      sessionId,
      viewerId: userId,
      viewerName: userName,
      viewerCount: session.viewers.size,
    });

    // Send session info to viewer
    client.emit('screenshare:joined', {
      sessionId,
      presenterId: session.presenterId,
      presenterName: session.presenterName,
      quality: session.quality,
      fps: session.fps,
    });

    this.logger.log(`User ${userId} joined screen share session ${sessionId}`);
  }

  @SubscribeMessage('screenshare:leave')
  handleLeaveScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const userId = client.data.userId;
    const { sessionId } = data;

    if (!userId || !sessionId) {
      return;
    }

    this.leaveScreenShare(sessionId, userId);
    client.emit('screenshare:left:ack', { sessionId });
  }

  @SubscribeMessage('screenshare:offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; sdp: string; viewerId?: string },
  ) {
    const userId = client.data.userId;
    const { sessionId, sdp, viewerId } = data;

    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    // If viewerId is specified, send to specific viewer, otherwise broadcast
    if (viewerId) {
      this.server.to(`user:${viewerId}`).emit('screenshare:offer', {
        sessionId,
        presenterId: userId,
        sdp,
      });
    } else {
      client.to(sessionId).emit('screenshare:offer', {
        sessionId,
        presenterId: userId,
        sdp,
      });
    }
  }

  @SubscribeMessage('screenshare:answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; sdp: string },
  ) {
    const userId = client.data.userId;
    const { sessionId, sdp } = data;

    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Send answer to presenter
    this.server.to(`user:${session.presenterId}`).emit('screenshare:answer', {
      sessionId,
      viewerId: userId,
      sdp,
    });
  }

  @SubscribeMessage('screenshare:ice-candidate')
  handleICECandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      sessionId: string;
      candidate: any;
      targetId?: string;
    },
  ) {
    const userId = client.data.userId;
    const { sessionId, candidate, targetId } = data;

    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Forward ICE candidate to target or broadcast
    if (targetId) {
      this.server.to(`user:${targetId}`).emit('screenshare:ice-candidate', {
        sessionId,
        senderId: userId,
        candidate,
      });
    } else {
      client.to(sessionId).emit('screenshare:ice-candidate', {
        sessionId,
        senderId: userId,
        candidate,
      });
    }
  }

  @SubscribeMessage('screenshare:quality')
  handleChangeQuality(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      sessionId: string;
      quality: 'low' | 'medium' | 'high';
      fps?: number;
    },
  ) {
    const userId = client.data.userId;
    const { sessionId, quality, fps } = data;

    const session = this.sessions.get(sessionId);

    if (!session || session.presenterId !== userId) {
      return;
    }

    session.quality = quality;
    if (fps) {
      session.fps = fps;
    }

    // Notify all viewers
    this.server.to(sessionId).emit('screenshare:quality:changed', {
      sessionId,
      quality,
      fps: session.fps,
    });

    this.logger.log(
      `Screen share session ${sessionId} quality changed to ${quality}`,
    );
  }

  private stopScreenShare(sessionId: string): void {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    session.isActive = false;

    // Notify all viewers
    this.server.to(sessionId).emit('screenshare:stopped', { sessionId });

    // Clean up
    setTimeout(() => {
      this.sessions.delete(sessionId);
    }, 5000); // Delay cleanup to allow messages to be delivered

    this.logger.log(`Screen share session ${sessionId} stopped`);
  }

  private leaveScreenShare(sessionId: string, userId: string): void {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    session.viewers.delete(userId);

    // Notify presenter and other viewers
    this.server.to(sessionId).emit('screenshare:viewer:left', {
      sessionId,
      viewerId: userId,
      viewerCount: session.viewers.size,
    });

    this.logger.log(`User ${userId} left screen share session ${sessionId}`);
  }

  private extractToken(client: Socket): string | null {
    const authHeader =
      client.handshake.headers.authorization || client.handshake.auth?.token;

    if (typeof authHeader === 'string') {
      return authHeader.replace('Bearer ', '');
    }

    return null;
  }

  private generateSessionId(): string {
    return `ss_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  getActiveSession(sessionId: string): ScreenShareSession | undefined {
    return this.sessions.get(sessionId);
  }

  getActiveSessions(): ScreenShareSession[] {
    return Array.from(this.sessions.values()).filter((s) => s.isActive);
  }

  getSessionsByRoom(roomId: string): ScreenShareSession[] {
    return Array.from(this.sessions.values()).filter(
      (s) => s.roomId === roomId && s.isActive,
    );
  }
}
