/**
 * Notifications Service
 * Handles notifications, alerts, and user notification preferences
 */

import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';
import { createApiError } from './errors';
import type { PaginationParams } from '../../types/api';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'deadline' | 'mention' | 'assignment' | 'update';
  category: 'case' | 'document' | 'billing' | 'compliance' | 'system' | 'message';
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  relatedId?: string;
  relatedType?: string;
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationsListResponse {
  data: Notification[];
  total: number;
  unread: number;
  page: number;
  limit: number;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    caseUpdates: boolean;
    deadlines: boolean;
    mentions: boolean;
    assignments: boolean;
    billingAlerts: boolean;
    systemNotifications: boolean;
    digestFrequency: 'immediate' | 'hourly' | 'daily' | 'weekly' | 'never';
  };
  push: {
    enabled: boolean;
    caseUpdates: boolean;
    deadlines: boolean;
    mentions: boolean;
    assignments: boolean;
    billingAlerts: boolean;
    systemNotifications: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    deadlines: boolean;
    criticalAlerts: boolean;
  };
  inApp: {
    enabled: boolean;
    showBadge: boolean;
    playSound: boolean;
    desktop: boolean;
  };
}

export interface NotificationSubscription {
  id: string;
  userId: string;
  type: 'case' | 'document' | 'client' | 'deadline';
  resourceId: string;
  resourceName?: string;
  notifyOn: string[];
  createdAt: Date;
}

/**
 * Get notifications with filters
 */
export async function getNotifications(params?: PaginationParams & {
  type?: Notification['type'];
  category?: Notification['category'];
  isRead?: boolean;
  priority?: Notification['priority'];
}): Promise<NotificationsListResponse> {
  try {
    const response = await apiClient.get<NotificationsListResponse>(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      { params }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get notification by ID
 */
export async function getNotificationById(id: string): Promise<Notification> {
  try {
    const response = await apiClient.get<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.BY_ID(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get unread count
 */
export async function getUnreadCount(): Promise<{ count: number }> {
  try {
    const response = await apiClient.get<{ count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: string): Promise<Notification> {
  try {
    const response = await apiClient.post<Notification>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<{ updated: number }> {
  try {
    const response = await apiClient.post<{ updated: number }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Mark multiple notifications as read
 */
export async function markMultipleAsRead(ids: string[]): Promise<{ updated: number }> {
  try {
    const response = await apiClient.post<{ updated: number }>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/mark-read-bulk`,
      { ids }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead(): Promise<{ deleted: number }> {
  try {
    const response = await apiClient.delete<{ deleted: number }>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/read`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  try {
    const response = await apiClient.get<NotificationPreferences>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  try {
    const response = await apiClient.put<NotificationPreferences>(
      API_ENDPOINTS.NOTIFICATIONS.PREFERENCES,
      preferences
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Subscribe to notifications for a resource
 */
export async function subscribe(data: {
  type: NotificationSubscription['type'];
  resourceId: string;
  notifyOn?: string[];
}): Promise<NotificationSubscription> {
  try {
    const response = await apiClient.post<NotificationSubscription>(
      API_ENDPOINTS.NOTIFICATIONS.SUBSCRIBE,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Unsubscribe from notifications for a resource
 */
export async function unsubscribe(subscriptionId: string): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.UNSUBSCRIBE, {
      subscriptionId,
    });
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get user's subscriptions
 */
export async function getSubscriptions(): Promise<NotificationSubscription[]> {
  try {
    const response = await apiClient.get<NotificationSubscription[]>(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/subscriptions`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Create manual notification (admin only)
 */
export async function createNotification(data: {
  userId?: string;
  userIds?: string[];
  type: Notification['type'];
  category: Notification['category'];
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  priority?: Notification['priority'];
  expiresAt?: Date;
}): Promise<Notification | Notification[]> {
  try {
    const response = await apiClient.post(
      API_ENDPOINTS.NOTIFICATIONS.BASE,
      data
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Send test notification
 */
export async function sendTestNotification(channel: 'email' | 'push' | 'sms'): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/test`,
      { channel }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Register push notification token
 */
export async function registerPushToken(token: string, device: {
  type: 'web' | 'ios' | 'android';
  name: string;
}): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/push/register`,
      {
        token,
        device,
      }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Unregister push notification token
 */
export async function unregisterPushToken(token: string): Promise<{ success: boolean }> {
  try {
    const response = await apiClient.post(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/push/unregister`,
      { token }
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStatistics(): Promise<{
  total: number;
  unread: number;
  byType: Record<Notification['type'], number>;
  byCategory: Record<Notification['category'], number>;
  recentActivity: Array<{ date: string; count: number }>;
}> {
  try {
    const response = await apiClient.get(
      `${API_ENDPOINTS.NOTIFICATIONS.BASE}/statistics`
    );
    return response.data;
  } catch (error) {
    throw createApiError(error);
  }
}

export default {
  getNotifications,
  getNotificationById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  markMultipleAsRead,
  deleteNotification,
  deleteAllRead,
  getNotificationPreferences,
  updateNotificationPreferences,
  subscribe,
  unsubscribe,
  getSubscriptions,
  createNotification,
  sendTestNotification,
  registerPushToken,
  unregisterPushToken,
  getNotificationStatistics,
};
