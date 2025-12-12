/**
 * useOnlineStatus Hook
 * User online/offline status and presence tracking
 */

import { useEffect, useState, useCallback } from 'react';
import { websocketClient } from '../services/websocket/WebSocketClient';
import { WS_EVENTS } from '../services/websocket/eventHandlers';

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
  timestamp: string;
}

export interface UserActivity {
  userId: string;
  activityType: string;
  contextId?: string;
  contextType?: string;
  timestamp: string;
}

interface UseOnlineStatusOptions {
  userId?: string; // Specific user to track, or null for all users
  onStatusChange?: (presence: UserPresence) => void;
  onActivity?: (activity: UserActivity) => void;
}

/**
 * Hook for tracking user online status and presence
 *
 * @example
 * // Track specific user
 * const { isOnline, status, lastSeen } = useOnlineStatus({
 *   userId: 'user-123',
 * });
 *
 * // Track all online users
 * const { onlineUsers } = useOnlineStatus();
 */
export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const { userId, onStatusChange, onActivity } = options;

  const [userPresence, setUserPresence] = useState<Map<string, UserPresence>>(new Map());
  const [userActivities, setUserActivities] = useState<Map<string, UserActivity>>(new Map());

  // Get specific user's status
  const getUserStatus = useCallback((uid: string) => {
    return userPresence.get(uid)?.status || 'offline';
  }, [userPresence]);

  // Check if specific user is online
  const isUserOnline = useCallback((uid: string) => {
    const status = getUserStatus(uid);
    return status === 'online' || status === 'away' || status === 'busy';
  }, [getUserStatus]);

  // Get all online users
  const getOnlineUsers = useCallback(() => {
    return Array.from(userPresence.values()).filter(p =>
      p.status === 'online' || p.status === 'away' || p.status === 'busy'
    );
  }, [userPresence]);

  // Get user's last seen time
  const getLastSeen = useCallback((uid: string) => {
    return userPresence.get(uid)?.lastSeen;
  }, [userPresence]);

  // Get user's current activity
  const getUserActivity = useCallback((uid: string) => {
    return userActivities.get(uid);
  }, [userActivities]);

  // Set own status
  const setStatus = useCallback((status: 'online' | 'away' | 'busy') => {
    websocketClient.emit('presence:status_change', { status });
  }, []);

  // Handle presence update
  useEffect(() => {
    const handlePresenceUpdate = (data: UserPresence) => {
      setUserPresence(prev => {
        const next = new Map(prev);
        next.set(data.userId, data);
        return next;
      });

      // Trigger callback if monitoring specific user or all users
      if (!userId || data.userId === userId) {
        onStatusChange?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.PRESENCE_UPDATE, handlePresenceUpdate);
    return () => websocketClient.off(WS_EVENTS.PRESENCE_UPDATE, handlePresenceUpdate);
  }, [userId, onStatusChange]);

  // Handle presence snapshot (initial state)
  useEffect(() => {
    const handlePresenceSnapshot = (data: { users: UserPresence[] }) => {
      setUserPresence(prev => {
        const next = new Map(prev);
        data.users.forEach(user => {
          next.set(user.userId, user);
        });
        return next;
      });
    };

    websocketClient.on(WS_EVENTS.PRESENCE_SNAPSHOT, handlePresenceSnapshot);
    return () => websocketClient.off(WS_EVENTS.PRESENCE_SNAPSHOT, handlePresenceSnapshot);
  }, []);

  // Handle user activity
  useEffect(() => {
    const handleUserActivity = (data: UserActivity) => {
      setUserActivities(prev => {
        const next = new Map(prev);
        next.set(data.userId, data);
        return next;
      });

      // Trigger callback if monitoring specific user or all users
      if (!userId || data.userId === userId) {
        onActivity?.(data);
      }
    };

    websocketClient.on(WS_EVENTS.USER_ACTIVITY, handleUserActivity);
    return () => websocketClient.off(WS_EVENTS.USER_ACTIVITY, handleUserActivity);
  }, [userId, onActivity]);

  // For specific user tracking
  if (userId) {
    const presence = userPresence.get(userId);
    const activity = userActivities.get(userId);

    return {
      isOnline: isUserOnline(userId),
      status: presence?.status || 'offline',
      lastSeen: presence?.lastSeen,
      activity,
      setStatus,
    };
  }

  // For all users tracking
  return {
    onlineUsers: getOnlineUsers(),
    userPresence: Array.from(userPresence.values()),
    getUserStatus,
    isUserOnline,
    getLastSeen,
    getUserActivity,
    setStatus,
  };
}

export default useOnlineStatus;
