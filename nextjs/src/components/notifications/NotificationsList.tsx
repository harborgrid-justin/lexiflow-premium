'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { Check, Loader2 } from 'lucide-react';
import { DataService } from '@/services/data/dataService';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  readStatus: boolean;
}

interface NotificationsListProps {
  initialNotifications?: Notification[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || []);
  const [loading, setLoading] = useState(!initialNotifications);

  useEffect(() => {
    // If props provided, use them and stop loading.
    if (initialNotifications) {
      setLoading(false);
      return;
    }

    // Otherwise fetch
    async function fetchNotifications() {
      try {
        // Using communication service or similar to get notifications
        const comms = await DataService.communication.getAll({ type: 'notification' });

        const mapped = (Array.isArray(comms) ? comms : []).map((item: unknown) => {
          const c = item as { id: string; priority?: string; subject?: string; message?: string; createdAt?: string; status?: string };
          return {
            id: c.id,
            type: (c.priority === 'Critical' ? 'error' : 'info') as Notification['type'],
            message: c.subject || c.message || 'New notification',
            timestamp: c.createdAt || new Date().toISOString(),
            readStatus: c.status === 'Read'
          };
        });

        // Fallback mock if empty for demo
        if (mapped.length === 0) {
          // mapped.push({ id: '1', type: 'info', message: 'Welcome to LexiFlow', timestamp: new Date().toISOString(), readStatus: false });
        }

        setNotifications(mapped);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, [initialNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, readStatus: true } : n))
    );
    // Ideally call DataService to update status
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'outline';
      default: return 'secondary';
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <Badge variant="secondary" className="px-3 py-1">
          {notifications.filter(n => !n.readStatus).length} unread
        </Badge>
      </div>

      <ScrollArea className="h-150 rounded-md border p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={notification.readStatus ? 'bg-background' : 'bg-muted/30 border-primary/20'}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getBadgeVariant(notification.type)} className="uppercase text-[10px]">
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(notification.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-medium leading-none mt-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.readStatus && (
                    <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)} title="Mark as read">
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
