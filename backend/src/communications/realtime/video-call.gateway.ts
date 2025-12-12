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

export interface Participant {
  userId: string;
  userName: string;
  joinedAt: Date;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
}

export interface VideoCallRoom {
  roomId: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  participants: Map<string, Participant>;
  maxParticipants: number;
  isRecording: boolean;
  recordingStartedAt?: Date;
  isLocked: boolean;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  from: string;
  to: string;
  data: any;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: 'video-call',
})
export class VideoCallGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VideoCallGateway.name);
  private rooms = new Map<string, VideoCallRoom>();
  private userSocketMap = new Map<string, string>(); // socketId -> userId
  private socketRoomMap = new Map<string, string>(); // socketId -> roomId

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

      this.logger.log(`User ${userId} connected to video call`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    const roomId = this.socketRoomMap.get(client.id);

    if (!userId) {
      return;
    }

    if (roomId) {
      this.leaveRoom(roomId, userId, client);
    }

    this.userSocketMap.delete(client.id);
    this.socketRoomMap.delete(client.id);

    this.logger.log(`User ${userId} disconnected from video call`);
  }

  @SubscribeMessage('call:create-room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      name: string;
      maxParticipants?: number;
    },
  ) {
    const userId = client.data.userId;
    const { name, maxParticipants = 50 } = data;

    if (!userId) {
      client.emit('call:error', { error: 'Unauthorized' });
      return;
    }

    const roomId = this.generateRoomId();

    const room: VideoCallRoom = {
      roomId,
      name,
      createdBy: userId,
      createdAt: new Date(),
      participants: new Map(),
      maxParticipants,
      isRecording: false,
      isLocked: false,
    };

    this.rooms.set(roomId, room);

    client.emit('call:room-created', {
      roomId,
      name,
      maxParticipants,
    });

    this.logger.log(`User ${userId} created video call room ${roomId}`);
  }

  @SubscribeMessage('call:join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    const userName = client.data.userName;
    const { roomId } = data;

    if (!userId || !roomId) {
      client.emit('call:error', { error: 'Invalid request' });
      return;
    }

    const room = this.rooms.get(roomId);

    if (!room) {
      client.emit('call:error', { error: 'Room not found' });
      return;
    }

    if (room.isLocked && room.createdBy !== userId) {
      client.emit('call:error', { error: 'Room is locked' });
      return;
    }

    if (room.participants.size >= room.maxParticipants) {
      client.emit('call:error', { error: 'Room is full' });
      return;
    }

    // Add participant
    const participant: Participant = {
      userId,
      userName,
      joinedAt: new Date(),
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      isSpeaking: false,
    };

    room.participants.set(userId, participant);
    this.socketRoomMap.set(client.id, roomId);

    // Join socket room
    client.join(roomId);

    // Get existing participants
    const existingParticipants = Array.from(room.participants.values()).filter(
      (p) => p.userId !== userId,
    );

    // Notify existing participants
    client.to(roomId).emit('call:participant-joined', {
      roomId,
      participant,
    });

    // Send room state to new participant
    client.emit('call:room-joined', {
      roomId,
      room: {
        name: room.name,
        createdBy: room.createdBy,
        maxParticipants: room.maxParticipants,
        isRecording: room.isRecording,
      },
      participants: existingParticipants,
    });

    this.logger.log(`User ${userId} joined video call room ${roomId}`);
  }

  @SubscribeMessage('call:leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = data;

    if (!userId || !roomId) {
      return;
    }

    this.leaveRoom(roomId, userId, client);
    client.emit('call:left-room', { roomId });
  }

  @SubscribeMessage('call:signal')
  handleSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      to: string;
      signal: any;
    },
  ) {
    const userId = client.data.userId;
    const { roomId, to, signal } = data;

    if (!userId || !roomId || !to) {
      return;
    }

    const room = this.rooms.get(roomId);

    if (!room || !room.participants.has(userId)) {
      return;
    }

    // Forward signal to target user
    this.server.to(roomId).emit('call:signal', {
      roomId,
      from: userId,
      to,
      signal,
    });
  }

  @SubscribeMessage('call:offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      to: string;
      sdp: string;
    },
  ) {
    const userId = client.data.userId;
    const { roomId, to, sdp } = data;

    if (!userId) {
      return;
    }

    this.server.to(roomId).emit('call:offer', {
      from: userId,
      to,
      sdp,
    });
  }

  @SubscribeMessage('call:answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      to: string;
      sdp: string;
    },
  ) {
    const userId = client.data.userId;
    const { roomId, to, sdp } = data;

    if (!userId) {
      return;
    }

    this.server.to(roomId).emit('call:answer', {
      from: userId,
      to,
      sdp,
    });
  }

  @SubscribeMessage('call:ice-candidate')
  handleICECandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      roomId: string;
      to: string;
      candidate: any;
    },
  ) {
    const userId = client.data.userId;
    const { roomId, to, candidate } = data;

    if (!userId) {
      return;
    }

    this.server.to(roomId).emit('call:ice-candidate', {
      from: userId,
      to,
      candidate,
    });
  }

  @SubscribeMessage('call:toggle-mute')
  handleToggleMute(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isMuted: boolean },
  ) {
    const userId = client.data.userId;
    const { roomId, isMuted } = data;

    if (!userId) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(userId);

    if (participant) {
      participant.isMuted = isMuted;

      // Notify other participants
      client.to(roomId).emit('call:participant-muted', {
        roomId,
        userId,
        isMuted,
      });
    }
  }

  @SubscribeMessage('call:toggle-video')
  handleToggleVideo(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isVideoOff: boolean },
  ) {
    const userId = client.data.userId;
    const { roomId, isVideoOff } = data;

    if (!userId) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(userId);

    if (participant) {
      participant.isVideoOff = isVideoOff;

      // Notify other participants
      client.to(roomId).emit('call:participant-video-toggled', {
        roomId,
        userId,
        isVideoOff,
      });
    }
  }

  @SubscribeMessage('call:start-screen-share')
  handleStartScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = data;

    if (!userId) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(userId);

    if (participant) {
      participant.isScreenSharing = true;

      // Notify other participants
      this.server.to(roomId).emit('call:screen-share-started', {
        roomId,
        userId,
      });
    }
  }

  @SubscribeMessage('call:stop-screen-share')
  handleStopScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = data;

    if (!userId) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(userId);

    if (participant) {
      participant.isScreenSharing = false;

      // Notify other participants
      this.server.to(roomId).emit('call:screen-share-stopped', {
        roomId,
        userId,
      });
    }
  }

  @SubscribeMessage('call:speaking')
  handleSpeaking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isSpeaking: boolean },
  ) {
    const userId = client.data.userId;
    const { roomId, isSpeaking } = data;

    if (!userId) {
      return;
    }

    const room = this.rooms.get(roomId);
    const participant = room?.participants.get(userId);

    if (participant) {
      participant.isSpeaking = isSpeaking;

      // Notify other participants
      client.to(roomId).emit('call:participant-speaking', {
        roomId,
        userId,
        isSpeaking,
      });
    }
  }

  @SubscribeMessage('call:lock-room')
  handleLockRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isLocked: boolean },
  ) {
    const userId = client.data.userId;
    const { roomId, isLocked } = data;

    if (!userId) {
      return;
    }

    const room = this.rooms.get(roomId);

    if (!room || room.createdBy !== userId) {
      client.emit('call:error', { error: 'Unauthorized' });
      return;
    }

    room.isLocked = isLocked;

    // Notify all participants
    this.server.to(roomId).emit('call:room-locked', {
      roomId,
      isLocked,
    });
  }

  @SubscribeMessage('call:start-recording')
  handleStartRecording(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = data;

    if (!userId) {
      return;
    }

    const room = this.rooms.get(roomId);

    if (!room || room.createdBy !== userId) {
      client.emit('call:error', { error: 'Unauthorized' });
      return;
    }

    room.isRecording = true;
    room.recordingStartedAt = new Date();

    // Notify all participants
    this.server.to(roomId).emit('call:recording-started', {
      roomId,
    });

    this.logger.log(`Recording started in room ${roomId}`);
  }

  @SubscribeMessage('call:stop-recording')
  handleStopRecording(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    const { roomId } = data;

    if (!userId) {
      return;
    }

    const room = this.rooms.get(roomId);

    if (!room || room.createdBy !== userId) {
      client.emit('call:error', { error: 'Unauthorized' });
      return;
    }

    room.isRecording = false;

    // Notify all participants
    this.server.to(roomId).emit('call:recording-stopped', {
      roomId,
    });

    this.logger.log(`Recording stopped in room ${roomId}`);
  }

  private leaveRoom(roomId: string, userId: string, client?: Socket): void {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    room.participants.delete(userId);

    if (client) {
      client.leave(roomId);
      this.socketRoomMap.delete(client.id);
    }

    // Notify other participants
    this.server.to(roomId).emit('call:participant-left', {
      roomId,
      userId,
    });

    // Clean up empty rooms
    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      this.logger.log(`Room ${roomId} deleted (empty)`);
    }

    this.logger.log(`User ${userId} left room ${roomId}`);
  }

  private extractToken(client: Socket): string | null {
    const authHeader =
      client.handshake.headers.authorization || client.handshake.auth?.token;

    if (typeof authHeader === 'string') {
      return authHeader.replace('Bearer ', '');
    }

    return null;
  }

  private generateRoomId(): string {
    return `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods
  getRoom(roomId: string): VideoCallRoom | undefined {
    return this.rooms.get(roomId);
  }

  getActiveRooms(): VideoCallRoom[] {
    return Array.from(this.rooms.values());
  }

  getRoomParticipantCount(roomId: string): number {
    return this.rooms.get(roomId)?.participants.size || 0;
  }
}
