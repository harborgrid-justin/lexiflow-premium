/**
 * @module components/layout/NotificationPanel
 * @category Layout
 * @description Persistent notification panel with action buttons and grouping.
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useModalState } from '@/hooks/useModalState';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import type { NotificationGroup } from '@/types';
import { NotificationService } from '@/services/domain/NotificationDomain';
import { formatDistanceToNow } from 'date-fns';

// Use the Notification type from NotificationDomain service
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  timestamp?: string;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export const NotificationPanel = React.memo(function NotificationPanel() {
  const { theme } = useTheme();
  const panel = useModalState();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<(Notification | NotificationGroup)[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      const allNotifications = (await NotificationService.getNotifications()) as Notification[];
      setNotifications(allNotifications);
      // Group notifications by similar titles
      const grouped = allNotifications.reduce((acc: (Notification | any)[], notification) => {
        const existing = acc.find(item => 'notifications' in item && item.notifications[0].title === notification.title);
        if (existing && 'notifications' in existing) {
          existing.notifications.push(notification);
          existing.count++;
          const notifDate = notification.createdAt || notification.timestamp;
          if (notifDate && new Date(notifDate).getTime() > existing.latestTimestamp) {
            existing.latestTimestamp = new Date(notifDate).getTime();
          }
        } else if (acc.some(item => !('notifications' in item) && item.title === notification.title)) {
          // Convert single notification to group
          const single = acc.find(item => !('notifications' in item) && item.title === notification.title) as Notification;
          const groupIndex = acc.indexOf(single);
          const singleDate = single.createdAt || single.timestamp || new Date().toISOString();
          const notifDate = notification.createdAt || notification.timestamp || new Date().toISOString();
          acc[groupIndex] = {
            groupKey: notification.title,
            notifications: [single, notification],
            count: 2,
            latestTimestamp: Math.max(new Date(singleDate).getTime(), new Date(notifDate).getTime()),
            collapsed: false,
          };
        } else {
          acc.push(notification);
        }
        return acc;
      }, []);
      setGroupedNotifications(grouped);
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const [unreadCount, setUnreadCount] = React.useState(0);

  useEffect(() => {
    NotificationService.getUnreadCount().then(setUnreadCount);
  }, [notifications]);

  /**
   * Get notification icon
   */
  const getIcon = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent') {
      return <AlertCircle className="h-5 w-5 text-rose-500" />;
    }

    switch (type) {
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

  /**
   * Toggle group expansion
   */
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  /**
   * Render single notification
   */
  const renderNotification = (notification: Notification) => (
    <div
      key={notification.id}
      className={cn(
        "p-4 border-b transition-colors",
        theme.border.default,
        !notification.read ? theme.surface.highlight : theme.surface.default,
        "hover:bg-slate-50 dark:hover:bg-slate-800"
      )}
      onClick={() => NotificationService.markAsRead(notification.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon(notification.type, notification.priority)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn("font-semibold text-sm", theme.text.primary)}>
              {notification.title}
            </h4>
            <button
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                NotificationService.delete(notification.id).then(() => {
                  setNotifications(prev => prev.filter(n => n.id !== notification.id));
                });
              }}
              className={cn(
                "flex-shrink-0 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700",
                theme.text.tertiary
              )}
              title="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {notification.message && (
            <p className={cn("text-sm mt-1", theme.text.secondary)}>
              {notification.message}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2">
            <span className={cn("text-xs flex items-center gap-1", theme.text.tertiary)}>
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(notification.createdAt || notification.timestamp || new Date()), { addSuffix: true })}
            </span>

            {notification.priority && notification.priority !== 'low' && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                notification.priority === 'urgent' && "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
                notification.priority === 'high' && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              )}>
                {notification.priority}
              </span>
            )}
          </div>

          {/* Action Button - Navigate to action URL if available */}
          {notification.actionUrl && notification.actionLabel && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  window.location.href = notification.actionUrl!;
                  NotificationService.delete(notification.id);
                }}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  theme.primary.DEFAULT, 'text-white'
                )}
              >
                {notification.actionLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * Render notification group
   */
  const renderGroup = (group: unknown) => {
    const typedGroup = group as NotificationGroup;
    const isExpanded = expandedGroups.has(typedGroup.groupKey);

    return (
      <div key={typedGroup.groupKey} className={cn("border-b", theme.border.default)}>
        <button
          onClick={() => toggleGroup(typedGroup.groupKey)}
          className={cn(
            "w-full p-4 flex items-center justify-between transition-colors",
            theme.surface.default,
            "hover:bg-slate-50 dark:hover:bg-slate-800"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm",
              theme.primary.DEFAULT,
              'text-white'
            )}>
              {typedGroup.count}
            </div>
            <div className="text-left">
              <p className={cn("font-medium text-sm", theme.text.primary)}>
                {typedGroup.notifications[0].title}
              </p>
              <p className={cn("text-xs", theme.text.tertiary)}>
                {formatDistanceToNow(new Date(typedGroup.latestTimestamp), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn("text-xs", theme.text.tertiary)}>
              {isExpanded ? 'Collapse' : 'Expand'}
            </span>
          </div>
        </button>

        {isExpanded && (
          <div className="pl-4">
            {typedGroup.notifications.map((n) => renderNotification(n as unknown as Notification))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Bell Icon Button */}
      <button
        onClick={panel.toggle}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          theme.surface.input,
          "hover:bg-slate-200 dark:hover:bg-slate-700"
        )}
        title="Notifications"
      >
        <Bell className={cn("h-5 w-5", theme.text.primary)} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {panel.isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={panel.close}
          />

          {/* Panel */}
          <div
            className={cn(
              "fixed top-16 right-4 w-96 max-h-[calc(100vh-5rem)] z-50 rounded-lg border shadow-xl overflow-hidden flex flex-col",
              theme.surface.default,
              theme.border.default
            )}
          >
            {/* Header */}
            <div className={cn(
              "p-4 border-b flex items-center justify-between",
              theme.surface.highlight,
              theme.border.default
            )}>
              <h3 className={cn("font-bold", theme.text.primary)}>
                Notifications
              </h3>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={async () => {
                      await NotificationService.markAllAsRead();
                      const updated = (await NotificationService.getNotifications()) as Notification[];
                      setNotifications(updated);
                    }}
                    className={cn(
                      "text-xs font-medium px-2 py-1 rounded transition-colors",
                      theme.primary.text,
                      "hover:underline"
                    )}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={panel.close}
                  className={cn(
                    "p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700",
                    theme.text.tertiary
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {groupedNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className={cn("h-12 w-12 mx-auto mb-3", theme.text.tertiary)} />
                  <p className={cn("text-sm", theme.text.secondary)}>
                    No notifications
                  </p>
                </div>
              ) : (
                <>
                  {groupedNotifications.map(item => {
                    if ('notifications' in item) {
                      return renderGroup(item);
                    } else {
                      return renderNotification(item);
                    }
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={cn(
                "p-3 border-t flex justify-center",
                theme.surface.highlight,
                theme.border.default
              )}>
                <button
                  onClick={async () => {
                    await Promise.all(notifications.map(n => NotificationService.delete(n.id)));
                    setNotifications([]);
                    setGroupedNotifications([]);
                    panel.close();
                  }}
                  className={cn(
                    "text-sm font-medium px-3 py-1.5 rounded transition-colors",
                    theme.text.secondary,
                    "hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
});

export default NotificationPanel;

