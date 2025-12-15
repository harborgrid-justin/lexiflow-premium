import { Injectable, Logger } from '@nestjs/common';
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

interface RoomParticipant {
  socketId: string;
  userId?: string;
  joinedAt: Date;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeService.name);
  private rooms: Map<string, Set<RoomParticipant>> = new Map();
  private socketToUser: Map<string, string> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove from all rooms
    for (const [roomName, participants] of this.rooms) {
      const participant = Array.from(participants).find(p => p.socketId === client.id);
      if (participant) {
        participants.delete(participant);
        this.server.to(roomName).emit('user_left', {
          socketId: client.id,
          userId: this.socketToUser.get(client.id),
        });
      }
    }

    this.socketToUser.delete(client.id);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; userId?: string },
  ): void {
    const { room, userId } = data;

    client.join(room);
    
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    const participant: RoomParticipant = {
      socketId: client.id,
      userId,
      joinedAt: new Date(),
    };

    this.rooms.get(room)!.add(participant);
    
    if (userId) {
      this.socketToUser.set(client.id, userId);
    }

    this.server.to(room).emit('user_joined', {
      socketId: client.id,
      userId,
      participantCount: this.rooms.get(room)!.size,
    });

    this.logger.log(`Client ${client.id} joined room: ${room}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ): void {
    const { room } = data;

    client.leave(room);

    const roomParticipants = this.rooms.get(room);
    if (roomParticipants) {
      const participant = Array.from(roomParticipants).find(p => p.socketId === client.id);
      if (participant) {
        roomParticipants.delete(participant);
      }
    }

    this.server.to(room).emit('user_left', {
      socketId: client.id,
      userId: this.socketToUser.get(client.id),
    });

    this.logger.log(`Client ${client.id} left room: ${room}`);
  }

  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; message: any },
  ): void {
    const { room, message } = data;

    this.server.to(room).emit('message', {
      from: client.id,
      userId: this.socketToUser.get(client.id),
      message,
      timestamp: new Date(),
    });

    this.logger.debug(`Message sent to room ${room} from ${client.id}`);
  }

  // Service methods for programmatic emission
  emitToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
    this.logger.debug(`Event ${event} emitted to room ${room}`);
  }

  emitToUser(userId: string, event: string, data: any): void {
    for (const [socketId, uid] of this.socketToUser) {
      if (uid === userId) {
        this.server.to(socketId).emit(event, data);
        this.logger.debug(`Event ${event} emitted to user ${userId}`);
      }
    }
  }

  emitToAll(event: string, data: any): void {
    this.server.emit(event, data);
    this.logger.debug(`Event ${event} emitted to all clients`);
  }

  getRoomParticipants(room: string): RoomParticipant[] {
    return Array.from(this.rooms.get(room) || []);
  }

  getRoomCount(room: string): number {
    return this.rooms.get(room)?.size || 0;
  }

  getAllRooms(): string[] {
    return Array.from(this.rooms.keys());
  }
}
