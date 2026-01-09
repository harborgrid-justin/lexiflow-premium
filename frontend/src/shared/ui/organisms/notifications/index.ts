/**
 * Notifications Components Index
 * Centralized exports for all notification-related components
 */

export { ToastContainer, showToast, toastSuccess, toastError, toastWarning, toastInfo, dismissToast, dismissAllToasts } from './Toast';
export type { ToastNotificationProps } from './Toast';

export { NotificationCenter } from './NotificationCenter';
export type { NotificationCenterProps, Notification as NotificationCenterNotification } from './NotificationCenter';

export {
  NotificationBadge,
  NotificationBadgeIcon,
  InlineNotificationBadge,
  AnimatedCounterBadge,
  NotificationBadgeGroup,
} from './NotificationBadge';
export type { NotificationBadgeProps } from './NotificationBadge';
