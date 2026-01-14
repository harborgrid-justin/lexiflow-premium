/**
 * @module components/ui/molecules/NotificationCenter
 * @category UI Components
 * @description Enterprise notification center with filtering, categorization, and real-time updates.
 */

import { ThemeStateValue, useTheme } from '@/theme';
import { useClickOutside } from '@/shared/hooks/useClickOutside';
import { cn } from '@/shared/lib/cn';
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle,
  Info,
  SettingsIcon,
  Trash2,
  XCircle,
} from 'lucide-react';
import React, { useRef, useState } from 'react';

// ========================================
// TYPES & INTERFACES
// ========================================
export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}

export interface NotificationCenterProps {
  /** Array of notifications */
  notifications?: Notification[];
  /** Callback when notification is clicked */
  onNotificationClick?: (notification: Notification) => void;
  /** Callback when notification is dismissed */
  onNotificationDismiss?: (id: string) => void;
  /** Callback when all notifications are marked as read */
  onMarkAllRead?: () => void;
  /** Callback when notifications are cleared */
  onClearAll?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// ========================================
// HELPER FUNCTIONS
// ========================================
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'warning':
      return AlertCircle;
    case 'error':
      return XCircle;
    case 'info':
    case 'system':
    default:
      return Info;
  }
};

const getNotificationColor = (type: NotificationType, theme: ThemeStateValue['theme']) => {
  switch (type) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'warning':
      return 'text-orange-600 dark:text-orange-400';
    case 'error':
      return 'text-red-600 dark:text-red-400';
    case 'info':
      return 'text-blue-600 dark:text-blue-400';
    case 'system':
    default:
      return theme.text.secondary;
  }
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// ========================================
// COMPONENT
// ========================================
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  onNotificationClick,
  onNotificationDismiss,
  onMarkAllRead,
  onClearAll,
  className,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside(panelRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onNotificationDismiss?.(id);
  };

  return (
    <div className={cn('relative', className)} ref={panelRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-colors group',
          theme.text.tertiary,
          `hover:${theme.surface.highlight}`,
          `hover:${theme.text.secondary}`
        )}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className={cn(
              'absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse'
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-2 w-96 max-h-[600px] flex flex-col rounded-lg shadow-2xl border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200',
            theme.surface.default,
            theme.border.default
          )}
        >
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-4 py-3 border-b',
              theme.border.default
            )}
          >
            <h3 className={cn('text-sm font-semibold', theme.text.primary)}>
              Notifications
              {unreadCount > 0 && (
                <span className={cn('ml-2 text-xs', theme.text.tertiary)}>
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className={cn(
                    'text-xs px-2 py-1 rounded transition-colors',
                    theme.primary.text,
                    `hover:${theme.surface.highlight}`
                  )}
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              <button
                className={cn(
                  'p-1 rounded transition-colors',
                  theme.text.tertiary,
                  `hover:${theme.surface.highlight}`
                )}
                title="Notification settings"
              >
                <SettingsIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            className={cn(
              'flex items-center gap-1 px-4 py-2 border-b overflow-x-auto',
              theme.border.default
            )}
          >
            {(['all', 'system', 'success', 'info', 'warning', 'error'] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap',
                    filter === type
                      ? cn(theme.primary.main, theme.primary.text)
                      : cn(
                        theme.text.secondary,
                        `hover:${theme.surface.highlight}`
                      )
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell
                  className={cn('w-12 h-12 mb-3', theme.text.tertiary)}
                  strokeWidth={1.5}
                />
                <p className={cn('text-sm', theme.text.secondary)}>
                  No notifications
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type, theme);

                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'px-4 py-3 transition-colors cursor-pointer relative',
                        !notification.read && 'bg-blue-50/50 dark:bg-blue-900/10',
                        `hover:${theme.surface.highlight}`
                      )}
                    >
                      <div className="flex gap-3">
                        <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', iconColor)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4
                              className={cn(
                                'text-sm font-medium',
                                theme.text.primary
                              )}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                            )}
                          </div>
                          <p
                            className={cn(
                              'text-xs mb-2 line-clamp-2',
                              theme.text.secondary
                            )}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span
                              className={cn('text-[10px]', theme.text.tertiary)}
                            >
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.actionLabel && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  notification.actionCallback?.();
                                }}
                                className={cn(
                                  'text-[10px] px-2 py-1 rounded font-medium transition-colors',
                                  theme.primary.text,
                                  `hover:${theme.primary.main}`
                                )}
                              >
                                {notification.actionLabel}
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDismiss(e, notification.id)}
                          className={cn(
                            'p-1 rounded transition-colors shrink-0',
                            theme.text.tertiary,
                            `hover:${theme.surface.highlight}`,
                            'hover:text-red-600'
                          )}
                          title="Dismiss"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div
              className={cn(
                'flex items-center justify-center px-4 py-3 border-t',
                theme.border.default
              )}
            >
              <button
                onClick={onClearAll}
                className={cn(
                  'text-xs font-medium px-4 py-2 rounded transition-colors',
                  theme.text.secondary,
                  `hover:${theme.surface.highlight}`,
                  `hover:${theme.text.primary}`
                )}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

NotificationCenter.displayName = 'NotificationCenter';
