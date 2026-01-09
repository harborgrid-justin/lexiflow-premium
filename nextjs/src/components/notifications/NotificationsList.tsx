'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/shadcn/card';
import { Badge } from '@/components/ui/shadcn/badge';
import { Button } from '@/components/ui/shadcn/button';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { Check } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  readStatus: boolean;
}

interface NotificationsListProps {
  initialNotifications: Notification[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, readStatus: true } : n))
    );
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary'; // Could use a custom 'warning' variant if available
      case 'success': return 'outline'; // Could match success color
      default: return 'secondary';
    }
  }

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
