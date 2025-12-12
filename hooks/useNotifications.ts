import { useEffect, useState, useCallback } from 'react';
import { notificationService, Notification } from '../services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribeNotifications = notificationService.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    // Subscribe to unread count
    const unsubscribeCount = notificationService.onCountChange((count) => {
      setUnreadCount(count);
    });

    // Check connection status
    setIsConnected(notificationService.isConnected());

    return () => {
      unsubscribeNotifications();
      unsubscribeCount();
    };
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  const requestPermission = useCallback(async () => {
    return await notificationService.requestPushPermission();
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestPermission,
  };
}

export default useNotifications;
