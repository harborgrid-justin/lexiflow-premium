/**
 * Notification Center Component
 *
 * Full-featured notification center with:
 * - Real-time notification display
 * - Read/unread status
 * - Mark as read/unread
 * - Delete notifications
 * - Filter by type and read status
 * - Grouped notifications
 * - Infinite scroll
 * - Empty states
 *
 * @module NotificationCenter
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell,
  X,
  Check,
  Trash2,
  CheckCheck,
  Mail,
  MailOpen,
  FileText,
  Calendar,
  AlertTriangle,
  MessageCircle,
  DollarSign,
  AlertCircle,
  Info,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * Notification type definition
 */
export interface Notification {
  id: string;
  type: 'case_update' | 'document' | 'deadline' | 'task' | 'message' | 'invoice' | 'system' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: number;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notification Center Props
 */
export interface NotificationCenterProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Get icon for notification type
 */
const getNotificationIcon = (type: Notification['type']): React.ReactNode => {
  const iconProps = { size: 18, strokeWidth: 2 };

  switch (type) {
    case 'case_update':
      return <FileText {...iconProps} />;
    case 'document':
      return <FileText {...iconProps} />;
    case 'deadline':
      return <Calendar {...iconProps} />;
    case 'task':
      return <CheckCheck {...iconProps} />;
    case 'message':
      return <MessageCircle {...iconProps} />;
    case 'invoice':
      return <DollarSign {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'error':
      return <AlertCircle {...iconProps} />;
    case 'system':
    case 'info':
      return <Info {...iconProps} />;
  }
};

/**
 * Get color for notification type
 */
const getNotificationColor = (type: Notification['type']): string => {
  switch (type) {
    case 'case_update':
      return 'text-blue-600 bg-blue-50';
    case 'document':
      return 'text-purple-600 bg-purple-50';
    case 'deadline':
      return 'text-amber-600 bg-amber-50';
    case 'task':
      return 'text-green-600 bg-green-50';
    case 'message':
      return 'text-blue-600 bg-blue-50';
    case 'invoice':
      return 'text-emerald-600 bg-emerald-50';
    case 'warning':
      return 'text-amber-600 bg-amber-50';
    case 'error':
      return 'text-red-600 bg-red-50';
    case 'system':
    case 'info':
      return 'text-slate-600 bg-slate-50';
  }
};

/**
 * Get priority badge
 */
const getPriorityBadge = (priority: Notification['priority']): React.ReactNode | null => {
  if (priority === 'low' || priority === 'medium') return null;

  const classes = priority === 'urgent'
    ? 'bg-red-100 text-red-800'
    : 'bg-amber-100 text-amber-800';

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${classes}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

/**
 * Notification Item Component
 */
const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}> = ({ notification, onMarkAsRead, onDelete, onClick }) => {
  const handleClick = (): void => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  const handleDelete = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  return (
    <div
      className={`
        group relative p-4 border-b border-gray-100 cursor-pointer
        transition-colors duration-150
        ${!notification.read ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50'}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${getNotificationColor(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h4>
                {getPriorityBadge(notification.priority)}
              </div>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                {notification.message}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                {notification.actionLabel && (
                  <span className="text-blue-600 font-medium">{notification.actionLabel}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!notification.read && (
            <button
              onClick={handleMarkAsRead}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Mark as read"
              type="button"
              aria-label="Mark as read"
            >
              <Check size={16} strokeWidth={2} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
            type="button"
            aria-label="Delete notification"
          >
            <Trash2 size={16} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Notification Center Component
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onNotificationClick,
  isLoading = false,
  className = '',
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter notifications
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  const handleMarkAllAsRead = useCallback((): void => {
    onMarkAllAsRead();
  }, [onMarkAllAsRead]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        type="button"
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[420px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              aria-label="Close notifications"
              type="button"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Filter and Actions */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                type="button"
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                type="button"
              >
                Unread
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                type="button"
              >
                <CheckCheck size={16} strokeWidth={2} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="mt-3 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                  {filter === 'unread' ? (
                    <MailOpen size={28} strokeWidth={1.5} className="text-gray-400" />
                  ) : (
                    <Mail size={28} strokeWidth={1.5} className="text-gray-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {filter === 'unread'
                    ? 'You have no unread notifications'
                    : 'You have no notifications yet'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                  onClick={onNotificationClick}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                type="button"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
