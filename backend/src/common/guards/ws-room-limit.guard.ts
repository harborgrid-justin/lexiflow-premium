import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

interface SocketWithUserId extends Socket {
  userId?: string;
}

/**
 * WebSocket Room Limit Service
 *
 * Tracks and limits the number of rooms a user can subscribe to,
 * preventing memory exhaustion from unlimited room subscriptions.
 */
@Injectable()
export class WsRoomLimitGuard implements OnModuleDestroy {
  private readonly logger = new Logger(WsRoomLimitGuard.name);
  private userRoomCounts = new Map<string, Set<string>>();
  private cleanupInterval: NodeJS.Timeout;

  private readonly maxRoomsPerUser: number;

  constructor(private configService: ConfigService) {
    this.maxRoomsPerUser = this.configService.get<number>(
      'resourceLimits.websocket.maxRoomsPerUser',
      50,
    );

    this.cleanupInterval = setInterval(() => this.cleanup(), 3600000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private cleanup() {
    // This is a safety net. Normally cleanupUser handles this.
    // But if we have stale entries for some reason, we might want to check connectivity.
    // Since we don't have access to socket server here easily to check connectivity,
    // we rely on cleanupUser.
    // However, we can log stats or clear if empty.
    let emptyCount = 0;
    for (const [userId, rooms] of this.userRoomCounts.entries()) {
      if (rooms.size === 0) {
        this.userRoomCounts.delete(userId);
        emptyCount++;
      }
    }
    if (emptyCount > 0) {
      this.logger.debug(`Cleaned up ${emptyCount} empty user room entries`);
    }
  }

  /**
   * Check if user can join a room
   */
  canJoinRoom(client: SocketWithUserId, roomId: string): {
    allowed: boolean;
    reason?: string;
    currentCount?: number;
  } {
    const userId = this.extractUserId(client);

    if (!userId) {
      // Allow anonymous users but track by socket ID
      return { allowed: true };
    }

    // Get user's current rooms
    const userRooms = this.userRoomCounts.get(userId) || new Set<string>();

    // Check if already in room
    if (userRooms.has(roomId)) {
      return { allowed: true, currentCount: userRooms.size };
    }

    // Check if limit would be exceeded
    if (userRooms.size >= this.maxRoomsPerUser) {
      this.logger.warn(
        `User ${userId} cannot join room ${roomId}: limit of ${this.maxRoomsPerUser} rooms reached`,
      );
      return {
        allowed: false,
        reason: `Maximum ${this.maxRoomsPerUser} concurrent room subscriptions allowed`,
        currentCount: userRooms.size,
      };
    }

    // Add room to user's set
    userRooms.add(roomId);
    this.userRoomCounts.set(userId, userRooms);

    this.logger.debug(
      `User ${userId} joined room ${roomId} (${userRooms.size}/${this.maxRoomsPerUser})`,
    );

    return { allowed: true, currentCount: userRooms.size };
  }

  /**
   * Remove room from user's tracking
   */
  leaveRoom(client: SocketWithUserId, roomId: string): void {
    const userId = this.extractUserId(client);

    if (!userId) return;

    const userRooms = this.userRoomCounts.get(userId);
    if (userRooms) {
      userRooms.delete(roomId);

      if (userRooms.size === 0) {
        this.userRoomCounts.delete(userId);
      }

      this.logger.debug(
        `User ${userId} left room ${roomId} (${userRooms.size}/${this.maxRoomsPerUser})`,
      );
    }
  }

  /**
   * Clean up all rooms for a user (called on disconnect)
   */
  cleanupUser(client: SocketWithUserId): void {
    const userId = this.extractUserId(client);

    if (userId) {
      const roomCount = this.userRoomCounts.get(userId)?.size || 0;
      this.userRoomCounts.delete(userId);

      if (roomCount > 0) {
        this.logger.debug(`Cleaned up ${roomCount} rooms for user ${userId}`);
      }
    }
  }

  /**
   * Get user's current room count
   */
  getUserRoomCount(client: SocketWithUserId): number {
    const userId = this.extractUserId(client);
    return userId ? (this.userRoomCounts.get(userId)?.size || 0) : 0;
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      totalUsers: this.userRoomCounts.size,
      maxRoomsPerUser: this.maxRoomsPerUser,
      userStats: [] as Array<{ userId: string; roomCount: number }>,
    };

    for (const [userId, rooms] of this.userRoomCounts.entries()) {
      stats.userStats.push({
        userId,
        roomCount: rooms.size,
      });
    }

    return stats;
  }

  private extractUserId(client: SocketWithUserId): string | null {
    const queryUserId = client.handshake.query.userId;
    return client.userId || (typeof queryUserId === 'string' ? queryUserId : null);
  }
}
