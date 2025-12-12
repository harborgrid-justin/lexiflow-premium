/**
 * useNotificationStream Hook
 * Real-time notification stream with toast support
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { websocketClient } from '../services/websocket/WebSocketClient';
import { WS_EVENTS } from '../services/websocket/eventHandlers';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  data?: Record<string, any>;
  createdAt: string;
  read?: boolean;
}

interface UseNotificationStreamOptions {
  onNotification?: (notification: Notification) => void;
  showToast?: boolean;
  maxNotifications?: number;
  autoMarkRead?: boolean;
}

/**
 * Hook for real-time notification stream
 *
 * @example
 * const { notifications, unreadCount, markAsRead, clearAll } = useNotificationStream({
 *   onNotification: (notif) => console.log('New notification:', notif),
 *   showToast: true,
 * });
 */
export function useNotificationStream(options: UseNotificationStreamOptions = {}) {
  const {
    onNotification,
    showToast = true,
    maxNotifications = 100,
    autoMarkRead = false,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const callbackRef = useRef(onNotification);

  // Update callback ref
  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  // Add notification to list
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      const next = [{ ...notification, read: false }, ...prev];
      if (next.length > maxNotifications) {
        return next.slice(0, maxNotifications);
      }
      return next;
    });

    setUnreadCount(prev => prev + 1);

    // Trigger callback
    callbackRef.current?.(notification);

    // Show toast if enabled
    if (showToast) {
      // Dispatch custom event for toast system
      window.dispatchEvent(
        new CustomEvent('notification:toast', {
          detail: notification,
        })
      );
    }
  }, [maxNotifications, showToast]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));

    // Emit to server
    websocketClient.emit('notification:mark_read', { notificationId });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );

    setUnreadCount(0);

    // Emit to server for each unread notification
    notifications.forEach(notif => {
      if (!notif.read) {
        websocketClient.emit('notification:mark_read', { notificationId: notif.id });
      }
    });
  }, [notifications]);

  // Remove notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Get notifications by type
  const getByType = useCallback((type: string) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Get unread notifications
  const getUnread = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Listen for new notifications
  useEffect(() => {
    const handleNotification = (data: Notification) => {
      addNotification(data);

      // Auto-mark as read if enabled
      if (autoMarkRead) {
        setTimeout(() => {
          markAsRead(data.id);
        }, 3000);
      }
    };

    websocketClient.on(WS_EVENTS.NOTIFICATION_NEW, handleNotification);
    return () => websocketClient.off(WS_EVENTS.NOTIFICATION_NEW, handleNotification);
  }, [addNotification, autoMarkRead, markAsRead]);

  // Listen for notification read events (from other devices)
  useEffect(() => {
    const handleNotificationRead = (data: { notificationId: string }) => {
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === data.notificationId ? { ...notif, read: true } : notif
        )
      );
    };

    websocketClient.on(WS_EVENTS.NOTIFICATION_READ, handleNotificationRead);
    return () => websocketClient.off(WS_EVENTS.NOTIFICATION_READ, handleNotificationRead);
  }, []);

  // Listen for notification count updates
  useEffect(() => {
    const handleNotificationCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    websocketClient.on(WS_EVENTS.NOTIFICATION_COUNT, handleNotificationCount);
    return () => websocketClient.off(WS_EVENTS.NOTIFICATION_COUNT, handleNotificationCount);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getByType,
    getUnread,
  };
}

export default useNotificationStream;
