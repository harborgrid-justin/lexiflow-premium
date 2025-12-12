/**
 * Presence Event Handlers
 * Real-time event handlers for user presence and activity tracking
 */

import { Injectable, Logger } from '@nestjs/common';
import { WebSocketService } from '../websocket.service';
import type { UserPresenceEvent, UserActivityEvent } from './event-types';

/**
 * Presence Event Emitter
 * Handles broadcasting of presence-related events
 */
@Injectable()
export class PresenceEventEmitter {
  private logger = new Logger('PresenceEventEmitter');
  private userPresence: Map<
    string,
    {
      status: 'online' | 'offline' | 'away' | 'busy';
      lastSeen: string;
      currentActivity?: string;
    }
  > = new Map();

  constructor(private websocketService: WebSocketService) {}

  /**
   * Update user presence status
   */
  updateUserPresence(
    userId: string,
    status: 'online' | 'offline' | 'away' | 'busy',
  ): void {
    this.logger.log(`Updating user presence: ${userId} -> ${status}`);

    const presence = this.userPresence.get(userId) || {
      status: 'offline',
      lastSeen: new Date().toISOString(),
    };

    presence.status = status;
    presence.lastSeen = new Date().toISOString();

    this.userPresence.set(userId, presence);

    // Broadcast presence update
    const event: UserPresenceEvent = {
      userId,
      status,
      lastSeen: status === 'offline' ? presence.lastSeen : undefined,
      timestamp: new Date().toISOString(),
    };

    this.websocketService.broadcastToAll('presence:update', event);
  }

  /**
   * Get user presence status
   */
  getUserPresence(userId: string): {
    status: 'online' | 'offline' | 'away' | 'busy';
    lastSeen: string;
    currentActivity?: string;
  } | null {
    return this.userPresence.get(userId) || null;
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): string[] {
    return this.websocketService.getOnlineUsers();
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.websocketService.isUserOnline(userId);
  }

  /**
   * Emit user activity event
   */
  emitUserActivity(event: UserActivityEvent): void {
    this.logger.log(`Emitting user activity: ${event.userId} - ${event.activityType}`);

    // Update current activity
    const presence = this.userPresence.get(event.userId);
    if (presence) {
      presence.currentActivity = event.activityType;
      this.userPresence.set(event.userId, presence);
    }

    this.websocketService.broadcastUserActivity(event);
  }

  /**
   * Emit user viewing case
   */
  emitUserViewingCase(data: { userId: string; caseId: string }): void {
    this.emitUserActivity({
      userId: data.userId,
      activityType: 'viewing_case',
      contextId: data.caseId,
      contextType: 'case',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit user editing document
   */
  emitUserEditingDocument(data: { userId: string; documentId: string }): void {
    this.emitUserActivity({
      userId: data.userId,
      activityType: 'editing_document',
      contextId: data.documentId,
      contextType: 'document',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit user in meeting
   */
  emitUserInMeeting(data: { userId: string; meetingId: string }): void {
    this.emitUserActivity({
      userId: data.userId,
      activityType: 'in_meeting',
      contextId: data.meetingId,
      contextType: 'meeting',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get users viewing specific resource
   */
  getUsersViewingResource(resourceType: string, resourceId: string): string[] {
    const viewers: string[] = [];

    this.userPresence.forEach((presence, userId) => {
      if (
        presence.currentActivity?.includes(resourceType) &&
        this.isUserOnline(userId)
      ) {
        viewers.push(userId);
      }
    });

    return viewers;
  }

  /**
   * Emit presence snapshot to user
   */
  emitPresenceSnapshot(userId: string): void {
    const onlineUsers = this.getOnlineUsers();
    const snapshot = onlineUsers.map((uid) => ({
      userId: uid,
      status: this.userPresence.get(uid)?.status || 'online',
      currentActivity: this.userPresence.get(uid)?.currentActivity,
      timestamp: new Date().toISOString(),
    }));

    this.websocketService.sendToUser(userId, 'presence:snapshot', {
      users: snapshot,
    });
  }

  /**
   * Cleanup user presence (on disconnect)
   */
  cleanupUserPresence(userId: string): void {
    const presence = this.userPresence.get(userId);
    if (presence) {
      presence.status = 'offline';
      presence.lastSeen = new Date().toISOString();
      presence.currentActivity = undefined;
      this.userPresence.set(userId, presence);
    }

    this.updateUserPresence(userId, 'offline');
  }

  /**
   * Emit heartbeat/keepalive
   */
  emitHeartbeat(userId: string): void {
    const presence = this.userPresence.get(userId);
    if (presence && presence.status !== 'offline') {
      presence.lastSeen = new Date().toISOString();
      this.userPresence.set(userId, presence);
    }
  }
}
