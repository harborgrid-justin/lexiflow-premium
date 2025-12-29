import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * User Presence Status
 */
export enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline',
}

/**
 * User Presence Information
 */
export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: string;
  activeConnections: number;
  currentActivity?: string;
  customStatus?: string;
  timestamp?: string;
}

/**
 * Presence Options
 */
export interface PresenceOptions {
  namespace?: string;
  enabled?: boolean;
  heartbeatInterval?: number; // in milliseconds
  onPresenceUpdate?: (presence: UserPresence) => void;
}

/**
 * usePresence Hook
 *
 * Track and manage user presence (online/offline status) with real-time updates.
 *
 * Features:
 * - Real-time presence tracking for multiple users
 * - Automatic heartbeat to maintain online status
 * - Custom status messages
 * - Activity tracking
 * - Bulk presence queries
 * - Optimistic updates
 *
 * @example
 * ```tsx
 * // Track presence for multiple users
 * const { presenceMap, getPresence, setStatus, setActivity } = usePresence();
 *
 * // Get specific user's presence
 * const userPresence = getPresence('user-123');
 *
 * // Set your own status
 * setStatus(PresenceStatus.BUSY);
 *
 * // Set activity
 * setActivity('Reviewing case #12345');
 * ```
 */
export function usePresence(options: PresenceOptions = {}) {
  const {
    namespace = '/events',
    enabled = true,
    heartbeatInterval = 30000, // 30 seconds
    onPresenceUpdate,
  } = options;

  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map());
  const [myStatus, setMyStatus] = useState<PresenceStatus>(PresenceStatus.ONLINE);
  const [myActivity, setMyActivity] = useState<string | undefined>();
  const [myCustomStatus, setMyCustomStatus] = useState<string | undefined>();

  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, isConnected, emit, on, off } = useWebSocket({
    namespace,
    autoConnect: enabled,
  });

  /**
   * Handle presence update from server
   */
  const handlePresenceUpdate = useCallback(
    (update: UserPresence) => {
      setPresenceMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(update.userId, update);
        return newMap;
      });

      onPresenceUpdate?.(update);
    },
    [onPresenceUpdate],
  );

  /**
   * Handle bulk presence updates
   */
  const handleBulkPresenceUpdate = useCallback(
    (data: { users: Array<{ userId: string; status: PresenceStatus; lastSeen: string }> }) => {
      setPresenceMap((prev) => {
        const newMap = new Map(prev);
        for (const user of data.users) {
          newMap.set(user.userId, {
            ...user,
            activeConnections: 1,
          });
        }
        return newMap;
      });
    },
    [],
  );

  /**
   * Set up presence event listeners
   */
  useEffect(() => {
    if (!socket || !enabled) return;

    on('presence:update', handlePresenceUpdate);
    on('presence:bulk-update', handleBulkPresenceUpdate);

    return () => {
      off('presence:update', handlePresenceUpdate);
      off('presence:bulk-update', handleBulkPresenceUpdate);
    };
  }, [socket, enabled, on, off, handlePresenceUpdate, handleBulkPresenceUpdate]);

  /**
   * Send heartbeat to maintain online status
   */
  const sendHeartbeat = useCallback(() => {
    if (!socket || !isConnected) return;

    emit('presence:heartbeat', {
      status: myStatus,
      activity: myActivity,
      customStatus: myCustomStatus,
    }).catch((error) => {
      console.error('Failed to send presence heartbeat:', error);
    });
  }, [socket, isConnected, emit, myStatus, myActivity, myCustomStatus]);

  /**
   * Set up heartbeat interval
   */
  useEffect(() => {
    if (!isConnected || !enabled) {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      return;
    }

    // Send initial heartbeat
    sendHeartbeat();

    // Set up periodic heartbeat
    heartbeatTimerRef.current = setInterval(sendHeartbeat, heartbeatInterval);

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, [isConnected, enabled, sendHeartbeat, heartbeatInterval]);

  /**
   * Get presence for specific user
   */
  const getPresence = useCallback(
    (userId: string): UserPresence | null => {
      return presenceMap.get(userId) || null;
    },
    [presenceMap],
  );

  /**
   * Get presence for multiple users
   */
  const getMultiplePresence = useCallback(
    (userIds: string[]): Map<string, UserPresence> => {
      const result = new Map<string, UserPresence>();
      for (const userId of userIds) {
        const presence = presenceMap.get(userId);
        if (presence) {
          result.set(userId, presence);
        } else {
          // Return offline status for unknown users
          result.set(userId, {
            userId,
            status: PresenceStatus.OFFLINE,
            lastSeen: new Date().toISOString(),
            activeConnections: 0,
          });
        }
      }
      return result;
    },
    [presenceMap],
  );

  /**
   * Get all online users
   */
  const getOnlineUsers = useCallback((): UserPresence[] => {
    return Array.from(presenceMap.values()).filter(
      (p) => p.status !== PresenceStatus.OFFLINE,
    );
  }, [presenceMap]);

  /**
   * Check if user is online
   */
  const isUserOnline = useCallback(
    (userId: string): boolean => {
      const presence = presenceMap.get(userId);
      return presence ? presence.status !== PresenceStatus.OFFLINE : false;
    },
    [presenceMap],
  );

  /**
   * Set your own status
   */
  const setStatus = useCallback(
    async (status: PresenceStatus) => {
      if (!socket || !isConnected) return;

      // Optimistic update
      setMyStatus(status);

      try {
        await emit('presence:set-status', { status });
      } catch (error) {
        console.error('Failed to set presence status:', error);
      }
    },
    [socket, isConnected, emit],
  );

  /**
   * Set your current activity
   */
  const setActivity = useCallback(
    async (activity: string | undefined) => {
      if (!socket || !isConnected) return;

      // Optimistic update
      setMyActivity(activity);

      // Clear existing timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = null;
      }

      try {
        if (activity) {
          await emit('presence:set-activity', { activity });

          // Auto-clear activity after 5 minutes
          activityTimeoutRef.current = setTimeout(() => {
            setActivity(undefined);
          }, 5 * 60 * 1000);
        } else {
          await emit('presence:clear-activity', {});
        }
      } catch (error) {
        console.error('Failed to set presence activity:', error);
      }
    },
    [socket, isConnected, emit],
  );

  /**
   * Set custom status message
   */
  const setCustomStatus = useCallback(
    async (status: string | undefined) => {
      if (!socket || !isConnected) return;

      // Optimistic update
      setMyCustomStatus(status);

      try {
        if (status) {
          await emit('presence:set-custom-status', { customStatus: status });
        } else {
          await emit('presence:clear-custom-status', {});
        }
      } catch (error) {
        console.error('Failed to set custom status:', error);
      }
    },
    [socket, isConnected, emit],
  );

  /**
   * Subscribe to specific users' presence
   */
  const subscribeToUsers = useCallback(
    async (userIds: string[]) => {
      if (!socket || !isConnected || userIds.length === 0) return;

      try {
        await emit('presence:subscribe', { userIds });
      } catch (error) {
        console.error('Failed to subscribe to user presence:', error);
      }
    },
    [socket, isConnected, emit],
  );

  /**
   * Unsubscribe from users' presence
   */
  const unsubscribeFromUsers = useCallback(
    async (userIds: string[]) => {
      if (!socket || !isConnected || userIds.length === 0) return;

      try {
        await emit('presence:unsubscribe', { userIds });

        // Remove from local map
        setPresenceMap((prev) => {
          const newMap = new Map(prev);
          for (const userId of userIds) {
            newMap.delete(userId);
          }
          return newMap;
        });
      } catch (error) {
        console.error('Failed to unsubscribe from user presence:', error);
      }
    },
    [socket, isConnected, emit],
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, []);

  return {
    presenceMap,
    myStatus,
    myActivity,
    myCustomStatus,
    isConnected,
    getPresence,
    getMultiplePresence,
    getOnlineUsers,
    isUserOnline,
    setStatus,
    setActivity,
    setCustomStatus,
    subscribeToUsers,
    unsubscribeFromUsers,
  };
}

/**
 * useUserPresence Hook
 *
 * Track presence for a specific user.
 *
 * @example
 * ```tsx
 * const { presence, isOnline, isAway } = useUserPresence('user-123');
 * ```
 */
export function useUserPresence(userId: string) {
  const { getPresence, subscribeToUsers, unsubscribeFromUsers } = usePresence();

  const presence = getPresence(userId);

  useEffect(() => {
    if (userId) {
      subscribeToUsers([userId]);
      return () => {
        unsubscribeFromUsers([userId]);
      };
    }
    return undefined;
  }, [userId, subscribeToUsers, unsubscribeFromUsers]);

  return {
    presence,
    isOnline: presence?.status === PresenceStatus.ONLINE,
    isAway: presence?.status === PresenceStatus.AWAY,
    isBusy: presence?.status === PresenceStatus.BUSY,
    isOffline: !presence || presence.status === PresenceStatus.OFFLINE,
    lastSeen: presence?.lastSeen,
    currentActivity: presence?.currentActivity,
    customStatus: presence?.customStatus,
  };
}

/**
 * useMultiUserPresence Hook
 *
 * Track presence for multiple users efficiently.
 *
 * @example
 * ```tsx
 * const userIds = ['user-1', 'user-2', 'user-3'];
 * const { presenceMap, onlineCount, offlineCount } = useMultiUserPresence(userIds);
 * ```
 */
export function useMultiUserPresence(userIds: string[]) {
  const { getMultiplePresence, subscribeToUsers, unsubscribeFromUsers } = usePresence();

  const presenceMap = getMultiplePresence(userIds);

  useEffect(() => {
    if (userIds.length > 0) {
      subscribeToUsers(userIds);
      return () => {
        unsubscribeFromUsers(userIds);
      };
    }
    return undefined;
  }, [userIds.join(','), subscribeToUsers, unsubscribeFromUsers]);

  const onlineCount = Array.from(presenceMap.values()).filter(
    (p) => p.status === PresenceStatus.ONLINE,
  ).length;

  const awayCount = Array.from(presenceMap.values()).filter(
    (p) => p.status === PresenceStatus.AWAY,
  ).length;

  const busyCount = Array.from(presenceMap.values()).filter(
    (p) => p.status === PresenceStatus.BUSY,
  ).length;

  const offlineCount = Array.from(presenceMap.values()).filter(
    (p) => p.status === PresenceStatus.OFFLINE,
  ).length;

  return {
    presenceMap,
    onlineCount,
    awayCount,
    busyCount,
    offlineCount,
    totalCount: userIds.length,
  };
}

/**
 * Presence Status Badge Component Helper
 *
 * Get color and label for presence status display.
 */
export function getPresenceStatusDisplay(status: PresenceStatus): {
  color: string;
  label: string;
  icon: string;
} {
  switch (status) {
    case PresenceStatus.ONLINE:
      return { color: 'green', label: 'Online', icon: '●' };
    case PresenceStatus.AWAY:
      return { color: 'yellow', label: 'Away', icon: '◐' };
    case PresenceStatus.BUSY:
      return { color: 'red', label: 'Busy', icon: '⊖' };
    case PresenceStatus.OFFLINE:
      return { color: 'gray', label: 'Offline', icon: '○' };
    default:
      return { color: 'gray', label: 'Unknown', icon: '?' };
  }
}

/**
 * Format last seen time
 */
export function formatLastSeen(lastSeen: string): string {
  const date = new Date(lastSeen);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}
