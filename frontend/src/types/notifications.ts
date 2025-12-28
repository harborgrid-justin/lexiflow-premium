// types/notifications.ts - Centralized notification type definitions

/**
 * Base notification interface
 * Minimal structure shared across all notification types
 */
export interface BaseNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: number | string;
}

/**
 * UI notification (for in-app toast/notification center)
 * Extended with UI-specific features like actions, priority, auto-dismiss
 */
export interface UINotification extends BaseNotification {
  timestamp: number; // Always number for UI
  priority: 'low' | 'normal' | 'high' | 'urgent';
  duration?: number; // Auto-dismiss after ms (0 = persistent)
  actions?: NotificationAction[];
  groupKey?: string; // For grouping similar notifications
  icon?: string;
  sound?: boolean;
  desktop?: boolean; // Show desktop notification
}

/**
 * Backend notification DTO
 * Structure returned from backend API
 */
export interface NotificationDTO extends BaseNotification {
  timestamp: string; // ISO string from backend
  userId: string;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'case' | 'document' | 'task' | 'calendar' | 'evidence' | 'docket';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

/**
 * System notification (for backend-generated events)
 * Includes deadline and case_update types
 * Note: Uses intersection instead of extends to avoid type incompatibility
 */
export interface SystemNotification extends Omit<NotificationDTO, 'type'> {
  type: 'info' | 'warning' | 'error' | 'success' | 'deadline' | 'system' | 'case_update' | 'document' | 'task';
}

/**
 * Action button for interactive notifications
 */
export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * Notification group (for collapsing similar notifications)
 */
export interface NotificationGroup {
  groupKey: string;
  notifications: UINotification[];
  count: number;
  latestTimestamp: number;
  collapsed: boolean;
}

/**
 * Notification filters for querying
 */
export interface NotificationFilters {
  read?: boolean;
  type?: string[];
  priority?: string[];
  startDate?: string;
  endDate?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  slack: boolean;
  digestFrequency: 'Realtime' | 'Daily' | 'Weekly';
}

// Type aliases for backward compatibility
export type Notification = UINotification;
export type NotificationType = UINotification['type'];
export type NotificationPriority = UINotification['priority'];
