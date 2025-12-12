/**
 * NotificationCenter Component
 * Central hub for managing and displaying notifications
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNotificationStream } from '../../hooks/useNotificationStream';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '../../hooks/useNotificationStream';

interface NotificationCenterProps {
  maxHeight?: string;
  showFilters?: boolean;
  className?: string;
}

type NotificationFilter = 'all' | 'unread' | 'case' | 'document' | 'billing' | 'chat' | 'system';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  maxHeight = '500px',
  showFilters = true,
  className = '',
}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getUnread,
  } = useNotificationStream();

  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [isOpen, setIsOpen] = useState(false);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return getUnread();

    // Filter by type
    return notifications.filter(n => {
      if (filter === 'case') return n.type.startsWith('case_');
      if (filter === 'document') return n.type.startsWith('document_');
      if (filter === 'billing') return n.type.startsWith('billing_');
      if (filter === 'chat') return n.type.startsWith('chat_');
      if (filter === 'system') return n.type.startsWith('system_');
      return true;
    });
  }, [notifications, filter, getUnread]);

  // Handle notification click
  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }, [markAsRead]);

  // Handle dismiss
  const handleDismiss = useCallback((notificationId: string) => {
    removeNotification(notificationId);
  }, [removeNotification]);

  return (
    <div className={`notification-center ${className}`}>
      {/* Header */}
      <div className="notification-center-header">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded-full">
                {unreadCount}
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 rounded hover:bg-gray-100"
              aria-label={isOpen ? 'Close notifications' : 'Open notifications'}
            >
              {isOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        {isOpen && notifications.length > 0 && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        {isOpen && showFilters && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {(['all', 'unread', 'case', 'document', 'billing', 'chat', 'system'] as NotificationFilter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notification List */}
      {isOpen && (
        <div
          className="notification-list mt-4 overflow-y-auto"
          style={{ maxHeight }}
        >
          {filteredNotifications.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onDismiss={() => handleDismiss(notification.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
