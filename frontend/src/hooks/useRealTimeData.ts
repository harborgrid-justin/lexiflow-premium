import { useEffect, useState, useCallback, useRef } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * Real-time Data Subscription Options
 */
export interface RealTimeDataOptions<T> {
  namespace?: string;
  eventName: string;
  subscribeEvent?: string;
  unsubscribeEvent?: string;
  subscribeData?: Record<string, unknown>;
  initialData?: T;
  enabled?: boolean;
  onData?: (data: T) => void;
  onError?: (error: Error) => void;
  transform?: (data: unknown) => T;
}

/**
 * Real-time Data State
 */
export interface RealTimeDataState<T> {
  data: T | null;
  isLoading: boolean;
  isSubscribed: boolean;
  error: Error | null;
  lastUpdate: Date | null;
}

/**
 * useRealTimeData Hook
 *
 * Subscribe to real-time data updates via WebSocket with automatic
 * subscription management and state tracking.
 *
 * Features:
 * - Automatic subscription/unsubscription
 * - Data transformation
 * - Error handling
 * - Loading states
 * - Timestamp tracking
 * - Conditional subscription
 * - Type-safe data handling
 *
 * @example
 * ```tsx
 * // Subscribe to dashboard metrics
 * const { data, isLoading, error } = useRealTimeData({
 *   namespace: '/dashboard',
 *   eventName: 'dashboard:metrics',
 *   subscribeEvent: 'dashboard:subscribe',
 *   subscribeData: { types: ['metrics'] },
 * });
 *
 * // Subscribe to case updates
 * const { data: caseData } = useRealTimeData({
 *   namespace: '/events',
 *   eventName: 'case:updated',
 *   subscribeEvent: 'subscribe:case',
 *   subscribeData: { caseId: '123' },
 *   unsubscribeEvent: 'unsubscribe:case',
 * });
 *
 * // Subscribe to notifications
 * const { data: notifications } = useRealTimeData({
 *   namespace: '/notifications',
 *   eventName: 'notification:new',
 *   onData: (notification) => showToast(notification.title),
 * });
 * ```
 */
export function useRealTimeData<T = unknown>(
  options: RealTimeDataOptions<T>,
): RealTimeDataState<T> & {
  subscribe: () => void;
  unsubscribe: () => void;
  refresh: () => void;
} {
  const {
    namespace = '',
    eventName,
    subscribeEvent,
    unsubscribeEvent,
    subscribeData,
    initialData = null,
    enabled = true,
    onData,
    onError,
    transform,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const isSubscribedRef = useRef(false);

  const { socket, isConnected, emit, on, off } = useWebSocket({
    namespace,
    autoConnect: enabled,
  });

  /**
   * Handle incoming data
   */
  const handleData = useCallback(
    (rawData: unknown) => {
      try {
        const transformedData = transform ? transform(rawData) : (rawData as T);
        setData(transformedData);
        setLastUpdate(new Date());
        setError(null);
        onData?.(transformedData);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    },
    [transform, onData, onError],
  );

  /**
   * Subscribe to updates
   */
  const subscribe = useCallback(async () => {
    if (!socket || !isConnected || isSubscribedRef.current) {
      return;
    }

    try {
      setIsLoading(true);

      // If there's a subscription event, emit it
      if (subscribeEvent) {
        await emit(subscribeEvent, subscribeData);
      }

      isSubscribedRef.current = true;
      setIsSubscribed(true);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [socket, isConnected, subscribeEvent, subscribeData, emit, onError]);

  /**
   * Unsubscribe from updates
   */
  const unsubscribe = useCallback(async () => {
    if (!socket || !isSubscribedRef.current) {
      return;
    }

    try {
      // If there's an unsubscription event, emit it
      if (unsubscribeEvent) {
        await emit(unsubscribeEvent, subscribeData);
      }

      isSubscribedRef.current = false;
      setIsSubscribed(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    }
  }, [socket, unsubscribeEvent, subscribeData, emit, onError]);

  /**
   * Refresh data (re-subscribe)
   */
  const refresh = useCallback(() => {
    if (isSubscribedRef.current) {
      unsubscribe();
    }
    subscribe();
  }, [subscribe, unsubscribe]);

  /**
   * Set up event listener
   */
  useEffect(() => {
    if (!socket || !enabled) return;

    on(eventName, handleData);

    return () => {
      off(eventName, handleData);
    };
  }, [socket, eventName, enabled, on, off, handleData]);

  /**
   * Auto-subscribe when connected
   */
  useEffect(() => {
    if (isConnected && enabled && !isSubscribedRef.current) {
      subscribe();
    }

    return () => {
      if (isSubscribedRef.current) {
        unsubscribe();
      }
    };
  }, [isConnected, enabled, subscribe, unsubscribe]);

  return {
    data,
    isLoading: isLoading && !data,
    isSubscribed,
    error,
    lastUpdate,
    subscribe,
    unsubscribe,
    refresh,
  };
}

/**
 * useNotifications Hook
 *
 * Subscribe to real-time notifications with built-in state management.
 *
 * @example
 * ```tsx
 * const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
 * ```
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<unknown[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { socket, isConnected, emit, on, off } = useWebSocket({
    namespace: '/notifications',
  });

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    const handleNewNotification = (notification: unknown) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    // Listen for notification read
    const handleNotificationRead = (data: { notificationId: string }) => {
      setNotifications((prev) =>
        prev.map((n: any) =>
          n.id === data.notificationId ? { ...n, read: true } : n,
        ),
      );
    };

    // Listen for notification deleted
    const handleNotificationDeleted = (data: { notificationId: string }) => {
      setNotifications((prev) => prev.filter((n: any) => n.id !== data.notificationId));
    };

    // Listen for unread count
    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    on('notification:new', handleNewNotification);
    on('notification:read', handleNotificationRead);
    on('notification:deleted', handleNotificationDeleted);
    on('notification:count', handleUnreadCount);

    return () => {
      off('notification:new', handleNewNotification);
      off('notification:read', handleNotificationRead);
      off('notification:deleted', handleNotificationDeleted);
      off('notification:count', handleUnreadCount);
    };
  }, [socket, on, off]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!socket || !isConnected) return;
      await emit('notification:mark-read', { notificationId });
    },
    [socket, isConnected, emit],
  );

  const markAllAsRead = useCallback(async () => {
    if (!socket || !isConnected) return;
    await emit('notification:mark-all-read', {});
    setNotifications((prev) => prev.map((n: any) => ({ ...n, read: true })));
  }, [socket, isConnected, emit]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      if (!socket || !isConnected) return;
      const notification = notifications.find((n: any) => n.id === notificationId);
      await emit('notification:delete', {
        notificationId,
        wasUnread: notification && !(notification as any).read,
      });
    },
    [socket, isConnected, emit, notifications],
  );

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}

/**
 * useDashboard Hook
 *
 * Subscribe to real-time dashboard updates.
 *
 * @example
 * ```tsx
 * const { metrics, activities, subscribe, unsubscribe } = useDashboard();
 * ```
 */
export function useDashboard() {
  const [metrics, setMetrics] = useState<unknown>(null);
  const [activities, setActivities] = useState<unknown[]>([]);
  const [caseStats, setCaseStats] = useState<Map<string, unknown>>(new Map());

  const { socket, isConnected, emit, on, off } = useWebSocket({
    namespace: '/dashboard',
  });

  useEffect(() => {
    if (!socket) return;

    const handleMetrics = (data: unknown) => {
      setMetrics(data);
    };

    const handleActivity = (activity: unknown) => {
      setActivities((prev) => [activity, ...prev].slice(0, 50)); // Keep last 50
    };

    const handleCaseStats = (stats: any) => {
      setCaseStats((prev) => new Map(prev).set(stats.caseId, stats));
    };

    on('dashboard:metrics', handleMetrics);
    on('dashboard:activity', handleActivity);
    on('dashboard:case-stats', handleCaseStats);

    return () => {
      off('dashboard:metrics', handleMetrics);
      off('dashboard:activity', handleActivity);
      off('dashboard:case-stats', handleCaseStats);
    };
  }, [socket, on, off]);

  const subscribe = useCallback(
    async (types: string[]) => {
      if (!socket || !isConnected) return;
      await emit('dashboard:subscribe', { types });
    },
    [socket, isConnected, emit],
  );

  const unsubscribe = useCallback(
    async (types: string[]) => {
      if (!socket || !isConnected) return;
      await emit('dashboard:unsubscribe', { types });
    },
    [socket, isConnected, emit],
  );

  const refresh = useCallback(async () => {
    if (!socket || !isConnected) return;
    await emit('dashboard:request-refresh', {});
  }, [socket, isConnected, emit]);

  return {
    metrics,
    activities,
    caseStats,
    isConnected,
    subscribe,
    unsubscribe,
    refresh,
  };
}

/**
 * useTypingIndicator Hook
 *
 * Manage typing indicators for messaging.
 *
 * @example
 * ```tsx
 * const { typingUsers, startTyping, stopTyping } = useTypingIndicator('conversation-123');
 * ```
 */
export function useTypingIndicator(conversationId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, isConnected, emit, on, off } = useWebSocket({
    namespace: '/messaging',
  });

  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => new Set(prev).add(data.userId));

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }, 5000);
      }
    };

    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      if (data.conversationId === conversationId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    };

    on('typing:start', handleTypingStart);
    on('typing:stop', handleTypingStop);

    return () => {
      off('typing:start', handleTypingStart);
      off('typing:stop', handleTypingStop);
    };
  }, [socket, conversationId, on, off]);

  const startTyping = useCallback(() => {
    if (!socket || !isConnected) return;

    emit('typing:start', { conversationId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [socket, isConnected, conversationId, emit]);

  const stopTyping = useCallback(() => {
    if (!socket || !isConnected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    emit('typing:stop', { conversationId });
  }, [socket, isConnected, conversationId, emit]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    typingUsers: Array.from(typingUsers),
    isTyping: typingUsers.size > 0,
    startTyping,
    stopTyping,
  };
}
