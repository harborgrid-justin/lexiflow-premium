import { useCallback, useEffect, useState } from 'react';

import { ServiceRegistry } from '../services/core/ServiceRegistry';

import type { IService } from '../services/core/ServiceLifecycle';
import type { NotificationService, Notification } from '../services/notification/NotificationService';

/**
 * HOOK ADAPTER for NotificationService
 * 
 * PATTERN: Hooks adapt services, never vice versa
 * ROLE: Provide React-friendly interface to notification capability
 */

export function useNotification() {
  const notificationService = ServiceRegistry.get<IService>('NotificationService') as unknown as NotificationService;

  const show = useCallback(
    (notification: Parameters<NotificationService['show']>[0]) => {
      return notificationService.show(notification);
    },
    [notificationService]
  );

  const dismiss = useCallback(
    (id: string) => {
      notificationService.dismiss(id);
    },
    [notificationService]
  );

  const dismissAll = useCallback(() => {
    notificationService.dismissAll();
  }, [notificationService]);

  const markAsRead = useCallback(
    (id: string) => {
      notificationService.markAsRead(id);
    },
    [notificationService]
  );

  const requestPermission = useCallback(async () => {
    return await notificationService.requestDesktopPermission();
  }, [notificationService]);

  return { show, dismiss, dismissAll, markAsRead, requestPermission };
}

export function useNotifications() {
  const notificationService = ServiceRegistry.get<IService>('NotificationService') as unknown as NotificationService;
  const [notifications, setNotifications] = useState<Notification[]>(() => notificationService.getAll());

  useEffect(() => {
    const unsubscribe = notificationService.addListener((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, [notificationService]);

  return notifications;
}
