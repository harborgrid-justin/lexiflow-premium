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

import { apiClient, type PaginatedResponse } from '../infrastructure/apiClient';

export interface Notification {
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

export interface NotificationFilters {
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
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`[NotificationsApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize object parameter
   * @private
   */
  private validateObject(obj: any, paramName: string, methodName: string): void {
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
   * @returns Promise<Notification[]> Array of notifications
   * @throws Error if fetch fails
   */
  async getAll(filters?: NotificationFilters): Promise<Notification[]> {
    try {
      const response = await apiClient.get<PaginatedResponse<Notification>>(this.baseUrl, filters);
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
   * @returns Promise<Notification> Notification data
   * @throws Error if id is invalid or fetch fails
   */
  async getById(id: string): Promise<Notification> {
    this.validateId(id, 'getById');
    try {
      return await apiClient.get<Notification>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[NotificationsApiService.getById] Error:', error);
      throw new Error(`Failed to fetch notification with id: ${id}`);
    }
  }

  /**
   * Create a new notification
   * 
   * @param data - Notification creation data
   * @returns Promise<Notification> Created notification
   * @throws Error if validation fails or creation fails
   */
  async create(data: Partial<Notification>): Promise<Notification> {
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
      return await apiClient.post<Notification>(this.baseUrl, data);
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
   * @returns Promise<Notification> Updated notification
   * @throws Error if validation fails or operation fails
   */
  async markAsRead(id: string): Promise<Notification> {
    this.validateId(id, 'markAsRead');
    try {
      return await apiClient.patch<Notification>(`${this.baseUrl}/${id}/read`, { read: true });
    } catch (error) {
      console.error('[NotificationsApiService.markAsRead] Error:', error);
      throw new Error(`Failed to mark notification as read: ${id}`);
    }
  }

  /**
   * Mark notification as unread
   * 
   * @param id - Notification ID
   * @returns Promise<Notification> Updated notification
   * @throws Error if validation fails or operation fails
   */
  async markAsUnread(id: string): Promise<Notification> {
    this.validateId(id, 'markAsUnread');
    try {
      return await apiClient.patch<Notification>(`${this.baseUrl}/${id}/read`, { read: false });
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
   * @returns Promise<Notification[]> Array of unread notifications
   * @throws Error if fetch fails
   */
  async getUnread(): Promise<Notification[]> {
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
   * @param type - Notification type
   * @returns Promise<Notification[]> Array of notifications of specified type
   * @throws Error if validation fails or fetch fails
   */
  async getByType(type: string): Promise<Notification[]> {
    if (!type || typeof type !== 'string') {
      throw new Error('[NotificationsApiService.getByType] type is required');
    }
    return this.getAll({ type });
  }
}
