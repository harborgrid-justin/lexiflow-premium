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

export interface CollaborationSession {
  sessionId: string;
  documentId: string;
  participants: Set<string>;
  createdAt: Date;
  lastActivity: Date;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  position: {
    line: number;
    column: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  color: string;
}

export interface DocumentChange {
  userId: string;
  userName: string;
  documentId: string;
  timestamp: Date;
  operations: any[]; // CRDT operations
  version: number;
}

export interface LockRequest {
  documentId: string;
  sectionId?: string;
  userId: string;
}

export interface LockInfo {
  documentId: string;
  sectionId?: string;
  userId: string;
  userName: string;
  lockedAt: Date;
  expiresAt: Date;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'collaboration',
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private sessions = new Map<string, CollaborationSession>();
  private cursors = new Map<string, Map<string, CursorPosition>>(); // documentId -> userId -> cursor
  private locks = new Map<string, LockInfo>(); // documentId/sectionId -> LockInfo
  private documentVersions = new Map<string, number>(); // documentId -> version
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

      this.logger.log(`User ${userId} connected to collaboration`);
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

    // Remove from all sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.participants.has(userId)) {
        session.participants.delete(userId);

        // Notify other participants
        this.server.to(sessionId).emit('collaboration:participant:left', {
          sessionId,
          userId,
          participants: Array.from(session.participants),
        });

        // Clean up empty sessions
        if (session.participants.size === 0) {
          this.sessions.delete(sessionId);
          this.cursors.delete(sessionId);
        }
      }
    });

    // Release any locks held by this user
    this.locks.forEach((lock, key) => {
      if (lock.userId === userId) {
        this.locks.delete(key);
        this.server.emit('collaboration:lock:released', {
          documentId: lock.documentId,
          sectionId: lock.sectionId,
        });
      }
    });

    this.userSocketMap.delete(client.id);

    this.logger.log(`User ${userId} disconnected from collaboration`);
  }

  @SubscribeMessage('collaboration:join')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const userId = client.data.userId;
    const userName = client.data.userName;
    const { documentId } = data;

    if (!userId || !documentId) {
      return;
    }

    const sessionId = `doc:${documentId}`;

    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        sessionId,
        documentId,
        participants: new Set(),
        createdAt: new Date(),
        lastActivity: new Date(),
      };
      this.sessions.set(sessionId, session);
      this.cursors.set(sessionId, new Map());
    }

    // Add participant
    session.participants.add(userId);
    session.lastActivity = new Date();

    // Join socket room
    client.join(sessionId);

    // Get current cursors
    const currentCursors = Array.from(
      this.cursors.get(sessionId)?.values() || [],
    );

    // Get current version
    const version = this.documentVersions.get(documentId) || 0;

    // Send session state to joining user
    client.emit('collaboration:joined', {
      sessionId,
      documentId,
      participants: Array.from(session.participants),
      cursors: currentCursors,
      version,
    });

    // Notify other participants
    client.to(sessionId).emit('collaboration:participant:joined', {
      sessionId,
      userId,
      userName,
      participants: Array.from(session.participants),
    });

    this.logger.log(`User ${userId} joined session ${sessionId}`);
  }

  @SubscribeMessage('collaboration:leave')
  handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string },
  ) {
    const userId = client.data.userId;
    const { documentId } = data;

    if (!userId || !documentId) {
      return;
    }

    const sessionId = `doc:${documentId}`;
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    session.participants.delete(userId);
    client.leave(sessionId);

    // Remove cursor
    this.cursors.get(sessionId)?.delete(userId);

    // Notify other participants
    this.server.to(sessionId).emit('collaboration:participant:left', {
      sessionId,
      userId,
      participants: Array.from(session.participants),
    });

    // Clean up empty session
    if (session.participants.size === 0) {
      this.sessions.delete(sessionId);
      this.cursors.delete(sessionId);
    }

    this.logger.log(`User ${userId} left session ${sessionId}`);
  }

  @SubscribeMessage('collaboration:cursor')
  handleCursorUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Omit<CursorPosition, 'userId' | 'userName'> & { documentId: string },
  ) {
    const userId = client.data.userId;
    const userName = client.data.userName;
    const { documentId, ...cursorData } = data;

    if (!userId || !documentId) {
      return;
    }

    const sessionId = `doc:${documentId}`;
    const sessionCursors = this.cursors.get(sessionId);

    if (!sessionCursors) {
      return;
    }

    const cursorPosition: CursorPosition = {
      userId,
      userName,
      ...cursorData,
    };

    sessionCursors.set(userId, cursorPosition);

    // Broadcast to other participants
    client.to(sessionId).emit('collaboration:cursor:update', cursorPosition);
  }

  @SubscribeMessage('collaboration:change')
  async handleDocumentChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: Omit<DocumentChange, 'userId' | 'userName' | 'timestamp'>,
  ) {
    const userId = client.data.userId;
    const userName = client.data.userName;
    const { documentId, operations, version } = data;

    if (!userId || !documentId) {
      return;
    }

    const sessionId = `doc:${documentId}`;
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Update version
    const currentVersion = this.documentVersions.get(documentId) || 0;
    if (version !== currentVersion) {
      // Version conflict - send current version to client
      client.emit('collaboration:version:conflict', {
        documentId,
        expectedVersion: version,
        currentVersion,
      });
      return;
    }

    const newVersion = currentVersion + 1;
    this.documentVersions.set(documentId, newVersion);

    const change: DocumentChange = {
      userId,
      userName,
      documentId,
      timestamp: new Date(),
      operations,
      version: newVersion,
    };

    session.lastActivity = new Date();

    // Broadcast to other participants
    client.to(sessionId).emit('collaboration:change:apply', change);

    // Acknowledge to sender
    client.emit('collaboration:change:ack', {
      documentId,
      version: newVersion,
    });
  }

  @SubscribeMessage('collaboration:lock:acquire')
  handleAcquireLock(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; sectionId?: string },
  ) {
    const userId = client.data.userId;
    const userName = client.data.userName;
    const { documentId, sectionId } = data;

    if (!userId || !documentId) {
      return;
    }

    const lockKey = sectionId ? `${documentId}:${sectionId}` : documentId;
    const existingLock = this.locks.get(lockKey);

    // Check if already locked by another user
    if (existingLock && existingLock.userId !== userId) {
      client.emit('collaboration:lock:denied', {
        documentId,
        sectionId,
        lockedBy: existingLock,
      });
      return;
    }

    // Acquire lock
    const lock: LockInfo = {
      documentId,
      sectionId,
      userId,
      userName,
      lockedAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };

    this.locks.set(lockKey, lock);

    // Notify all participants
    const sessionId = `doc:${documentId}`;
    this.server.to(sessionId).emit('collaboration:lock:acquired', lock);

    client.emit('collaboration:lock:success', lock);

    // Auto-release after expiration
    setTimeout(() => {
      if (this.locks.get(lockKey) === lock) {
        this.locks.delete(lockKey);
        this.server.to(sessionId).emit('collaboration:lock:released', {
          documentId,
          sectionId,
        });
      }
    }, 5 * 60 * 1000);
  }

  @SubscribeMessage('collaboration:lock:release')
  handleReleaseLock(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { documentId: string; sectionId?: string },
  ) {
    const userId = client.data.userId;
    const { documentId, sectionId } = data;

    if (!userId || !documentId) {
      return;
    }

    const lockKey = sectionId ? `${documentId}:${sectionId}` : documentId;
    const lock = this.locks.get(lockKey);

    if (!lock || lock.userId !== userId) {
      return;
    }

    this.locks.delete(lockKey);

    const sessionId = `doc:${documentId}`;
    this.server.to(sessionId).emit('collaboration:lock:released', {
      documentId,
      sectionId,
    });
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

  // Public methods for external use
  getActiveSession(documentId: string): CollaborationSession | undefined {
    return this.sessions.get(`doc:${documentId}`);
  }

  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values());
  }
}
