/**
 * @module enterprise/ui
 * @category Enterprise UI
 * @description Central export file for all enterprise UI components
 *
 * This module provides a comprehensive suite of enterprise-grade UI components
 * for building sophisticated business applications.
 */

// ============================================================================
// DATA COMPONENTS
// ============================================================================
export {
  EnterpriseDataTable,
  type EnterpriseDataTableProps,
  type Column,
  type FilterConfig,
  type SavedView,
} from './EnterpriseDataTable';

// ============================================================================
// NAVIGATION & SEARCH
// ============================================================================
export {
  CommandPalette,
  type CommandPaletteProps,
  type CommandAction,
  type SearchResult,
} from './CommandPalette';

// ============================================================================
// MODALS & DIALOGS
// ============================================================================
export {
  EnterpriseModal,
  type EnterpriseModalProps,
  type WizardStep,
  type ModalVariant,
  type ModalSize,
  type DrawerPosition,
  type ConfirmationType,
} from './EnterpriseModal';

// ============================================================================
// FORMS
// ============================================================================
export {
  EnterpriseForm,
  type EnterpriseFormProps,
  type FormField,
  type FormSection,
  type ValidationRule,
  type FieldDependency,
  type FieldType,
} from './EnterpriseForm';

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export {
  NotificationProvider,
  NotificationCenter,
  NotificationBell,
  useNotifications,
  useToast,
  type Notification,
  type NotificationType,
  type NotificationAction,
  type NotificationContextValue,
} from './NotificationSystem';

// ============================================================================
// STATUS & METRICS
// ============================================================================
export {
  StatusBadge,
  type StatusBadgeProps,
  type StatusVariant,
} from './StatusBadge';

export {
  MetricCard,
  type MetricCardProps,
} from './MetricCard';

// ============================================================================
// ACTIVITY & FEEDS
// ============================================================================
export {
  ActivityFeed,
  type ActivityFeedProps,
  type ActivityItem,
  type ActivityType,
} from './ActivityFeed';
