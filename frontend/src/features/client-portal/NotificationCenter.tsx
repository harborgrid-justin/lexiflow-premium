import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Mail, FileText, Calendar, DollarSign, AlertCircle } from 'lucide-react';

interface Notification {
  id: string;
  notificationType: string;
  title: string;
  message: string;
  read: boolean;
  sentAt: Date;
  priority: string;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationCenterProps {
  portalUserId: string;
}

export default function NotificationCenter({ portalUserId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, [portalUserId, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ portalUserId });
      if (filter === 'unread') {
        params.append('read', 'false');
      }
      const response = await fetch(`/api/client-portal/notifications?${params}`);
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/client-portal/notifications/${notificationId}/read?portalUserId=${portalUserId}`, {
        method: 'PUT',
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`/api/client-portal/notifications/mark-all-read?portalUserId=${portalUserId}`, {
        method: 'PUT',
      });
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleDismiss = async (notificationId: string) => {
    try {
      await fetch(`/api/client-portal/notifications/${notificationId}/dismiss?portalUserId=${portalUserId}`, {
        method: 'PUT',
      });
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-2 text-gray-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`flex-1 px-6 py-4 text-sm font-medium ${
              filter === 'unread'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={() => handleMarkAsRead(notification.id)}
              onDismiss={() => handleDismiss(notification.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No notifications to display</p>
        </div>
      )}
    </div>
  );
}

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onDismiss: () => void;
}

function NotificationCard({ notification, onMarkAsRead, onDismiss }: NotificationCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'document_shared':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'appointment_scheduled':
      case 'appointment_reminder':
      case 'appointment_cancelled':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'invoice_generated':
      case 'payment_received':
      case 'payment_due':
        return <DollarSign className="w-5 h-5 text-yellow-600" />;
      case 'deadline_approaching':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-orange-500 bg-orange-50';
      default:
        return '';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow ${
        !notification.read ? 'bg-blue-50 bg-opacity-50' : ''
      } ${getPriorityClass(notification.priority)}`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="flex-shrink-0 mt-1">{getIcon(notification.notificationType)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h3>
                <span className="text-xs text-gray-500 ml-4 flex-shrink-0">
                  {formatTimestamp(notification.sentAt)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
              {notification.actionUrl && notification.actionText && (
                <a
                  href={notification.actionUrl}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {notification.actionText} →
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {!notification.read && (
              <button
                onClick={onMarkAsRead}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                title="Mark as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onDismiss}
              className="p-2 text-gray-400 hover:bg-gray-50 rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
