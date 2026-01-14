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
export { NotificationBell } from "./NotificationBell";
export type { NotificationBellProps } from "./NotificationBell";

export { NotificationPanel } from "./NotificationPanel";
export type { NotificationPanelProps } from "./NotificationPanel";

export {
  ToastContainer,
  ToastContext,
  useToastNotifications,
} from "./ToastContainer";
export type {
  ToastContainerProps,
  ToastContextValue,
  ToastNotification,
} from "./ToastContainer";

export { NotificationCenter } from "./NotificationCenter";
export type { NotificationCenterProps } from "./NotificationCenter";

export { NotificationPreferences } from "./NotificationPreferences";
export type {
  ExtendedNotificationPreferences,
  NotificationPreferencesProps,
} from "./NotificationPreferences";

export { ConnectionStatus } from "./ConnectionStatus";
export type {
  ConnectionState,
  ConnectionStatusProps,
} from "./ConnectionStatus";

// ============================================================================
// RE-EXPORT TYPES FROM CORE
// ============================================================================
export type {
  NotificationPreferences as CoreNotificationPreferences,
  NotificationAction,
  NotificationDTO,
  NotificationFilters,
  NotificationGroup,
  NotificationPriority,
  NotificationType,
  SystemNotification,
  UINotification,
} from "@/types/notifications";
