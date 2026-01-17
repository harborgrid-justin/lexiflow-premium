/**
 * NotificationDomain - Real-time notification and alert service
 * Provides notification management, read/unread tracking, and channel subscriptions
 *
 * ? Migrated to backend API (2025-12-21)
 */

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
      timestamp: itemObj["timestamp"] || new Date().toISOString(),
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
    if (updatesObj["read"] === true) {
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
    return apiClient.get<Notification[]>("/communications/notifications", {
      params: filters,
    });
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
      await apiClient.post("/communications/notifications/mark-all-read");
      return true;
    } catch {
      return false;
    }
  },

  getUnreadCount: async (): Promise<number> => {
    const result = await apiClient.get<{ count: number }>(
      "/communications/notifications/unread-count",
    );
    return result.count;
  },

  subscribe: async (channel: string): Promise<boolean> => {
    try {
      await apiClient.post("/communications/notifications/subscribe", {
        channel,
      });
      return true;
    } catch {
      return false;
    }
  },

  unsubscribe: async (channel: string): Promise<boolean> => {
    try {
      await apiClient.post("/communications/notifications/unsubscribe", {
        channel,
      });
      return true;
    } catch {
      return false;
    }
  },
};
