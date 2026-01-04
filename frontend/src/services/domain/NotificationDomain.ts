/**
 * NotificationDomain - Real-time notification and alert service
 * Provides notification management, read/unread tracking, and channel subscriptions
 *
 * ? Migrated to backend API (2025-12-21)
 */

import { isBackendApiEnabled } from "@/api";
import { communicationsApi } from "@/api/domains/communications.api";
import { apiClient } from "@/services/infrastructure/apiClient";

interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: unknown;
}

export const NotificationService = {
  getAll: async () => communicationsApi.notifications?.getAll?.() || [],
  getById: async (id: string) =>
    communicationsApi.notifications?.getById?.(id) || null,
  add: async (item: unknown) => {
    const itemObj =
      item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    const notification = {
      ...itemObj,
      timestamp: itemObj.timestamp || new Date().toISOString(),
      read: false,
    };
    return (
      communicationsApi.notifications?.create?.(notification) || notification
    );
  },
  update: async (id: string, updates: unknown) => {
    // NotificationsApiService doesn't have update method, use markAsRead instead
    const updatesObj =
      updates && typeof updates === "object"
        ? (updates as Record<string, unknown>)
        : {};
    if (updatesObj.read === true) {
      return (
        communicationsApi.notifications?.markAsRead?.(id) || {
          id,
          ...updatesObj,
        }
      );
    }
    return {
      id,
      ...updatesObj,
    };
  },
  delete: async (id: string) => {
    await communicationsApi.notifications?.delete?.(id);
    return true;
  },

  // Notification specific methods
  getNotifications: async (filters?: {
    read?: boolean;
    type?: string;
    limit?: number;
  }): Promise<Notification[]> => {
    if (isBackendApiEnabled()) {
      return apiClient.get<Notification[]>(
        "/communications/notifications",
        filters
      );
    }
    const rawNotifications =
      (await communicationsApi.notifications?.getAll?.()) || [];
    let notifications = rawNotifications as unknown as Notification[];

    // Apply filters
    if (filters?.read !== undefined) {
      notifications = notifications.filter(
        (n: Notification) => n.read === filters.read
      );
    }

    if (filters?.type) {
      notifications = notifications.filter(
        (n: Notification) => n.type === filters.type
      );
    }

    // Sort by timestamp descending
    notifications.sort(
      (a: Notification, b: Notification) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply limit
    if (filters?.limit) {
      notifications = notifications.slice(0, filters.limit);
    }

    return notifications;
  },

  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      await NotificationService.update(notificationId, { read: true });
      return true;
    } catch {
      return false;
    }
  },

  markAllAsRead: async (): Promise<boolean> => {
    try {
      if (isBackendApiEnabled()) {
        await apiClient.post("/communications/notifications/mark-all-read");
        return true;
      }
      const rawNotifications =
        (await communicationsApi.notifications?.getAll?.()) || [];
      const notifications = rawNotifications as unknown as Notification[];
      const unread = notifications.filter((n: Notification) => !n.read);

      await Promise.all(
        unread.map((n: Notification) =>
          communicationsApi.notifications?.markAsRead?.(n.id)
        )
      );

      return true;
    } catch {
      return false;
    }
  },

  getUnreadCount: async (): Promise<number> => {
    if (isBackendApiEnabled()) {
      const result = await apiClient.get<{ count: number }>(
        "/communications/notifications/unread-count"
      );
      return result.count;
    }
    const rawNotifications =
      (await communicationsApi.notifications?.getAll?.()) || [];
    const notifications = rawNotifications as unknown as Notification[];
    return notifications.filter((n: Notification) => !n.read).length;
  },

  subscribe: async (channel: string): Promise<boolean> => {
    try {
      if (isBackendApiEnabled()) {
        await apiClient.post("/communications/notifications/subscribe", {
          channel,
        });
        return true;
      }
      const stored = localStorage.getItem("subscriptions");
      const subscriptions = stored ? JSON.parse(stored) : [];

      if (!subscriptions.includes(channel)) {
        subscriptions.push(channel);
        localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
      }

      console.log(`[NotificationService] Subscribed to channel: ${channel}`);
      return true;
    } catch {
      return false;
    }
  },

  unsubscribe: async (channel: string): Promise<boolean> => {
    try {
      if (isBackendApiEnabled()) {
        await apiClient.post("/communications/notifications/unsubscribe", {
          channel,
        });
        return true;
      }
      const stored = localStorage.getItem("subscriptions");
      const subscriptions = stored ? JSON.parse(stored) : [];
      const updated = subscriptions.filter((c: string) => c !== channel);

      localStorage.setItem("subscriptions", JSON.stringify(updated));
      console.log(
        `[NotificationService] Unsubscribed from channel: ${channel}`
      );
      return true;
    } catch {
      return false;
    }
  },
};
