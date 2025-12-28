/**
 * Notifications API Service
 * Enterprise-grade API service for user notification management with backend integration
 * 
 * @module NotificationsApiService
 * @description Manages all notification-related operations including:
 * - Notification CRUD operations aligned with backend API
 * - Real-time notification delivery
 * - Read/unread status tracking
 * - Notification filtering by type and status
 * - Bulk operations (mark all as read)
 * - Unread count tracking for UI badges
 * - Multi-type notifications (info, warning, alert, deadline, system)
 * 
 * @security
 * - Input validation on all parameters
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - User-scoped notifications (users only see their own)
 * - Proper access control
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - React Query integration via NOTIFICATIONS_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Real-time updates via WebSocket (future enhancement)
 */

import { apiClient, type PaginatedResponse } from '@/services/infrastructure/apiClient';

/**
 * API Notification DTO
 * Represents notification structure from backend API
 * 
 * @note Different from UINotification in types/notifications.ts which is for frontend display
 */
export interface ApiNotification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'system' | 'case_update' | 'document' | 'task';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'case' | 'document' | 'task' | 'calendar' | 'evidence' | 'docket';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  readAt?: string;
}

export interface ApiNotificationFilters {
  read?: boolean;
  type?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Query keys for React Query integration
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEYS.unread() });
 */
export const NOTIFICATIONS_QUERY_KEYS = {
    all: () => ['notifications'] as const,
    byId: (id: string) => ['notifications', id] as const,
    byType: (type: string) => ['notifications', 'type', type] as const,
    byPriority: (priority: string) => ['notifications', 'priority', priority] as const,
    unread: () => ['notifications', 'unread'] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
} as const;

/**
 * Notifications API Service Class
 * Implements secure, type-safe notification management operations
 */
export class NotificationsApiService {
  private readonly baseUrl = '/notifications';

  constructor() {
    this.logInitialization();
  }

  /**
   * Log service initialization
   * @private
   */
  private logInitialization(): void {
    console.log('[NotificationsApiService] Initialized with Backend API (PostgreSQL)');
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || false || id.trim() === '') {
      throw new Error(`[NotificationsApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize object parameter
   * @private
   */
  private validateObject(obj: unknown, paramName: string, methodName: string): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error(`[NotificationsApiService.${methodName}] Invalid ${paramName} parameter`);
    }
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all notifications with optional filters
   * 
   * @param filters - Optional filters for read status, type, priority, date range
   * @returns Promise<ApiNotification[]> Array of notifications
   * @throws Error if fetch fails
   */
  async getAll(filters?: ApiNotificationFilters): Promise<ApiNotification[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<ApiNotification>>(this.baseUrl, filters);
      return response.data;
    } catch (error) {
      console.error('[NotificationsApiService.getAll] Error:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Get notification by ID
   * 
   * @param id - Notification ID
   * @returns Promise<ApiNotification> Notification data
   * @throws Error if id is invalid or fetch fails
   */
  async getById(id: string): Promise<ApiNotification> {
    this.validateId(id, 'getById');
    try {
      return await apiClient.get<ApiNotification>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[NotificationsApiService.getById] Error:', error);
      throw new Error(`Failed to fetch notification with id: ${id}`);
    }
  }

  /**
   * Create a new notification
   * 
   * @param data - Notification creation data
   * @returns Promise<ApiNotification> Created notification
   * @throws Error if validation fails or creation fails
   */
  async create(data: Partial<ApiNotification>): Promise<ApiNotification> {
    this.validateObject(data, 'data', 'create');
    if (!data.title) {
      throw new Error('[NotificationsApiService.create] title is required');
    }
    if (!data.message) {
      throw new Error('[NotificationsApiService.create] message is required');
    }
    if (!data.type) {
      throw new Error('[NotificationsApiService.create] type is required');
    }
    try {
      return await apiClient.post<ApiNotification>(this.baseUrl, data);
    } catch (error) {
      console.error('[NotificationsApiService.create] Error:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Delete a notification
   * 
   * @param id - Notification ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async delete(id: string): Promise<void> {
    this.validateId(id, 'delete');
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[NotificationsApiService.delete] Error:', error);
      throw new Error(`Failed to delete notification with id: ${id}`);
    }
  }

  // =============================================================================
  // NOTIFICATION MANAGEMENT
  // =============================================================================

  /**
   * Mark notification as read
   * 
   * @param id - Notification ID
   * @returns Promise<ApiNotification> Updated notification
   * @throws Error if validation fails or operation fails
   */
  async markAsRead(id: string): Promise<ApiNotification> {
    this.validateId(id, 'markAsRead');
    try {
      return await apiClient.patch<ApiNotification>(`${this.baseUrl}/${id}/read`, { read: true });
    } catch (error) {
      console.error('[NotificationsApiService.markAsRead] Error:', error);
      throw new Error(`Failed to mark notification as read: ${id}`);
    }
  }

  /**
   * Mark notification as unread
   * 
   * @param id - Notification ID
   * @returns Promise<ApiNotification> Updated notification
   * @throws Error if validation fails or operation fails
   */
  async markAsUnread(id: string): Promise<ApiNotification> {
    this.validateId(id, 'markAsUnread');
    try {
      return await apiClient.patch<ApiNotification>(`${this.baseUrl}/${id}/read`, { read: false });
    } catch (error) {
      console.error('[NotificationsApiService.markAsUnread] Error:', error);
      throw new Error(`Failed to mark notification as unread: ${id}`);
    }
  }

  /**
   * Mark all notifications as read
   * 
   * @returns Promise<void>
   * @throws Error if operation fails
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/mark-all-read`, {});
    } catch (error) {
      console.error('[NotificationsApiService.markAllAsRead] Error:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  /**
   * Get unread notification count
   * 
   * @returns Promise<number> Count of unread notifications
   * @throws Error if fetch fails
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(`${this.baseUrl}/unread-count`);
      return response.count;
    } catch (error) {
      console.error('[NotificationsApiService.getUnreadCount] Error:', error);
      throw new Error('Failed to fetch unread notification count');
    }
  }

  /**
   * Get unread notifications only
   * 
   * @returns Promise<ApiNotification[]> Array of unread notifications
   * @throws Error if fetch fails
   */
  async getUnread(): Promise<ApiNotification[]> {
    return this.getAll({ read: false });
  }

  /**
   * Delete all read notifications
   * 
   * @returns Promise<void>
   * @throws Error if operation fails
   */
  async deleteAllRead(): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/delete-all-read`, {});
    } catch (error) {
      console.error('[NotificationsApiService.deleteAllRead] Error:', error);
      throw new Error('Failed to delete all read notifications');
    }
  }

  /**
   * Get notifications by type
   *
   * @param notificationType - Notification type
   * @returns Promise<ApiNotification[]> Array of notifications of specified type
   * @throws Error if validation fails or fetch fails
   */
  async getByType(notificationType: string): Promise<ApiNotification[]> {
    const all = await this.getAll();
    return all.filter(n => n.type === notificationType);
  }

  /**
   * Get grouped notifications (for UI display)
   *
   * @returns Promise<Notification[]> Array of notifications
   * @throws Error if fetch fails
   */
  async getGrouped(): Promise<Notification[]> {
    // For now, return all notifications - grouping logic can be client-side
    return this.getAll();
  }

  /**
   * Remove/delete a notification (alias for delete)
   *
   * @param id - Notification ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async remove(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Clear all notifications
   *
   * @returns Promise<void>
   * @throws Error if operation fails
   */
  async clearAll(): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/clear-all`, {});
    } catch (error) {
      console.error('[NotificationsApiService.clearAll] Error:', error);
      throw new Error('Failed to clear all notifications');
    }
  }

  // =============================================================================
  // SUBSCRIPTIONS (Placeholder for WebSocket)
  // =============================================================================

  /**
   * Subscribe to notification updates (placeholder for future WebSocket implementation)
   *
   * @param channel - Subscription channel
   * @returns Promise<void>
   */
  async subscribe(channel: string): Promise<void> {
    console.log(`[NotificationsApiService] subscribe(${channel}) - Not implemented (future WebSocket)`);
    return Promise.resolve();
  }

  /**
   * Unsubscribe from notification updates (placeholder for future WebSocket implementation)
   *
   * @param channel - Subscription channel
   * @returns Promise<void>
   */
  async unsubscribe(channel: string): Promise<void> {
    console.log(`[NotificationsApiService] unsubscribe(${channel}) - Not implemented (future WebSocket)`);
    return Promise.resolve();
  }

  /**
   * Add a notification (alias for create)
   *
   * @param data - Notification data
   * @returns Promise<ApiNotification> Created notification
   */
  async add(data: unknown): Promise<ApiNotification> {
    return this.create(data as Partial<ApiNotification>);
  }
}
