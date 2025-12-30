/**
 * @module components/enterprise/notifications/NotificationPanel
 * @category Enterprise - Notifications
 * @description Dropdown panel for displaying and managing notifications
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  Trash2,
  CheckCheck,
  Clock,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Calendar,
  Briefcase,
  CreditCard,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';
import type { UINotification } from '@/types/notifications';

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
export const NotificationPanel: React.FC<NotificationPanelProps> = ({
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
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                    aria-label="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4 inline mr-1" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Close notifications panel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                    <span className="sr-only">Loading notifications...</span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    No notifications
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
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
                        className={cn(
                          'p-4 transition-colors cursor-pointer group',
                          !notification.read
                            ? 'bg-blue-50/50 dark:bg-blue-900/10'
                            : 'bg-white dark:bg-slate-800',
                          'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        )}
                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
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
              <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
                {onViewAll && (
                  <button
                    onClick={onViewAll}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                  >
                    View all notifications
                  </button>
                )}
                <button
                  onClick={onClearAll}
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
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

export default NotificationPanel;
