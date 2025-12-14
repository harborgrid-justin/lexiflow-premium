import React, { useState } from 'react';
import { Bell, Check, Trash2, Settings, Filter, CheckCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { PageHeader } from '../common/PageHeader';
import { Modal } from '../common/Modal';
import { useNotify } from '../../hooks/useNotify';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  category: 'system' | 'case' | 'document' | 'deadline' | 'billing';
}

const mockNotifications: Notification[] = [
  { id: '1', type: 'warning', title: 'Deadline Approaching', message: 'Discovery response due in 3 days for Case #2024-001', isRead: false, createdAt: '2024-01-15T10:30:00Z', category: 'deadline' },
  { id: '2', type: 'info', title: 'Document Uploaded', message: 'New document uploaded to Smith v. Jones case', isRead: false, createdAt: '2024-01-15T09:15:00Z', category: 'document' },
  { id: '3', type: 'success', title: 'Invoice Paid', message: 'Invoice #INV-2024-042 has been marked as paid', isRead: true, createdAt: '2024-01-14T16:45:00Z', category: 'billing' },
  { id: '4', type: 'error', title: 'Sync Failed', message: 'Failed to sync with PACER. Please try again.', isRead: true, createdAt: '2024-01-14T14:20:00Z', category: 'system' },
];

export const NotificationCenter: React.FC = () => {
  const { theme } = useTheme();
  const notify = useNotify();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<string>('all');
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    deadlineReminders: true,
    documentUpdates: true,
    billingAlerts: true,
    systemAlerts: true,
  });

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.category === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    notify.success('Notification marked as read');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    notify.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    notify.success('Notification deleted');
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-amber-500';
      case 'error': return 'text-red-500';
      default: return 'text-blue-500';
    }
  };

  const getTypeBadgeVariant = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <div className={cn("h-full flex flex-col p-6", theme.background)}>
      <PageHeader
        title="Notification Center"
        subtitle={`${unreadCount} unread notifications`}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" icon={CheckCheck} onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark All Read
            </Button>
            <Button variant="secondary" icon={Settings} onClick={() => setIsPreferencesOpen(true)}>
              Preferences
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className={cn("flex gap-2 mb-6 p-2 rounded-lg border", theme.surface.highlight, theme.border.default)}>
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'deadline', label: 'Deadlines' },
          { id: 'document', label: 'Documents' },
          { id: 'billing', label: 'Billing' },
          { id: 'system', label: 'System' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              filter === tab.id
                ? cn(theme.surface.default, theme.primary.text, "shadow-sm")
                : cn(theme.text.secondary, "hover:bg-opacity-50")
            )}
          >
            {tab.label}
            {tab.id === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredNotifications.map(notification => (
          <div
            key={notification.id}
            className={cn(
              "p-4 rounded-lg border transition-all",
              notification.isRead ? theme.surface.default : theme.surface.highlight,
              theme.border.default,
              !notification.isRead && "border-l-4 border-l-blue-500"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Bell className={cn("h-5 w-5 mt-0.5", getTypeColor(notification.type))} />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={cn("font-semibold", theme.text.primary)}>{notification.title}</h4>
                    <Badge variant={getTypeBadgeVariant(notification.type)} size="sm">
                      {notification.type}
                    </Badge>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                  <p className={cn("text-sm mt-1", theme.text.secondary)}>{notification.message}</p>
                  <p className={cn("text-xs mt-2", theme.text.tertiary)}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                {!notification.isRead && (
                  <Button size="sm" variant="ghost" icon={Check} onClick={() => markAsRead(notification.id)}>
                    Read
                  </Button>
                )}
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => deleteNotification(notification.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className={cn("text-center py-12", theme.text.tertiary)}>
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      <Modal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} title="Notification Preferences">
        <div className="p-6 space-y-4">
          {Object.entries(preferences).map(([key, value]) => (
            <label key={key} className={cn("flex items-center justify-between p-3 rounded-lg border", theme.surface.default, theme.border.default)}>
              <span className={cn("font-medium capitalize", theme.text.primary)}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={e => setPreferences({ ...preferences, [key]: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          ))}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={() => { setIsPreferencesOpen(false); notify.success('Preferences saved'); }}>
              Save Preferences
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationCenter;
