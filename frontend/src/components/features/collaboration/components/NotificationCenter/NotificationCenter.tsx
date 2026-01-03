/**
 * @module components/features/notifications/NotificationCenter
 * @category Features
 * @description Centralized notification management interface with real-time data fetching and mutations.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useState, useMemo, useDeferredValue } from 'react';
import { Bell, Check, Trash2, Settings, CheckCheck } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services/data/dataService';

// Hooks & Context
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { useToast } from '@/providers/ToastContext';

// Components
import { Button } from '@/components/ui/atoms/Button';
import { Badge } from '@/components/ui/atoms/Badge';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { Modal } from '@/components/ui/molecules/Modal/Modal';

// Utils
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  category: 'system' | 'case' | 'document' | 'deadline' | 'billing';
}

// ============================================================================
// COMPONENT
// ============================================================================
export const NotificationCenter: React.FC = () => {
  const { theme } = useTheme();
  const { addToast } = useToast();

  // Local State for UI only
  const [filter, setFilter] = useState<string>('all');
  const deferredFilter = useDeferredValue(filter);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    deadlineReminders: true,
    documentUpdates: true,
    billingAlerts: true,
    systemAlerts: true,
  });

  // --- DATA FETCHING ---
  const { data: notifications = [], isLoading } = useQuery<Notification[]>(
    ['notifications', 'all'],
    () => DataService.notifications.getAll(),
    { staleTime: 30000 }
  );

  // --- MUTATIONS ---
  const { mutate: markAsRead } = useMutation(
    (id: string) => DataService.notifications.markAsRead(id),
    {
      onSuccess: () => {
        queryClient.invalidate(['notifications']);
        addToast('Notification marked as read', 'success');
      }
    }
  );

  const { mutate: markAllAsRead } = useMutation(
    () => DataService.notifications.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidate(['notifications']);
        addToast('All notifications marked as read', 'success');
      }
    }
  );

  const { mutate: deleteNotification } = useMutation(
    (id: string) => DataService.notifications.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidate(['notifications']);
        addToast('Notification deleted', 'info');
      }
    }
  );

  // --- LOGIC ---
  const filteredNotifications = useMemo(() => notifications.filter(n => {
    if (deferredFilter === 'all') return true;
    if (deferredFilter === 'unread') return !n.isRead;
    return n.category === deferredFilter;
  }), [notifications, deferredFilter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
            <Button
                variant="secondary"
                icon={CheckCheck}
                onClick={() => markAllAsRead(undefined)}
                disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button variant="secondary" icon={Settings} onClick={() => setIsPreferencesOpen(true)}>
              Preferences
            </Button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className={cn("flex gap-2 mb-6 p-1.5 rounded-lg border overflow-x-auto", theme.surface.highlight, theme.border.default)}>
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
              "px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap",
              filter === tab.id
                ? cn(theme.surface.default, theme.primary.text, "shadow-sm border", theme.border.default)
                : cn(theme.text.secondary, "hover:bg-black/5")
            )}
          >
            {tab.label}
            {tab.id === 'unread' && unreadCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading ? (
            <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-24 w-full animate-pulse bg-slate-200 rounded-lg" />)}
            </div>
        ) : filteredNotifications.map(notification => (
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
              <div className="flex items-start gap-4">
                <div className={cn("p-2 rounded-full bg-opacity-10", getTypeColor(notification.type).replace('text', 'bg'))}>
                    <Bell className={cn("h-5 w-5", getTypeColor(notification.type))} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={cn("font-bold", theme.text.primary)}>{notification.title}</h4>
                    <Badge variant={getTypeBadgeVariant(notification.type)}>
                      {notification.type}
                    </Badge>
                  </div>
                  <p className={cn("text-sm mt-1 leading-relaxed", theme.text.secondary)}>{notification.message}</p>
                  <p className={cn("text-[10px] mt-2 font-mono uppercase tracking-wider", theme.text.tertiary)}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
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

        {!isLoading && filteredNotifications.length === 0 && (
          <div className={cn("text-center py-20", theme.text.tertiary)}>
            <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 opacity-20" />
            </div>
            <p className="text-lg font-bold">No notifications</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      <Modal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} title="Notification Preferences">
        <div className="p-6 space-y-4">
          {Object.entries(preferences).map(([key, value]) => (
            <label key={key} className={cn("flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors", theme.surface.default, theme.border.default, "hover:border-blue-400")}>
              <span className={cn("font-semibold capitalize", theme.text.primary)}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferences({ ...preferences, [key]: e.target.checked })}
                className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </label>
          ))}
          <div className="flex justify-end pt-6">
            <Button variant="primary" onClick={() => { setIsPreferencesOpen(false); addToast('Preferences saved', 'success'); }}>
              Save Settings
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationCenter;
