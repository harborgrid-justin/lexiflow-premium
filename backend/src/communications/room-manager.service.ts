import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export enum RoomType {
  CASE = 'case',
  DOCUMENT = 'document',
  CHAT = 'chat',
  ORGANIZATION = 'organization',
  TEAM = 'team',
  PROJECT = 'project',
  USER = 'user',
  ROLE = 'role',
  TEMPORARY = 'temporary',
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  createdBy: string;
  createdAt: Date;
  participants: Set<string>;
  metadata?: any;
  maxParticipants?: number;
  isPrivate: boolean;
  expiresAt?: Date;
}

export interface RoomPermissions {
  canJoin: boolean;
  canInvite: boolean;
  canKick: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

export interface JoinRoomOptions {
  password?: string;
  inviteCode?: string;
  metadata?: any;
}

@Injectable()
export class RoomManagerService {
  private readonly logger = new Logger(RoomManagerService.name);
  private rooms = new Map<string, Room>();
  private roomPasswords = new Map<string, string>();
  private roomInviteCodes = new Map<string, string>();
  private userRooms = new Map<string, Set<string>>(); // userId -> roomIds
  private servers = new Map<string, Server>(); // namespace -> server
  private roomAdmins = new Map<string, Set<string>>(); // roomId -> userIds

  registerServer(namespace: string, server: Server) {
    this.servers.set(namespace, server);
    this.logger.log(`Registered server for namespace: ${namespace}`);
  }

  /**
   * Create a new room
   */
  createRoom(
    name: string,
    type: RoomType,
    createdBy: string,
    options?: {
      isPrivate?: boolean;
      maxParticipants?: number;
      password?: string;
      metadata?: any;
      expiresIn?: number;
    },
  ): Room {
    const roomId = this.generateRoomId(type);

    const room: Room = {
      id: roomId,
      name,
      type,
      createdBy,
      createdAt: new Date(),
      participants: new Set([createdBy]),
      isPrivate: options?.isPrivate || false,
      maxParticipants: options?.maxParticipants,
      metadata: options?.metadata,
    };

    if (options?.expiresIn) {
      room.expiresAt = new Date(Date.now() + options.expiresIn);
      this.scheduleRoomCleanup(roomId, options.expiresIn);
    }

    this.rooms.set(roomId, room);

    // Set creator as admin
    if (!this.roomAdmins.has(roomId)) {
      this.roomAdmins.set(roomId, new Set());
    }
    this.roomAdmins.get(roomId)!.add(createdBy);

    // Track user's rooms
    this.addUserToRoomTracking(createdBy, roomId);

    // Set password if provided
    if (options?.password) {
      this.roomPasswords.set(roomId, options.password);
    }

    // Generate invite code for private rooms
    if (room.isPrivate) {
      this.roomInviteCodes.set(roomId, this.generateInviteCode());
    }

    this.logger.log(`Created room ${roomId} (${type}) by user ${createdBy}`);

    return room;
  }

  /**
   * Join a room
   */
  async joinRoom(
    roomId: string,
    userId: string,
    socket: Socket,
    options?: JoinRoomOptions,
  ): Promise<{ success: boolean; room?: Room; error?: string }> {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    // Check if room is expired
    if (room.expiresAt && room.expiresAt < new Date()) {
      this.deleteRoom(roomId);
      return { success: false, error: 'Room has expired' };
    }

    // Check max participants
    if (
      room.maxParticipants &&
      room.participants.size >= room.maxParticipants
    ) {
      return { success: false, error: 'Room is full' };
    }

    // Check password
    const password = this.roomPasswords.get(roomId);
    if (password && password !== options?.password) {
      return { success: false, error: 'Invalid password' };
    }

    // Check invite code for private rooms
    if (room.isPrivate && !room.participants.has(userId)) {
      const inviteCode = this.roomInviteCodes.get(roomId);
      if (inviteCode !== options?.inviteCode) {
        return { success: false, error: 'Invalid invite code' };
      }
    }

    // Add user to room
    room.participants.add(userId);
    this.addUserToRoomTracking(userId, roomId);

    // Join socket room
    socket.join(roomId);

    // Notify other participants
    const server = this.getServerForSocket(socket);
    if (server) {
      socket.to(roomId).emit('room:user:joined', {
        roomId,
        userId,
        participants: Array.from(room.participants),
      });
    }

    this.logger.log(`User ${userId} joined room ${roomId}`);

    return { success: true, room };
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId: string, userId: string, socket?: Socket): void {
    const room = this.rooms.get(roomId);

    if (!room) {
      return;
    }

    room.participants.delete(userId);
    this.removeUserFromRoomTracking(userId, roomId);

    // Leave socket room
    if (socket) {
      socket.leave(roomId);

      // Notify other participants
      const server = this.getServerForSocket(socket);
      if (server) {
        server.to(roomId).emit('room:user:left', {
          roomId,
          userId,
          participants: Array.from(room.participants),
        });
      }
    }

    // Clean up empty temporary rooms
    if (
      room.type === RoomType.TEMPORARY &&
      room.participants.size === 0
    ) {
      this.deleteRoom(roomId);
    }

    this.logger.log(`User ${userId} left room ${roomId}`);
  }

  /**
   * Invite user to room
   */
  inviteToRoom(
    roomId: string,
    invitedBy: string,
    invitedUserId: string,
  ): { success: boolean; inviteCode?: string; error?: string } {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    // Check permissions
    const permissions = this.getUserPermissions(roomId, invitedBy);
    if (!permissions.canInvite) {
      return { success: false, error: 'No permission to invite' };
    }

    // Get or generate invite code
    let inviteCode = this.roomInviteCodes.get(roomId);
    if (!inviteCode) {
      inviteCode = this.generateInviteCode();
      this.roomInviteCodes.set(roomId, inviteCode);
    }

    this.logger.log(
      `User ${invitedBy} invited ${invitedUserId} to room ${roomId}`,
    );

    return { success: true, inviteCode };
  }

  /**
   * Kick user from room
   */
  kickFromRoom(
    roomId: string,
    kickedBy: string,
    kickedUserId: string,
  ): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    // Check permissions
    const permissions = this.getUserPermissions(roomId, kickedBy);
    if (!permissions.canKick) {
      return { success: false, error: 'No permission to kick users' };
    }

    // Cannot kick room creator
    if (kickedUserId === room.createdBy) {
      return { success: false, error: 'Cannot kick room creator' };
    }

    room.participants.delete(kickedUserId);
    this.removeUserFromRoomTracking(kickedUserId, roomId);

    // Notify via all servers
    this.servers.forEach((server) => {
      server.to(roomId).emit('room:user:kicked', {
        roomId,
        userId: kickedUserId,
        kickedBy,
      });
    });

    this.logger.log(`User ${kickedUserId} kicked from room ${roomId} by ${kickedBy}`);

    return { success: true };
  }

  /**
   * Delete room
   */
  deleteRoom(roomId: string, deletedBy?: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    // Check permissions if deletedBy is provided
    if (deletedBy) {
      const permissions = this.getUserPermissions(roomId, deletedBy);
      if (!permissions.canDelete) {
        return false;
      }
    }

    // Remove all participants
    room.participants.forEach((userId) => {
      this.removeUserFromRoomTracking(userId, roomId);
    });

    // Notify all participants
    this.servers.forEach((server) => {
      server.to(roomId).emit('room:deleted', { roomId });
    });

    // Clean up
    this.rooms.delete(roomId);
    this.roomPasswords.delete(roomId);
    this.roomInviteCodes.delete(roomId);
    this.roomAdmins.delete(roomId);

    this.logger.log(`Room ${roomId} deleted`);

    return true;
  }

  /**
   * Get room details
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Get rooms for user
   */
  getUserRooms(userId: string): Room[] {
    const roomIds = this.userRooms.get(userId) || new Set();
    return Array.from(roomIds)
      .map((id) => this.rooms.get(id))
      .filter((r): r is Room => r !== undefined);
  }

  /**
   * Get rooms by type
   */
  getRoomsByType(type: RoomType): Room[] {
    return Array.from(this.rooms.values()).filter((r) => r.type === type);
  }

  /**
   * Get user permissions for room
   */
  getUserPermissions(roomId: string, userId: string): RoomPermissions {
    const room = this.rooms.get(roomId);

    if (!room) {
      return {
        canJoin: false,
        canInvite: false,
        canKick: false,
        canDelete: false,
        isAdmin: false,
      };
    }

    const isCreator = room.createdBy === userId;
    const isAdmin = this.roomAdmins.get(roomId)?.has(userId) || false;
    const isParticipant = room.participants.has(userId);

    return {
      canJoin: !room.isPrivate || isParticipant,
      canInvite: isParticipant,
      canKick: isCreator || isAdmin,
      canDelete: isCreator,
      isAdmin: isCreator || isAdmin,
    };
  }

  /**
   * Add admin to room
   */
  addRoomAdmin(roomId: string, userId: string, addedBy: string): boolean {
    const permissions = this.getUserPermissions(roomId, addedBy);

    if (!permissions.isAdmin) {
      return false;
    }

    if (!this.roomAdmins.has(roomId)) {
      this.roomAdmins.set(roomId, new Set());
    }

    this.roomAdmins.get(roomId)!.add(userId);

    this.logger.log(`User ${userId} added as admin to room ${roomId}`);

    return true;
  }

  /**
   * Remove admin from room
   */
  removeRoomAdmin(roomId: string, userId: string, removedBy: string): boolean {
    const room = this.rooms.get(roomId);

    if (!room) {
      return false;
    }

    // Cannot remove creator
    if (userId === room.createdBy) {
      return false;
    }

    const permissions = this.getUserPermissions(roomId, removedBy);

    if (!permissions.isAdmin) {
      return false;
    }

    this.roomAdmins.get(roomId)?.delete(userId);

    this.logger.log(`User ${userId} removed as admin from room ${roomId}`);

    return true;
  }

  /**
   * Broadcast to room
   */
  broadcastToRoom(roomId: string, event: string, data: any): void {
    this.servers.forEach((server) => {
      server.to(roomId).emit(event, data);
    });
  }

  /**
   * Get room statistics
   */
  getRoomStatistics(roomId: string): {
    participantCount: number;
    adminCount: number;
    createdAt: Date;
    age: number;
  } | null {
    const room = this.rooms.get(roomId);

    if (!room) {
      return null;
    }

    return {
      participantCount: room.participants.size,
      adminCount: this.roomAdmins.get(roomId)?.size || 0,
      createdAt: room.createdAt,
      age: Date.now() - room.createdAt.getTime(),
    };
  }

  /**
   * Clean up expired rooms
   */
  cleanupExpiredRooms(): void {
    const now = new Date();
    const expiredRooms: string[] = [];

    this.rooms.forEach((room, roomId) => {
      if (room.expiresAt && room.expiresAt < now) {
        expiredRooms.push(roomId);
      }
    });

    expiredRooms.forEach((roomId) => {
      this.deleteRoom(roomId);
    });

    if (expiredRooms.length > 0) {
      this.logger.log(`Cleaned up ${expiredRooms.length} expired rooms`);
    }
  }

  private generateRoomId(type: RoomType): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInviteCode(): string {
    return Math.random().toString(36).substr(2, 10).toUpperCase();
  }

  private addUserToRoomTracking(userId: string, roomId: string): void {
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId)!.add(roomId);
  }

  private removeUserFromRoomTracking(userId: string, roomId: string): void {
    const rooms = this.userRooms.get(userId);
    if (rooms) {
      rooms.delete(roomId);
      if (rooms.size === 0) {
        this.userRooms.delete(userId);
      }
    }
  }

  private getServerForSocket(socket: Socket): Server | undefined {
    // Find server that owns this socket
    for (const server of this.servers.values()) {
      if (server.sockets.sockets.has(socket.id)) {
        return server;
      }
    }
    return undefined;
  }

  private scheduleRoomCleanup(roomId: string, delay: number): void {
    setTimeout(() => {
      this.deleteRoom(roomId);
    }, delay);
  }

  /**
   * Get overall statistics
   */
  getOverallStatistics(): {
    totalRooms: number;
    byType: Record<string, number>;
    totalParticipants: number;
    averageParticipantsPerRoom: number;
  } {
    const byType: Record<string, number> = {};
    let totalParticipants = 0;

    this.rooms.forEach((room) => {
      byType[room.type] = (byType[room.type] || 0) + 1;
      totalParticipants += room.participants.size;
    });

    return {
      totalRooms: this.rooms.size,
      byType,
      totalParticipants,
      averageParticipantsPerRoom:
        this.rooms.size > 0 ? totalParticipants / this.rooms.size : 0,
    };
  }
}
