/**
 * NotificationList Component
 * Displays a list of notifications with filtering and grouping
 */

import React, { useState, useTransition, useMemo, useCallback } from 'react';
import type { ApiNotification } from '@/api/communications/notifications-api';
import { formatDistanceToNow } from 'date-fns';

export interface NotificationListProps {
  notifications: ApiNotification[];
  onMarkAsRead?: (notification: ApiNotification) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (notification: ApiNotification) => void;
  onClearAll?: () => void;
  onNotificationClick?: (notification: ApiNotification) => void;
  isLoading?: boolean;
  showFilters?: boolean;
  className?: string;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNotificationClick,
  isLoading = false,
  showFilters = true,
  className = '',
}: NotificationListProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = useCallback((newFilter: 'all' | 'unread' | 'high') => {
    startTransition(() => {
      setFilter(newFilter);
    });
  }, []);

  const handleTypeFilterChange = useCallback((newTypeFilter: string) => {
    startTransition(() => {
      setTypeFilter(newTypeFilter);
    });
  }, []);

  // Apply filters (memoized for performance)
  const filteredNotifications = useMemo(() =>
    notifications.filter((notification) => {
      const matchesReadFilter =
        filter === 'all' ||
        (filter === 'unread' && !notification.read) ||
        (filter === 'high' && notification.priority === 'high');

      const matchesTypeFilter = typeFilter === 'all' || notification.type === typeFilter;

      return matchesReadFilter && matchesTypeFilter;
    }),
    [notifications, filter, typeFilter]
  );

  // Group notifications by date (memoized)
  const groupedNotifications = useMemo(() =>
    filteredNotifications.reduce((groups, notification) => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
      return groups;
    }, {} as Record<string, ApiNotification[]>),
    [filteredNotifications]
  );

  const getNotificationIcon = useCallback((type: ApiNotification['type']) => {
    switch (type) {
      case 'success':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
            <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'deadline':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'case_update':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
        );
      case 'document':
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/20">
            <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
            <svg className="h-6 w-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with filters */}
      {showFilters && (
        <div className="mb-4 flex flex-col gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h2>
            <div className="flex gap-2">
              {onMarkAllAsRead && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              )}
              {onClearAll && (
                <button
                  onClick={onClearAll}
                  className="text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'unread', 'high'] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`rounded-md px-3 py-1 text-sm font-medium capitalize ${filter === filterType
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
              >
                {filterType === 'high' ? 'High Priority' : filterType}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="all">All Types</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="deadline">Deadline</option>
            <option value="case_update">Case Update</option>
            <option value="document">Document</option>
            <option value="task">Task</option>
          </select>
        </div>
      )}

      {/* Notification list */}
      {Object.keys(groupedNotifications).length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <svg
            className="mb-4 h-16 w-16 text-gray-300 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([dateGroup, groupNotifications]) => (
            <div key={dateGroup}>
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                {dateGroup}
              </h3>
              <div className="space-y-2">
                {groupNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => onNotificationClick?.(notification)}
                    className={`group relative flex gap-3 rounded-lg p-4 transition-colors ${notification.read
                        ? 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-750'
                        : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30'
                      } ${onNotificationClick ? 'cursor-pointer' : ''}`}
                  >
                    {/* Icon */}
                    {getNotificationIcon(notification.type)}

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`text-sm font-semibold ${notification.read
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-blue-900 dark:text-blue-100'
                          }`}>
                          {notification.title}
                        </h4>
                        <span className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{notification.message}</p>

                      {/* Action button */}
                      {notification.actionUrl && notification.actionLabel && (
                        <a
                          href={notification.actionUrl}
                          className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notification.actionLabel} →
                        </a>
                      )}

                      {/* Priority indicator */}
                      {notification.priority === 'urgent' && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Actions (visible on hover) */}
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!notification.read && onMarkAsRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification);
                          }}
                          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                          title="Mark as read"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification);
                          }}
                          className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Unread indicator dot */}
                    {!notification.read && (
                      <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
