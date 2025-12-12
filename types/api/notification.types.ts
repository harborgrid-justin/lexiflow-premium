/**
 * Notification-related API Types
 */

import type { PaginatedResponse, AuditFields, ID } from './common';

// Notification type
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'deadline'
  | 'mention'
  | 'assignment'
  | 'update';

// Notification category
export type NotificationCategory =
  | 'case'
  | 'document'
  | 'billing'
  | 'compliance'
  | 'system'
  | 'message';

// Notification priority
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Notification
export interface Notification extends AuditFields {
  id: ID;
  userId: ID;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  relatedId?: ID;
  relatedType?: string;
  isRead: boolean;
  readAt?: Date;
  priority: NotificationPriority;
  expiresAt?: Date;
}

// Notification list response
export interface NotificationListResponse extends PaginatedResponse<Notification> {
  unread: number;
}

// Notification preferences
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

// Notification subscription
export interface NotificationSubscription {
  id: ID;
  userId: ID;
  type: 'case' | 'document' | 'client' | 'deadline';
  resourceId: ID;
  resourceName?: string;
  notifyOn: string[];
  createdAt: Date;
}

// Create notification request (admin only)
export interface CreateNotificationRequest {
  userId?: ID;
  userIds?: ID[];
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  priority?: NotificationPriority;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

// Notification statistics
export interface NotificationStatistics {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
  recentActivity: Array<{ date: string; count: number }>;
}

// Push notification token
export interface PushNotificationToken {
  id: ID;
  userId: ID;
  token: string;
  deviceType: 'web' | 'ios' | 'android';
  deviceName: string;
  isActive: boolean;
  lastUsedAt?: Date;
  createdAt: Date;
}
