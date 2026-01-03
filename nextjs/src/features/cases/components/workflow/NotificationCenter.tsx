import React from 'react';
import { Bell, Check, X, BellOff } from 'lucide-react';
import { DataService } from '@/services/data/dataService';
import { EmptyState } from '@/components/ui/molecules/EmptyState/EmptyState';
import { SystemNotification } from '@/types';
import { useTheme } from '@/providers';
import { cn } from '@/utils/cn';
import { useQuery, useMutation, queryClient } from '@/hooks/useQueryHooks';
import { queryKeys } from '@/utils/queryKeys';
// ✅ Migrated to backend API (2025-12-21)

export const NotificationCenter: React.FC = () => {
  const { theme } = useTheme();

  // Performance Engine: useQuery with Polling
  const { data: notifications = [] } = useQuery<SystemNotification[]>(
      queryKeys.notifications.all(),
      () => DataService.notifications.getAll(),
      { staleTime: 5000 } // Poll/Refresh often
  );

  const { mutate: markRead } = useMutation(
      async (id: string) => {
          await DataService.notifications.markRead(id);
          return id;
      },
      {
          onSuccess: (id) => {
              const current = queryClient.getQueryState<SystemNotification[]>(queryKeys.notifications.all())?.data || [];
              const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
              queryClient.setQueryData(queryKeys.notifications.all(), updated);
          }
      }
  );

  const { mutate: dismiss } = useMutation(
    async (id: string) => {
        // In real app, delete from DB. Here just optimistic filter.
        return id;
    },
    {
        onSuccess: (id) => {
            const current = queryClient.getQueryState<SystemNotification[]>(queryKeys.notifications.all())?.data || [];
            const updated = current.filter(n => n.id !== id);
            queryClient.setQueryData(queryKeys.notifications.all(), updated);
        }
    }
  );

  return (
    <div className={cn("rounded-lg border shadow-sm overflow-hidden", theme.surface.default, theme.border.default)}>
      <div className={cn("p-3 border-b flex justify-between items-center", theme.surface.highlight, theme.border.default)}>
        <h4 className={cn("text-sm font-bold flex items-center", theme.text.primary)}>
          <Bell className={cn("h-4 w-4 mr-2", theme.primary.text)} /> Notifications
        </h4>
        <span className={cn("text-xs font-bold px-1.5 rounded", theme.primary.light, theme.primary.text)}>{notifications.filter(n => !n.read).length}</span>
      </div>
      <div className="divide-y max-h-64 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={BellOff}
                title="No notifications"
                description="You're all caught up! No new notifications."
                className="py-8"
              />
            </div>
        ) : (
          notifications.map(n => (
          <div key={n.id} className={cn("p-3 transition-colors group flex justify-between items-start", n.read ? "opacity-60" : "", `hover:${theme.surface.highlight}`)}>
            <div className="flex-1">
                <p className={cn("text-xs mb-1", theme.text.primary)}>{(n as { text?: string }).text || n.message}</p>
                <span className={cn("text-[10px]", theme.text.tertiary)}>{(n as { time?: string }).time || new Date(n.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.read && (
                    <button onClick={() => markRead(n.id)} className="p-1 hover:bg-green-100 text-green-600 rounded" title="Mark Read"><Check className="h-3 w-3"/></button>
                )}
                <button onClick={() => dismiss(n.id)} className="p-1 hover:bg-red-100 text-red-600 rounded" title="Dismiss"><X className="h-3 w-3"/></button>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};


