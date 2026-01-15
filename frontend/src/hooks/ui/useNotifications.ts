/**
 * useNotifications Hook
 *
 * Comprehensive notification management hook that combines:
 * - Real-time WebSocket notifications
 * - REST API integration
 * - Local notification state
 * - Toast notifications
 * - Desktop notifications
 *
 * This is the main hook for notification management in the application.
 *
 * EXPLICIT ASYNC STATE (G51):
 * - isLoading: First-class loading indicator
 * - error: Explicit error state (not inferred from data nullability)
 * - connectionState: Explicit WebSocket connection status
 * - NOT inferred: All states explicit, not based on timing
 *
 * TEMPORAL COHERENCE (G41):
 * - Encodes real-time + polling temporal model
 * - WebSocket: Push-based immediate updates
 * - Polling: Interval-based periodic fetching
 * - Identity: Notification list persists across renders
 *
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Notifications fetch: On mount if autoFetch enabled
 * - Notifications update: Via WebSocket or polling
 * - Notifications persist: Until manual refresh or mutation
 * - Cleanup: WebSocket disconnects on unmount
 *
 * GLOBAL SINGLETON DEPENDENCIES (G55):
 * WARNING: Hidden dependency on notificationsApi singleton
 * - notificationsApi: Imported module-level constant
 * - IMPROVEMENT NEEDED: Inject as parameter or context
 * - Reduces testability and isolation
 *
 * PURE COMPUTATION + EFFECT BOUNDARY (G42):
 * - Pure: unreadCount, unreadNotifications derivations
 * - Effect boundary: API calls, WebSocket handlers, toasts
 *
 * @module useNotifications
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotificationWebSocket, WebSocketNotification } from './useNotificationWebSocket';
import { NotificationsApiService } from '@/lib/frontend-api';
import { showToast } from '@/components/organisms/notifications/Toast';

/**
 * Notification type (matches backend)
 */
export interface Notification {
  id: string;
  type: 'case_update' | 'document' | 'deadline' | 'task' | 'message' | 'invoice' | 'system' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Hook options
 */
export interface UseNotificationsOptions {
  /** JWT token for WebSocket authentication */
  token?: string;

  /** Enable real-time WebSocket updates */
  enableRealtime?: boolean;

  /** Enable toast notifications */
  enableToasts?: boolean;

  /** Enable desktop notifications */
  enableDesktop?: boolean;

  /** Auto-fetch notifications on mount */
  autoFetch?: boolean;

  /** Polling interval in ms (0 = disabled) */
  pollingInterval?: number;

  /** Debug mode */
  debug?: boolean;
}

/**
 * Hook return value
 */
export interface UseNotificationsReturn {
  /** All notifications */
  notifications: Notification[];

  /** Unread notifications only */
  unreadNotifications: Notification[];

  /** Unread count */
  unreadCount: number;

  /** Loading state */
  isLoading: boolean;

  /** Error state */
  error: Error | null;

  /** WebSocket connection state */
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';

  /** Is connected to WebSocket */
  isConnected: boolean;

  /** Fetch notifications from API */
  fetchNotifications: () => Promise<void>;

  /** Mark notification as read */
  markAsRead: (id: string) => Promise<void>;

  /** Mark all as read */
  markAllAsRead: () => Promise<void>;

  /** Delete notification */
  deleteNotification: (id: string) => Promise<void>;

  /** Refresh notifications */
  refresh: () => Promise<void>;
}

/**
 * Notification API Service Instance
 */
const notificationsApi = new NotificationsApiService();

/**
 * Convert WebSocket notification to local format
 */
const convertWebSocketNotification = (wsNotif: WebSocketNotification): Notification => {
  return {
    id: wsNotif.id,
    type: wsNotif.type as Notification['type'],
    title: wsNotif.title,
    message: wsNotif.message,
    read: false,
    priority: wsNotif.priority as Notification['priority'],
    timestamp: new Date(wsNotif.createdAt).getTime(),
    actionUrl: wsNotif.actionUrl,
    metadata: wsNotif.metadata,
  };
};

/**
 * useNotifications Hook
 */
export const useNotifications = (
  options: UseNotificationsOptions = {},
): UseNotificationsReturn => {
  const {
    token,
    enableRealtime = true,
    enableToasts = true,
    enableDesktop = false,
    autoFetch = true,
    pollingInterval = 0,
    debug = false,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const log = useCallback(
    (message: string, ...args: unknown[]): void => {
      if (debug) {
        console.log(`[useNotifications] ${message}`, ...args);
      }
    },
    [debug],
  );

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      log('Fetching notifications...');

      const apiNotifications = await notificationsApi.getAll();

      const mappedNotifications: Notification[] = apiNotifications.map(n => ({
        id: n.id,
        type: n.type as Notification['type'],
        title: n.title,
        message: n.message,
        read: n.read,
        priority: (n.priority || 'medium') as Notification['priority'],
        timestamp: new Date(n.createdAt).getTime(),
        actionUrl: n.actionUrl,
        actionLabel: n.actionLabel,
        metadata: n.metadata,
      }));

      setNotifications(mappedNotifications);
      log('Fetched notifications', mappedNotifications.length);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch notifications');
      setError(error);
      log('Fetch error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [log]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (id: string): Promise<void> => {
      try {
        log('Marking as read', id);

        // Optimistic update
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n)),
        );

        // API call
        await notificationsApi.markAsRead(id);
      } catch (err) {
        log('Mark as read error', err);
        // Revert on error
        await fetchNotifications();
      }
    },
    [log, fetchNotifications],
  );

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(async (): Promise<void> => {
    try {
      log('Marking all as read');

      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));

      // API call
      await notificationsApi.markAllAsRead();
    } catch (err) {
      log('Mark all as read error', err);
      // Revert on error
      await fetchNotifications();
    }
  }, [log, fetchNotifications]);

  /**
   * Delete notification
   */
  const deleteNotification = useCallback(
    async (id: string): Promise<void> => {
      try {
        log('Deleting notification', id);

        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));

        // API call
        await notificationsApi.delete(id);
      } catch (err) {
        log('Delete error', err);
        // Revert on error
        await fetchNotifications();
      }
    },
    [log, fetchNotifications],
  );

  /**
   * Handle new WebSocket notification
   */
  const handleNewNotification = useCallback(
    (wsNotif: WebSocketNotification): void => {
      log('New notification received', wsNotif);

      const notification = convertWebSocketNotification(wsNotif);

      // Add to local state
      setNotifications(prev => [notification, ...prev]);

      // Show toast notification
      if (enableToasts) {
        const toastType = notification.priority === 'urgent' ? 'error'
          : notification.priority === 'high' ? 'warning'
          : 'info';

        showToast({
          type: toastType,
          title: notification.title,
          message: notification.message,
          priority: notification.priority === 'medium' ? 'normal' : notification.priority,
          action: notification.actionUrl
            ? {
                label: notification.actionLabel || 'View',
                onClick: () => {
                  window.location.href = notification.actionUrl!;
                },
              }
            : undefined,
        });
      }

      // Show desktop notification
      if (enableDesktop && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: notification.id,
        });
      }
    },
    [enableToasts, enableDesktop, log],
  );

  /**
   * Handle notification read via WebSocket
   */
  const handleNotificationRead = useCallback(
    (data: { notificationId: string }): void => {
      log('Notification read', data.notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === data.notificationId ? { ...n, read: true } : n)),
      );
    },
    [log],
  );

  /**
   * Handle all notifications read via WebSocket
   */
  const handleAllNotificationsRead = useCallback((): void => {
    log('All notifications read');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [log]);

  /**
   * Handle notification deleted via WebSocket
   */
  const handleNotificationDeleted = useCallback(
    (data: { notificationId: string }): void => {
      log('Notification deleted', data.notificationId);
      setNotifications(prev => prev.filter(n => n.id !== data.notificationId));
    },
    [log],
  );

  /**
   * WebSocket connection
   */
  const {
    connectionState,
    unreadCount: wsUnreadCount,
    markAsRead: wsMarkAsRead,
    markAllAsRead: wsMarkAllAsRead,
    deleteNotification: wsDeleteNotification,
    isConnected,
  } = useNotificationWebSocket({
    token,
    autoReconnect: enableRealtime,
    debug,
    onNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
    onAllNotificationsRead: handleAllNotificationsRead,
    onNotificationDeleted: handleNotificationDeleted,
    onError: (err) => {
      log('WebSocket error', err.message);
    },
  });

  /**
   * Calculate unread count from local state
   */
  const localUnreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  /**
   * Use WebSocket unread count if connected, otherwise local
   */
  const unreadCount = isConnected ? wsUnreadCount : localUnreadCount;

  /**
   * Get unread notifications
   */
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  /**
   * Enhanced mark as read (uses WebSocket if available)
   */
  const enhancedMarkAsRead = useCallback(
    async (id: string): Promise<void> => {
      if (isConnected) {
        wsMarkAsRead(id);
      }
      await markAsRead(id);
    },
    [isConnected, wsMarkAsRead, markAsRead],
  );

  /**
   * Enhanced mark all as read (uses WebSocket if available)
   */
  const enhancedMarkAllAsRead = useCallback(async (): Promise<void> => {
    if (isConnected) {
      wsMarkAllAsRead();
    }
    await markAllAsRead();
  }, [isConnected, wsMarkAllAsRead, markAllAsRead]);

  /**
   * Enhanced delete (uses WebSocket if available)
   */
  const enhancedDelete = useCallback(
    async (id: string): Promise<void> => {
      const notification = notifications.find(n => n.id === id);
      if (isConnected && notification) {
        wsDeleteNotification(id, !notification.read);
      }
      await deleteNotification(id);
    },
    [isConnected, notifications, wsDeleteNotification, deleteNotification],
  );

  /**
   * Initial fetch
   * Only fetch if autoFetch is enabled AND we have an auth token
   */
  useEffect(() => {
    if (autoFetch && token) {
      fetchNotifications();
    } else if (autoFetch && !token) {
      log('Skipping notifications fetch - no auth token provided');
    }
  }, [autoFetch, token, fetchNotifications, log]);

  /**
   * Polling
   */
  useEffect(() => {
    if (pollingInterval > 0 && !isConnected) {
      const interval = setInterval(fetchNotifications, pollingInterval);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [pollingInterval, isConnected, fetchNotifications]);

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    isLoading,
    error,
    connectionState,
    isConnected,
    fetchNotifications,
    markAsRead: enhancedMarkAsRead,
    markAllAsRead: enhancedMarkAllAsRead,
    deleteNotification: enhancedDelete,
    refresh: fetchNotifications,
  };
};

export default useNotifications;
