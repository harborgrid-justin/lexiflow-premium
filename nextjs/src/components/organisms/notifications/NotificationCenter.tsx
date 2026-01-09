import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/shadcn/card';
import { Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/shadcn/scroll-area';
import { Badge } from '@/components/ui/shadcn/badge';
import { DataService } from '@/services/data/dataService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
   id: string;
   title: string;
   message: string;
   type: 'info' | 'warning' | 'success' | 'error';
   isRead: boolean;
   createdAt: string;
}

export const NotificationCenter: React.FC = () => {
   const [notifications, setNotifications] = useState<Notification[]>([]);
   const [unreadCount, setUnreadCount] = useState(0);

   useEffect(() => {
      const fetchNotifications = async () => {
         try {
            const data = await DataService.notifications.getAll();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
         } catch (e) {
            console.error("Failed to fetch notifications", e);
         }
      };

      fetchNotifications();

      // Optional: Set up real-time subscription here
      // const sub = DataService.notifications.subscribe(...)
      // return () => sub.unsubscribe()
   }, []);

   const markAsRead = async (id: string) => {
      try {
         await DataService.notifications.markAsRead(id);
         setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
         setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {
         console.error(e);
      }
   };

   return (
      <Card className="h-100 flex flex-col w-87.5">
         <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
               <Bell className="w-4 h-4" />
               Notifications
            </CardTitle>
            {unreadCount > 0 && (
               <Badge variant="destructive" className="h-5 px-1.5 text-xs rounded-full">
                  {unreadCount}
               </Badge>
            )}
         </CardHeader>
         <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
               {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground h-full min-h-50">
                     <Bell className="w-8 h-8 mb-2 opacity-50" />
                     <p className="text-sm">No new notifications</p>
                  </div>
               ) : (
                  <div className="flex flex-col">
                     {notifications.map(n => (
                        <div
                           key={n.id}
                           className={cn(
                              "p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                              !n.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                           )}
                           onClick={() => markAsRead(n.id)}
                        >
                           <div className="flex justify-between items-start gap-2 mb-1">
                              <span className="font-medium text-sm">{n.title}</span>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                 {formatDistanceToNow(new Date(n.createdAt))}
                              </span>
                           </div>
                           <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        </div>
                     ))}
                  </div>
               )}
            </ScrollArea>
         </CardContent>
      </Card>
   );
};
