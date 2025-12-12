import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Settings, AlertCircle } from 'lucide-react';
import { notificationService, Notification, NotificationType } from '../../services/notificationService';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

/**
 * NotificationCenter Component
 *
 * Displays real-time notifications in a dropdown panel
 * Features:
 * - Real-time notification updates via WebSocket
 * - Unread count badge
 * - Mark as read/unread
 * - Delete notifications
 * - Priority-based styling
 * - Action links
 */

interface NotificationCenterProps {
  className?: string;
  maxHeight?: string;
}

const NOTIFICATION_ICONS: Record<NotificationType, React.ComponentType<any>> = {
  case_update: AlertCircle,
  document_upload: AlertCircle,
  deadline_reminder: AlertCircle,
  task_assignment: AlertCircle,
  message: Bell,
  invoice: AlertCircle,
  system: AlertCircle,
  alert: AlertCircle,
};

const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  case_update: 'text-blue-500',
  document_upload: 'text-green-500',
  deadline_reminder: 'text-red-500',
  task_assignment: 'text-purple-500',
  message: 'text-blue-500',
  invoice: 'text-yellow-500',
  system: 'text-gray-500',
  alert: 'text-red-500',
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
  maxHeight = '600px',
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize notification service
  useEffect(() => {
    const initialize = async () => {
      try {
        await notificationService.initialize({
          apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
          userId: 'current-user-id', // Replace with actual user ID from auth context
        });

        console.log('[NotificationCenter] Notification service initialized');
      } catch (error) {
        console.error('[NotificationCenter] Failed to initialize:', error);
      }
    };

    initialize();

    return () => {
      notificationService.disconnect();
    };
  }, []);

  // Subscribe to new notifications
  useEffect(() => {
    const unsubscribe = notificationService.onNotification((notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return unsubscribe;
  }, []);

  // Subscribe to unread count changes
  useEffect(() => {
    const unsubscribe = notificationService.onCountChange((count) => {
      setUnreadCount(count);
    });

    return unsubscribe;
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error('[NotificationCenter] Failed to mark as read:', error);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('[NotificationCenter] Failed to mark all as read:', error);
    }
  }, []);

  const handleDelete = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('[NotificationCenter] Failed to delete notification:', error);
    }
  }, []);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.read) {
        handleMarkAsRead(notification.id);
      }

      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    },
    [handleMarkAsRead],
  );

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.read : true,
  );

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={cn('relative', className)} ref={panelRef}>
      {/* Bell Icon with Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative p-2 rounded-lg transition-colors',
          theme.surface.default,
          theme.text.secondary,
          'hover:' + theme.primary.light,
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-96 rounded-lg shadow-xl border z-50',
            theme.surface.default,
            theme.border.default,
          )}
          style={{ maxHeight }}
        >
          {/* Header */}
          <div className={cn('p-4 border-b', theme.border.default)}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn('text-lg font-semibold', theme.text.primary)}>Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className={cn('p-1 rounded hover:' + theme.surfaceHighlight, theme.text.tertiary)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  filter === 'all'
                    ? cn(theme.primary.bg, theme.primary.text)
                    : cn(theme.surfaceHighlight, theme.text.secondary),
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={cn(
                  'px-3 py-1 rounded-md text-sm font-medium transition-colors',
                  filter === 'unread'
                    ? cn(theme.primary.bg, theme.primary.text)
                    : cn(theme.surfaceHighlight, theme.text.secondary),
                )}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>
          </div>

          {/* Actions */}
          {filteredNotifications.length > 0 && (
            <div className={cn('px-4 py-2 border-b flex justify-between', theme.border.default)}>
              <button
                onClick={handleMarkAllAsRead}
                className={cn(
                  'text-sm font-medium transition-colors',
                  theme.primary.text,
                  'hover:opacity-80',
                )}
              >
                <CheckCheck className="h-4 w-4 inline mr-1" />
                Mark all as read
              </button>
              <button
                className={cn(
                  'text-sm font-medium transition-colors',
                  theme.text.secondary,
                  'hover:' + theme.text.primary,
                )}
              >
                <Settings className="h-4 w-4 inline mr-1" />
                Settings
              </button>
            </div>
          )}

          {/* Notification List */}
          <div className="overflow-y-auto" style={{ maxHeight: '450px' }}>
            {filteredNotifications.length === 0 ? (
              <div className={cn('p-8 text-center', theme.text.tertiary)}>
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                const iconColor = NOTIFICATION_COLORS[notification.type];

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 border-b transition-colors cursor-pointer',
                      theme.border.light,
                      !notification.read && theme.surfaceHighlight,
                      'hover:' + theme.surfaceHighlight,
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <Icon className={cn('h-5 w-5', iconColor)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={cn(
                              'text-sm font-semibold',
                              !notification.read ? theme.text.primary : theme.text.secondary,
                            )}
                          >
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>

                        <p className={cn('text-sm mb-2', theme.text.tertiary)}>
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className={cn('text-xs', theme.text.tertiary)}>
                            {formatTimestamp(notification.createdAt)}
                          </span>

                          <div className="flex gap-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className={cn(
                                  'p-1 rounded hover:' + theme.surfaceHighlight,
                                  theme.text.tertiary,
                                )}
                                title="Mark as read"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className={cn(
                                'p-1 rounded hover:bg-red-50',
                                theme.text.tertiary,
                                'hover:text-red-500',
                              )}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
