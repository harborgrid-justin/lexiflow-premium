/**
 * usePresence Hook
 * Track user presence and online status
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { websocketClient } from '../services/websocket/WebSocketClient';
import { WS_EVENTS, UserPresenceEvent } from '../services/websocket/eventHandlers';

export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen?: string;
}

/**
 * Hook to track presence of multiple users
 *
 * @param userIds - Array of user IDs to track (optional)
 * @returns Object with presence data and helper functions
 *
 * @example
 * const { presenceMap, isUserOnline, onlineUsers } = usePresence(['user1', 'user2']);
 *
 * if (isUserOnline('user1')) {
 *   console.log('User 1 is online');
 * }
 */
export function usePresence(userIds?: string[]) {
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(
    new Map(),
  );
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  // Update presence data
  const updatePresence = useCallback((event: UserPresenceEvent) => {
    setPresenceMap((prev) => {
      const next = new Map(prev);
      next.set(event.userId, {
        userId: event.userId,
        status: event.status,
        lastSeen: event.lastSeen,
      });
      return next;
    });

    // Update online users set
    setOnlineUserIds((prev) => {
      const next = new Set(prev);
      if (event.status === 'online') {
        next.add(event.userId);
      } else {
        next.delete(event.userId);
      }
      return next;
    });
  }, []);

  // Handle presence snapshot (initial state)
  const handlePresenceSnapshot = useCallback(
    (data: { users: UserPresenceEvent[] }) => {
      const newPresenceMap = new Map<string, UserPresence>();
      const newOnlineUsers = new Set<string>();

      data.users.forEach((user) => {
        newPresenceMap.set(user.userId, {
          userId: user.userId,
          status: user.status,
          lastSeen: user.lastSeen,
        });

        if (user.status === 'online') {
          newOnlineUsers.add(user.userId);
        }
      });

      setPresenceMap(newPresenceMap);
      setOnlineUserIds(newOnlineUsers);
    },
    [],
  );

  // Subscribe to presence events
  useEffect(() => {
    const unsubscribeUpdate = websocketClient.on(
      WS_EVENTS.PRESENCE_UPDATE,
      updatePresence,
    );
    const unsubscribeSnapshot = websocketClient.on(
      WS_EVENTS.PRESENCE_SNAPSHOT,
      handlePresenceSnapshot,
    );

    return () => {
      unsubscribeUpdate();
      unsubscribeSnapshot();
    };
  }, [updatePresence, handlePresenceSnapshot]);

  // Helper functions
  const isUserOnline = useCallback(
    (userId: string): boolean => {
      return onlineUserIds.has(userId);
    },
    [onlineUserIds],
  );

  const getUserPresence = useCallback(
    (userId: string): UserPresence | undefined => {
      return presenceMap.get(userId);
    },
    [presenceMap],
  );

  const getUserStatus = useCallback(
    (userId: string): PresenceStatus => {
      return presenceMap.get(userId)?.status || 'offline';
    },
    [presenceMap],
  );

  // Filter presence by provided user IDs
  const filteredPresence = userIds
    ? Array.from(presenceMap.entries())
        .filter(([userId]) => userIds.includes(userId))
        .reduce((acc, [userId, presence]) => {
          acc.set(userId, presence);
          return acc;
        }, new Map<string, UserPresence>())
    : presenceMap;

  const onlineUsers = Array.from(filteredPresence.values()).filter(
    (p) => p.status === 'online',
  );

  return {
    presenceMap: filteredPresence,
    onlineUsers,
    onlineUserIds: Array.from(onlineUserIds),
    isUserOnline,
    getUserPresence,
    getUserStatus,
  };
}

/**
 * Hook to manage current user's presence status
 *
 * @returns Object with status and setStatus function
 *
 * @example
 * const { status, setStatus } = useMyPresence();
 *
 * // Change status
 * setStatus('away');
 */
export function useMyPresence() {
  const [status, setStatusState] = useState<PresenceStatus>('online');

  const setStatus = useCallback((newStatus: PresenceStatus) => {
    setStatusState(newStatus);
    websocketClient.emit('presence:status_change', { status: newStatus });
  }, []);

  return {
    status,
    setStatus,
  };
}

/**
 * Hook to track typing indicators
 *
 * @param contextId - Context ID (conversation, document, etc.)
 * @param contextType - Context type
 * @returns Object with typing users and helper functions
 *
 * @example
 * const { typingUsers, startTyping, stopTyping } = useTypingIndicator(
 *   conversationId,
 *   'conversation'
 * );
 *
 * // Show typing indicator
 * if (typingUsers.length > 0) {
 *   console.log(`${typingUsers.length} users are typing...`);
 * }
 */
export function useTypingIndicator(
  contextId: string,
  contextType: 'conversation' | 'document' | 'comment',
) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Handle typing start
  const handleTypingStart = useCallback(
    (data: {
      userId: string;
      contextId: string;
      contextType: string;
      isTyping: boolean;
    }) => {
      if (data.contextId !== contextId || data.contextType !== contextType) {
        return;
      }

      if (data.isTyping) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.add(data.userId);
          return next;
        });

        // Clear existing timeout
        const existingTimeout = typingTimeouts.current.get(data.userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Auto-remove after 5 seconds
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Set(prev);
            next.delete(data.userId);
            return next;
          });
          typingTimeouts.current.delete(data.userId);
        }, 5000);

        typingTimeouts.current.set(data.userId, timeout);
      } else {
        // Stop typing
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });

        const timeout = typingTimeouts.current.get(data.userId);
        if (timeout) {
          clearTimeout(timeout);
          typingTimeouts.current.delete(data.userId);
        }
      }
    },
    [contextId, contextType],
  );

  // Subscribe to typing events
  useEffect(() => {
    const unsubscribe = websocketClient.on(
      WS_EVENTS.USER_TYPING,
      handleTypingStart,
    );

    return () => {
      unsubscribe();
      // Clear all timeouts
      typingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, [handleTypingStart]);

  // Helper functions
  const startTyping = useCallback(() => {
    websocketClient.emit('presence:typing', {
      contextId,
      contextType,
      isTyping: true,
    });
  }, [contextId, contextType]);

  const stopTyping = useCallback(() => {
    websocketClient.emit('presence:typing', {
      contextId,
      contextType,
      isTyping: false,
    });
  }, [contextId, contextType]);

  return {
    typingUsers: Array.from(typingUsers),
    isTyping: typingUsers.size > 0,
    startTyping,
    stopTyping,
  };
}

/**
 * Hook to track user activity
 *
 * @param activityType - Type of activity to track
 * @returns Function to emit activity
 *
 * @example
 * const emitActivity = useUserActivity('viewing_document');
 *
 * // Emit activity
 * emitActivity({ documentId: '123' });
 */
export function useUserActivity(activityType: string) {
  const emitActivity = useCallback(
    (context?: { contextId?: string; contextType?: string }) => {
      websocketClient.emit(WS_EVENTS.USER_ACTIVITY, {
        activityType,
        contextId: context?.contextId,
        contextType: context?.contextType,
        timestamp: new Date().toISOString(),
      });
    },
    [activityType],
  );

  return emitActivity;
}

export default usePresence;
