/**
 * @module components/enterprise/notifications/NotificationPanel
 * @category Enterprise - Notifications
 * @description Dropdown panel for displaying and managing notifications
 */

import React, { useMemo } from 'react';
import type { UINotification } from '@/types/notifications';
import { cn } from '@/lib/cn';
import { useTheme } from "@/hooks/useTheme";
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Briefcase,
  Calendar,
  CheckCheck,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Info,
  Trash2,
  X,
} from 'lucide-react';
import { useMemo } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface NotificationPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** List of notifications */
  notifications: UINotification[];
  /** Mark single notification as read */
  onMarkAsRead: (id: string) => void;
  /** Mark all notifications as read */
  onMarkAllAsRead: () => void;
  /** Delete single notification */
  onDelete: (id: string) => void;
  /** Clear all notifications */
  onClearAll: () => void;
  /** Navigate to notification center */
  onViewAll?: () => void;
  /** Max height of the panel */
  maxHeight?: string;
  /** Position of the panel */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Custom className */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const NotificationPanelComponent: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onViewAll,
  maxHeight = 'calc(100vh - 6rem)',
  position = 'top-right',
  className,
  isLoading = false,
}) => {
  const { theme, tokens } = useTheme();

  // Calculate unread count
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  // Get notification icon based on type
  const getNotificationIcon = (notification: UINotification) => {
    // Check for related entity type first
    if ('relatedEntityType' in notification) {
      const entityType = (notification as Record<string, unknown>).relatedEntityType;
      switch (entityType) {
        case 'case':
          return <Briefcase className="h-5 w-5 text-blue-500" />;
        case 'document':
          return <FileText className="h-5 w-5 text-purple-500" />;
        case 'calendar':
          return <Calendar className="h-5 w-5 text-orange-500" />;
        case 'billing':
          return <CreditCard className="h-5 w-5 text-green-500" />;
      }
    }

    // Fall back to notification type
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: UINotification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300';
      case 'high':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      case 'normal':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  // Position classes
  const positionClasses = {
    'top-right': 'top-16 right-4',
    'top-left': 'top-16 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed z-50 w-96 rounded-xl border shadow-2xl overflow-hidden flex flex-col',
              'bg-white dark:bg-slate-800',
              'border-slate-200 dark:border-slate-700',
              positionClasses[position],
              className
            )}
            style={{ maxHeight }}
            role="dialog"
            aria-label="Notifications panel"
            aria-modal="true"
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: tokens.spacing.normal.lg,
              borderBottom: `1px solid ${theme.border.default}`,
              backgroundColor: theme.surface.elevated
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.compact.xs }}>
                <h3 style={{ fontWeight: tokens.typography.fontWeight.bold, fontSize: tokens.typography.fontSize.lg, color: theme.text.primary }}>
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span style={{
                    padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.bold,
                    backgroundColor: theme.status.error.bg,
                    color: theme.surface.base,
                    borderRadius: tokens.borderRadius.full
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.compact.xs }}>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: theme.primary.DEFAULT,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                      borderRadius: tokens.borderRadius.md,
                      textDecoration: 'none'
                    }}
                    className="focus:outline-none focus:ring-2"
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    aria-label="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4 inline mr-1" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    padding: tokens.spacing.compact.xs,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: theme.text.muted,
                    transition: 'background-color 0.2s'
                  }}
                  className="focus:outline-none focus:ring-2"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label="Close notifications panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '2rem',
                    height: '2rem',
                    border: `4px solid ${theme.primary.DEFAULT}`,
                    borderRightColor: 'transparent',
                    borderRadius: '50%'
                  }} className="animate-spin" role="status">
                    <span className="sr-only">Loading notifications...</span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <Bell style={{ width: '3rem', height: '3rem', margin: '0 auto 0.75rem', color: theme.text.muted }} />
                  <p style={{ fontSize: tokens.typography.fontSize.sm, color: theme.text.muted, fontWeight: tokens.typography.fontWeight.medium }}>
                    No notifications
                  </p>
                  <p style={{ fontSize: tokens.typography.fontSize.xs, color: theme.text.muted, marginTop: tokens.spacing.compact.xs }}>
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  <AnimatePresence initial={false}>
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        style={{
                          padding: tokens.spacing.normal.lg,
                          backgroundColor: !notification.read ? theme.primary.DEFAULT + '10' : theme.surface.base,
                          transition: 'background-color 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.surface.hover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !notification.read ? theme.primary.DEFAULT + '10' : theme.surface.base}
                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
                        className="group"
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" aria-label="Unread" />
                              )}
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(notification.timestamp), {
                                  addSuffix: true,
                                })}
                              </span>

                              {notification.priority !== 'normal' && (
                                <span
                                  className={cn(
                                    'text-xs px-2 py-0.5 rounded-full font-medium',
                                    getPriorityColor(notification.priority)
                                  )}
                                >
                                  {notification.priority}
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            {notification.actions && notification.actions.length > 0 && (
                              <div className="flex items-center gap-2 mt-3">
                                {notification.actions.map((action, idx) => (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      action.onClick();
                                    }}
                                    className={cn(
                                      'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                                      action.variant === 'primary' &&
                                      'bg-blue-600 text-white hover:bg-blue-700',
                                      action.variant === 'danger' &&
                                      'bg-red-600 text-white hover:bg-red-700',
                                      (!action.variant || action.variant === 'secondary') &&
                                      'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                                    )}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification.id);
                            }}
                            className="flex-shrink-0 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 dark:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: tokens.spacing.normal.md,
                borderTop: `1px solid ${theme.border.default}`,
                backgroundColor: theme.surface.elevated,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: tokens.spacing.compact.xs
              }}>
                {onViewAll && (
                  <button
                    onClick={onViewAll}
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: theme.primary.DEFAULT,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                      borderRadius: tokens.borderRadius.md,
                      textDecoration: 'none'
                    }}
                    className="focus:outline-none focus:ring-2"
                    onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                  >
                    View all notifications
                  </button>
                )}
                <button
                  onClick={onClearAll}
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: theme.text.secondary,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: `${tokens.spacing.compact.xs} ${tokens.spacing.compact.sm}`,
                    borderRadius: tokens.borderRadius.md,
                    transition: 'color 0.2s'
                  }}
                  className="focus:outline-none focus:ring-2"
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.text.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
                  aria-label="Clear all notifications"
                >
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const NotificationPanel = React.memo(NotificationPanelComponent);
NotificationPanel.displayName = 'NotificationPanel';
export default NotificationPanel;
