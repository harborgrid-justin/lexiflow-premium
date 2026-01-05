/**
 * notificationUtils.ts
 * 
 * Utility functions for consistent notification behavior
 * Replaces scattered alert() calls with proper notification system
 */

import { toast } from 'react-hot-toast';

// ============================================================================
// TYPES
// ============================================================================
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  /** Duration in milliseconds */
  duration?: number;
  /** Position on screen */
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  /** Custom icon */
  icon?: string;
}

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Show success notification
 */
export const notifySuccess = (message: string, options?: NotificationOptions): void => {
  toast.success(message, {
    duration: options?.duration || 3000,
    position: options?.position || 'top-right',
    icon: options?.icon
  });
};

/**
 * Show error notification
 */
export const notifyError = (message: string, options?: NotificationOptions): void => {
  toast.error(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
    icon: options?.icon
  });
};

/**
 * Show info notification
 */
export const notifyInfo = (message: string, options?: NotificationOptions): void => {
  toast(message, {
    duration: options?.duration || 3000,
    position: options?.position || 'top-right',
    icon: options?.icon || 'ℹ️'
  });
};

/**
 * Show warning notification
 * Note: Toast styles are fixed (not theme-aware) to maintain high visibility
 */
export const notifyWarning = (message: string, options?: NotificationOptions): void => {
  toast(message, {
    duration: options?.duration || 4000,
    position: options?.position || 'top-right',
    icon: options?.icon || '⚠️',
    // Fixed light colors for visibility - toast notifications should be consistent
    style: {
      background: '#fef3c7',
      color: '#92400e'
    }
  });
};

/**
 * Show loading notification that can be updated
 */
export const notifyLoading = (message: string): string => {
  return toast.loading(message);
};

/**
 * Update an existing notification
 */
export const updateNotification = (
  id: string, 
  type: NotificationType, 
  message: string
): void => {
  switch (type) {
    case 'success':
      toast.success(message, { id });
      break;
    case 'error':
      toast.error(message, { id });
      break;
    case 'warning':
      toast(message, { id, icon: '⚠️' });
      break;
    case 'info':
    default:
      toast(message, { id, icon: 'ℹ️' });
      break;
  }
};

/**
 * Dismiss a notification
 */
export const dismissNotification = (id: string): void => {
  toast.dismiss(id);
};

/**
 * Dismiss all notifications
 */
export const dismissAllNotifications = (): void => {
  toast.dismiss();
};

// ============================================================================
// COMMON NOTIFICATION MESSAGES
// ============================================================================

export const COMMON_MESSAGES = {
  SAVE_SUCCESS: 'Changes saved successfully',
  SAVE_ERROR: 'Failed to save changes',
  DELETE_SUCCESS: 'Item deleted successfully',
  DELETE_ERROR: 'Failed to delete item',
  LOAD_ERROR: 'Failed to load data',
  NETWORK_ERROR: 'Network connection error',
  PERMISSION_DENIED: 'You do not have permission to perform this action',
  INVALID_INPUT: 'Please check your input and try again',
  BACKEND_UNAVAILABLE: 'Backend service is not available. Please try again later.'
} as const;
