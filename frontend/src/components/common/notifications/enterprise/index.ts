/**
 * @module components/enterprise/notifications
 * @category Enterprise - Notifications
 * @description Comprehensive real-time notification system for enterprise users
 *
 * Features:
 * - Real-time WebSocket notifications
 * - Toast notifications with sound and visual effects
 * - Notification bell with badge counter
 * - Dropdown notification panel
 * - Full notification center page
 * - User preference management
 * - Connection status indicator
 * - Framer Motion animations
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * import {
 *   NotificationBell,
 *   NotificationPanel,
 *   ToastContainer,
 *   NotificationCenter,
 *   NotificationPreferences,
 *   ConnectionStatus,
 * } from '@/components/common/notifications/enterprise';
 *
 * // Use NotificationBell in header
 * <NotificationBell
 *   unreadCount={5}
 *   onClick={() => setShowPanel(true)}
 *   isOpen={showPanel}
 * />
 *
 * // Wrap app with ToastContainer
 * <ToastContainer position="bottom-right" enableSound>
 *   <App />
 * </ToastContainer>
 * ```
 */

// ============================================================================
// COMPONENT EXPORTS
// ============================================================================
export { NotificationBell } from './NotificationBell';
export type { NotificationBellProps } from './NotificationBell';

export { NotificationPanel } from './NotificationPanel';
export type { NotificationPanelProps } from './NotificationPanel';

export { ToastContainer, ToastContext, useToastNotifications } from './ToastContainer';
export type {
  ToastContainerProps,
  ToastNotification,
  ToastContextValue,
} from './ToastContainer';

export { NotificationCenter } from './NotificationCenter';
export type { NotificationCenterProps } from './NotificationCenter';

export { NotificationPreferences } from './NotificationPreferences';
export type {
  NotificationPreferencesProps,
  ExtendedNotificationPreferences,
} from './NotificationPreferences';

export { ConnectionStatus } from './ConnectionStatus';
export type { ConnectionStatusProps, ConnectionState } from './ConnectionStatus';

// ============================================================================
// RE-EXPORT TYPES FROM CORE
// ============================================================================
export type {
  UINotification,
  NotificationDTO,
  SystemNotification,
  NotificationAction,
  NotificationGroup,
  NotificationFilters,
  NotificationPreferences as CoreNotificationPreferences,
  NotificationType,
  NotificationPriority,
} from '@/types/notifications';
