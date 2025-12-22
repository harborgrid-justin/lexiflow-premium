/**
 * @module components/layout/NotificationPanel
 * @category Layout
 * @description Persistent notification panel with action buttons and grouping.
 */

import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useModalState } from '../../hooks/useModalState';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import type { Notification, NotificationGroup } from '../../types';
import { NotificationService } from '../../services/domain/NotificationDomain';
import { formatDistanceToNow } from 'date-fns';

export const NotificationPanel: React.FC = () => {
  const { theme } = useTheme();
  const panel = useModalState();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [groupedNotifications, setGroupedNotifications] = useState<(Notification | NotificationGroup)[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Subscribe to notifications
  useEffect(() => {
    const unsubscribe = NotificationService.subscribe((notifications) => {
      setNotifications(notifications);
      setGroupedNotifications(NotificationService.getGrouped());
    });

    return unsubscribe;
  }, []);

  const unreadCount = NotificationService.getUnreadCount();

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
                NotificationService.remove(notification.id);
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
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </span>

            {notification.priority !== 'normal' && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                notification.priority === 'urgent' && "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
                notification.priority === 'high' && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
              )}>
                {notification.priority}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {notification.actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    action.onClick();
                    NotificationService.remove(notification.id);
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    action.variant === 'primary' && cn(theme.primary.DEFAULT, 'text-white'),
                    action.variant === 'danger' && "bg-rose-500 text-white hover:bg-rose-600",
                    !action.variant && cn(theme.surface.input, theme.text.primary, "hover:bg-slate-200 dark:hover:bg-slate-700")
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * Render notification group
   */
  const renderGroup = (group: NotificationGroup) => {
    const isExpanded = expandedGroups.has(group.groupKey);

    return (
      <div key={group.groupKey} className={cn("border-b", theme.border.default)}>
        <button
          onClick={() => toggleGroup(group.groupKey)}
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
              {group.count}
            </div>
            <div className="text-left">
              <p className={cn("font-medium text-sm", theme.text.primary)}>
                {group.notifications[0].title}
              </p>
              <p className={cn("text-xs", theme.text.tertiary)}>
                {formatDistanceToNow(group.latestTimestamp, { addSuffix: true })}
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
            {group.notifications.map(renderNotification)}
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
                    onClick={() => NotificationService.markAllAsRead()}
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
                  onClick={() => setIsOpen(false)}
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
                  onClick={() => {
                    NotificationService.clearAll();
                    setIsOpen(false);
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
};

export default NotificationPanel;

