import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export interface CursorPosition {
  userId: string;
  userName: string;
  userColor: string;
  documentId: string;
  position: {
    x: number;
    y: number;
    line?: number;
    column?: number;
    elementId?: string;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  timestamp: Date;
  isIdle?: boolean;
}

export interface CursorUpdate {
  documentId: string;
  position: {
    x: number;
    y: number;
    line?: number;
    column?: number;
    elementId?: string;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

@Injectable()
export class LiveCursorsService {
  private readonly logger = new Logger(LiveCursorsService.name);
  private cursors = new Map<string, Map<string, CursorPosition>>(); // documentId -> userId -> cursor
  private userColors = new Map<string, string>();
  private colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B4D9', '#A2D9A2',
    '#FFB6C1', '#87CEEB', '#DDA0DD', '#F0E68C', '#E0BBE4',
  ];
  private nextColorIndex = 0;
  private idleTimeouts = new Map<string, NodeJS.Timeout>();
  private readonly IDLE_TIMEOUT = 30000; // 30 seconds

  /**
   * Update cursor position for a user
   */
  updateCursor(
    userId: string,
    userName: string,
    update: CursorUpdate,
  ): CursorPosition {
    const { documentId, position, selection } = update;

    // Get or assign user color
    if (!this.userColors.has(userId)) {
      this.userColors.set(userId, this.assignColor());
    }

    const userColor = this.userColors.get(userId)!;

    // Get or create document cursor map
    if (!this.cursors.has(documentId)) {
      this.cursors.set(documentId, new Map());
    }

    const cursor: CursorPosition = {
      userId,
      userName,
      userColor,
      documentId,
      position,
      selection,
      timestamp: new Date(),
      isIdle: false,
    };

    this.cursors.get(documentId)!.set(userId, cursor);

    // Reset idle timeout
    this.resetIdleTimeout(documentId, userId);

    return cursor;
  }

  /**
   * Remove cursor for a user in a document
   */
  removeCursor(documentId: string, userId: string): void {
    const documentCursors = this.cursors.get(documentId);

    if (documentCursors) {
      documentCursors.delete(userId);

      // Clean up empty document map
      if (documentCursors.size === 0) {
        this.cursors.delete(documentId);
      }
    }

    // Clear idle timeout
    this.clearIdleTimeout(documentId, userId);
  }

  /**
   * Get all cursors for a document
   */
  getDocumentCursors(documentId: string): CursorPosition[] {
    const documentCursors = this.cursors.get(documentId);

    if (!documentCursors) {
      return [];
    }

    return Array.from(documentCursors.values());
  }

  /**
   * Get cursor for specific user in document
   */
  getUserCursor(documentId: string, userId: string): CursorPosition | undefined {
    return this.cursors.get(documentId)?.get(userId);
  }

  /**
   * Mark cursor as idle
   */
  markCursorIdle(documentId: string, userId: string): void {
    const cursor = this.cursors.get(documentId)?.get(userId);

    if (cursor) {
      cursor.isIdle = true;
      this.cursors.get(documentId)!.set(userId, cursor);
    }
  }

  /**
   * Mark cursor as active
   */
  markCursorActive(documentId: string, userId: string): void {
    const cursor = this.cursors.get(documentId)?.get(userId);

    if (cursor) {
      cursor.isIdle = false;
      cursor.timestamp = new Date();
      this.cursors.get(documentId)!.set(userId, cursor);
      this.resetIdleTimeout(documentId, userId);
    }
  }

  /**
   * Get active cursor count for document
   */
  getActiveCursorCount(documentId: string): number {
    const documentCursors = this.cursors.get(documentId);

    if (!documentCursors) {
      return 0;
    }

    return Array.from(documentCursors.values()).filter((c) => !c.isIdle).length;
  }

  /**
   * Clean up cursors for user across all documents
   */
  cleanupUserCursors(userId: string): void {
    this.cursors.forEach((documentCursors, documentId) => {
      this.removeCursor(documentId, userId);
    });

    // Release user color
    this.userColors.delete(userId);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalDocuments: number;
    totalCursors: number;
    activeCursors: number;
    documentsWithActivity: string[];
  } {
    let totalCursors = 0;
    let activeCursors = 0;
    const documentsWithActivity: string[] = [];

    this.cursors.forEach((documentCursors, documentId) => {
      const cursors = Array.from(documentCursors.values());
      totalCursors += cursors.length;
      activeCursors += cursors.filter((c) => !c.isIdle).length;

      if (cursors.length > 0) {
        documentsWithActivity.push(documentId);
      }
    });

    return {
      totalDocuments: this.cursors.size,
      totalCursors,
      activeCursors,
      documentsWithActivity,
    };
  }

  /**
   * Throttle cursor updates (for performance)
   */
  shouldThrottleUpdate(
    documentId: string,
    userId: string,
    minInterval: number = 50,
  ): boolean {
    const cursor = this.cursors.get(documentId)?.get(userId);

    if (!cursor) {
      return false;
    }

    const timeSinceLastUpdate = Date.now() - cursor.timestamp.getTime();
    return timeSinceLastUpdate < minInterval;
  }

  /**
   * Broadcast cursor update to document participants
   */
  broadcastCursorUpdate(
    server: Server,
    documentId: string,
    cursor: CursorPosition,
    excludeUserId?: string,
  ): void {
    const room = `doc:${documentId}`;

    if (excludeUserId) {
      server
        .to(room)
        .except(`user:${excludeUserId}`)
        .emit('cursor:update', cursor);
    } else {
      server.to(room).emit('cursor:update', cursor);
    }
  }

  /**
   * Broadcast cursor removal to document participants
   */
  broadcastCursorRemoved(
    server: Server,
    documentId: string,
    userId: string,
  ): void {
    server.to(`doc:${documentId}`).emit('cursor:removed', {
      documentId,
      userId,
    });
  }

  private assignColor(): string {
    const color = this.colorPalette[this.nextColorIndex];
    this.nextColorIndex = (this.nextColorIndex + 1) % this.colorPalette.length;
    return color;
  }

  private resetIdleTimeout(documentId: string, userId: string): void {
    const key = `${documentId}:${userId}`;

    // Clear existing timeout
    this.clearIdleTimeout(documentId, userId);

    // Set new timeout
    const timeout = setTimeout(() => {
      this.markCursorIdle(documentId, userId);
    }, this.IDLE_TIMEOUT);

    this.idleTimeouts.set(key, timeout);
  }

  private clearIdleTimeout(documentId: string, userId: string): void {
    const key = `${documentId}:${userId}`;
    const timeout = this.idleTimeouts.get(key);

    if (timeout) {
      clearTimeout(timeout);
      this.idleTimeouts.delete(key);
    }
  }

  /**
   * Cleanup old cursors (should be called periodically)
   */
  cleanupStaleCursors(maxAge: number = 300000): void {
    const now = Date.now();
    const staleThreshold = now - maxAge;
    let cleanedCount = 0;

    this.cursors.forEach((documentCursors, documentId) => {
      documentCursors.forEach((cursor, userId) => {
        if (cursor.timestamp.getTime() < staleThreshold) {
          this.removeCursor(documentId, userId);
          cleanedCount++;
        }
      });
    });

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} stale cursors`);
    }
  }
}
