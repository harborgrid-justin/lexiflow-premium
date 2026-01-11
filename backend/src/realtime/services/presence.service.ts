import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";

/**
 * User Presence Status
 */
export enum PresenceStatus {
  ONLINE = "online",
  AWAY = "away",
  BUSY = "busy",
  OFFLINE = "offline",
}

/**
 * User Presence Information
 */
export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: Date;
  activeConnections: number;
  currentActivity?: string; // e.g., 'Viewing Case #12345'
  customStatus?: string; // e.g., 'In a meeting'
}

/**
 * Presence Update Event
 */
export interface PresenceUpdate {
  userId: string;
  status: PresenceStatus;
  lastSeen: string;
  activeConnections: number;
  currentActivity?: string;
  customStatus?: string;
  timestamp: string;
}

/**
 * Presence Service
 *
 * Tracks and manages user online/offline status with:
 * - Real-time presence tracking
 * - Auto-away detection (configurable timeout)
 * - Multi-device connection support
 * - Activity tracking
 * - Custom status messages
 * - Presence history
 *
 * Features:
 * - Automatic status updates based on activity
 * - Configurable away timeout (default: 5 minutes)
 * - Graceful cleanup on disconnect
 * - Batch presence updates for efficiency
 * - Memory-efficient with periodic cleanup
 *
 * @class PresenceService
 */
/**
 * ╔=================================================================================================================╗
 * ║PRESENCE                                                                                                         ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class PresenceService implements OnModuleDestroy {
  private readonly logger = new Logger(PresenceService.name);

  // User presence tracking
  private userPresence = new Map<string, UserPresence>();
  private userLastActivity = new Map<string, Date>();
  private userConnections = new Map<string, Set<string>>(); // userId -> Set<socketId>

  // Activity tracking
  private userActivities = new Map<string, string>(); // userId -> current activity
  private customStatuses = new Map<string, string>(); // userId -> custom status

  // Configuration
  private readonly AWAY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_PRESENCE_HISTORY = 1000; // Prevent memory leaks

  // Callbacks for presence updates
  private presenceUpdateCallbacks: Array<(update: PresenceUpdate) => void> = [];

  onModuleDestroy() {
    this.logger.log("Cleaning up presence service...");
    this.userPresence.clear();
    this.userLastActivity.clear();
    this.userConnections.clear();
    this.userActivities.clear();
    this.customStatuses.clear();
    this.presenceUpdateCallbacks = [];
    this.logger.log("Presence service cleaned up");
  }

  /**
   * Register a callback for presence updates
   */
  onPresenceUpdate(callback: (update: PresenceUpdate) => void) {
    this.presenceUpdateCallbacks.push(callback);
  }

  /**
   * User connected - update presence to online
   */
  userConnected(userId: string, socketId: string) {
    // Add connection
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    const userConns = this.userConnections.get(userId);
    if (userConns) {
      userConns.add(socketId);
    }

    // Update presence
    const existingPresence = this.userPresence.get(userId);
    const now = new Date();

    const presence: UserPresence = {
      userId,
      status: PresenceStatus.ONLINE,
      lastSeen: now,
      activeConnections: userConns?.size ?? 0,
      currentActivity: existingPresence?.currentActivity,
      customStatus: this.customStatuses.get(userId),
    };

    this.userPresence.set(userId, presence);
    this.userLastActivity.set(userId, now);

    this.logger.log(
      `User ${userId} connected (${presence.activeConnections} connection${presence.activeConnections > 1 ? "s" : ""})`
    );

    // Emit presence update
    this.emitPresenceUpdate(presence);
  }

  /**
   * User disconnected - update presence
   */
  userDisconnected(userId: string, socketId: string) {
    // Remove connection
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(socketId);

      const remainingConnections = connections.size;

      if (remainingConnections === 0) {
        // No more connections - mark as offline
        this.userConnections.delete(userId);
        const presence: UserPresence = {
          userId,
          status: PresenceStatus.OFFLINE,
          lastSeen: new Date(),
          activeConnections: 0,
        };
        this.userPresence.set(userId, presence);
        this.userActivities.delete(userId);

        this.logger.log(`User ${userId} fully disconnected`);
        this.emitPresenceUpdate(presence);
      } else {
        // Still has other connections
        const existingPresence = this.userPresence.get(userId);
        if (existingPresence) {
          existingPresence.activeConnections = remainingConnections;
          this.userPresence.set(userId, existingPresence);
        }

        this.logger.log(
          `User ${userId} disconnected (${remainingConnections} remaining)`
        );
        const currentPresence = this.userPresence.get(userId);
        if (currentPresence) {
          this.emitPresenceUpdate(currentPresence);
        }
      }
    }
  }

  /**
   * Update user activity
   */
  updateActivity(userId: string, activity: string) {
    this.userActivities.set(userId, activity);
    this.userLastActivity.set(userId, new Date());

    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.currentActivity = activity;
      presence.lastSeen = new Date();
      if (presence.status === PresenceStatus.AWAY) {
        presence.status = PresenceStatus.ONLINE;
      }
      this.userPresence.set(userId, presence);
      this.emitPresenceUpdate(presence);
    }
  }

  /**
   * Clear user activity
   */
  clearActivity(userId: string) {
    this.userActivities.delete(userId);
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.currentActivity = undefined;
      this.userPresence.set(userId, presence);
      this.emitPresenceUpdate(presence);
    }
  }

  /**
   * Set custom status
   */
  setCustomStatus(userId: string, status: string) {
    this.customStatuses.set(userId, status);
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.customStatus = status;
      this.userPresence.set(userId, presence);
      this.emitPresenceUpdate(presence);
    }
  }

  /**
   * Clear custom status
   */
  clearCustomStatus(userId: string) {
    this.customStatuses.delete(userId);
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.customStatus = undefined;
      this.userPresence.set(userId, presence);
      this.emitPresenceUpdate(presence);
    }
  }

  /**
   * Manually set user status
   */
  setStatus(userId: string, status: PresenceStatus) {
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.status = status;
      presence.lastSeen = new Date();
      this.userPresence.set(userId, presence);
      this.emitPresenceUpdate(presence);
      this.logger.log(`User ${userId} status set to ${status}`);
    }
  }

  /**
   * Record user heartbeat/activity
   */
  heartbeat(userId: string) {
    this.userLastActivity.set(userId, new Date());
    const presence = this.userPresence.get(userId);
    if (presence && presence.status === PresenceStatus.AWAY) {
      // User is back from away
      presence.status = PresenceStatus.ONLINE;
      presence.lastSeen = new Date();
      this.userPresence.set(userId, presence);
      this.emitPresenceUpdate(presence);
    }
  }

  /**
   * Get user presence
   */
  getUserPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  /**
   * Get multiple users' presence
   */
  getMultiplePresence(userIds: string[]): Map<string, UserPresence> {
    const presenceMap = new Map<string, UserPresence>();
    for (const userId of userIds) {
      const presence = this.userPresence.get(userId);
      if (presence) {
        presenceMap.set(userId, presence);
      } else {
        // Return offline status for users not in the map
        presenceMap.set(userId, {
          userId,
          status: PresenceStatus.OFFLINE,
          lastSeen: new Date(),
          activeConnections: 0,
        });
      }
    }
    return presenceMap;
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): UserPresence[] {
    return Array.from(this.userPresence.values()).filter(
      (p) => p.status !== PresenceStatus.OFFLINE
    );
  }

  /**
   * Get presence statistics
   */
  getStats() {
    const statusCounts = {
      online: 0,
      away: 0,
      busy: 0,
      offline: 0,
    };

    for (const presence of this.userPresence.values()) {
      statusCounts[presence.status]++;
    }

    const totalConnections = Array.from(this.userConnections.values()).reduce(
      (sum, connections) => sum + connections.size,
      0
    );

    return {
      totalUsers: this.userPresence.size,
      totalConnections,
      statusCounts,
      usersWithActivity: this.userActivities.size,
      usersWithCustomStatus: this.customStatuses.size,
    };
  }

  /**
   * Periodic cleanup of stale presence data and auto-away detection
   */
  @Interval(60000) // Run every minute
  // @ts-expect-error - Method is used by @Interval decorator
  private performCleanup() {
    const now = Date.now();
    let awayCount = 0;
    let cleanedCount = 0;

    for (const [userId, lastActivity] of this.userLastActivity.entries()) {
      const timeSinceActivity = now - lastActivity.getTime();

      // Check for away status
      if (timeSinceActivity > this.AWAY_TIMEOUT_MS) {
        const presence = this.userPresence.get(userId);
        if (presence && presence.status === PresenceStatus.ONLINE) {
          presence.status = PresenceStatus.AWAY;
          presence.lastSeen = new Date();
          this.userPresence.set(userId, presence);
          this.emitPresenceUpdate(presence);
          awayCount++;
        }
      }
    }

    // Cleanup offline users that have been offline for > 24 hours
    const OFFLINE_CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
    for (const [userId, presence] of this.userPresence.entries()) {
      if (presence.status === PresenceStatus.OFFLINE) {
        const timeSinceOffline = now - presence.lastSeen.getTime();
        if (timeSinceOffline > OFFLINE_CLEANUP_THRESHOLD) {
          this.userPresence.delete(userId);
          this.userLastActivity.delete(userId);
          this.userActivities.delete(userId);
          this.customStatuses.delete(userId);
          cleanedCount++;
        }
      }
    }

    // Enforce max presence history to prevent memory leaks
    if (this.userPresence.size > this.MAX_PRESENCE_HISTORY) {
      const entriesToRemove =
        this.userPresence.size - this.MAX_PRESENCE_HISTORY;
      const sortedByLastSeen = Array.from(this.userPresence.entries())
        .filter(([_, p]) => p.status === PresenceStatus.OFFLINE)
        .sort((a, b) => a[1].lastSeen.getTime() - b[1].lastSeen.getTime());

      for (
        let i = 0;
        i < Math.min(entriesToRemove, sortedByLastSeen.length);
        i++
      ) {
        const entry = sortedByLastSeen[i];
        if (!entry) continue;
        const [userId] = entry;
        this.userPresence.delete(userId);
        this.userLastActivity.delete(userId);
        this.userActivities.delete(userId);
        this.customStatuses.delete(userId);
        cleanedCount++;
      }
    }

    if (awayCount > 0 || cleanedCount > 0) {
      this.logger.debug(
        `Presence cleanup: ${awayCount} users marked away, ${cleanedCount} stale entries removed`
      );
    }
  }

  /**
   * Emit presence update to all callbacks
   */
  private emitPresenceUpdate(presence: UserPresence) {
    const update: PresenceUpdate = {
      userId: presence.userId,
      status: presence.status,
      lastSeen: presence.lastSeen.toISOString(),
      activeConnections: presence.activeConnections,
      currentActivity: presence.currentActivity,
      customStatus: presence.customStatus,
      timestamp: new Date().toISOString(),
    };

    for (const callback of this.presenceUpdateCallbacks) {
      try {
        callback(update);
      } catch (error) {
        this.logger.error("Error in presence update callback:", error);
      }
    }
  }
}
