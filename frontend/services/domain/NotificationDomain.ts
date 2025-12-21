/**
 * NotificationDomain - Real-time notification and alert service
 * Provides notification management, read/unread tracking, and channel subscriptions
 */

// TODO: Migrate to backend API - IndexedDB deprecated
import { db, STORES } from '../data/db';
import { delay } from '../../utils/async';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: any;
}

const SUBSCRIPTIONS_KEY = 'lexiflow_notification_subscriptions';

export const NotificationService = {
  getAll: async () => db.getAll(STORES.NOTIFICATIONS),
  getById: async (id: string) => db.get(STORES.NOTIFICATIONS, id),
  add: async (item: any) => db.put(STORES.NOTIFICATIONS, { 
    ...item, 
    timestamp: item.timestamp || new Date().toISOString(),
    read: false 
  }),
  update: async (id: string, updates: any) => {
    const existing = await db.get(STORES.NOTIFICATIONS, id);
    return db.put(STORES.NOTIFICATIONS, { ...existing, ...updates });
  },
  delete: async (id: string) => db.delete(STORES.NOTIFICATIONS, id),
  
  // Notification specific methods
  getNotifications: async (filters?: { read?: boolean; type?: string; limit?: number }): Promise<Notification[]> => {
    let notifications = await db.getAll(STORES.NOTIFICATIONS);
    
    // Apply filters
    if (filters?.read !== undefined) {
      notifications = notifications.filter((n: Notification) => n.read === filters.read);
    }
    
    if (filters?.type) {
      notifications = notifications.filter((n: Notification) => n.type === filters.type);
    }
    
    // Sort by timestamp descending
    notifications.sort((a: Notification, b: Notification) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Apply limit
    if (filters?.limit) {
      notifications = notifications.slice(0, filters.limit);
    }
    
    return notifications;
  },
  
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      await NotificationService.update(notificationId, { read: true });
      return true;
    } catch {
      return false;
    }
  },
  
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const notifications = await db.getAll(STORES.NOTIFICATIONS);
      const unread = notifications.filter((n: Notification) => !n.read);
      
      await Promise.all(
        unread.map((n: Notification) => 
          db.put(STORES.NOTIFICATIONS, { ...n, read: true })
        )
      );
      
      return true;
    } catch {
      return false;
    }
  },
  
  getUnreadCount: async (): Promise<number> => {
    const notifications = await db.getAll(STORES.NOTIFICATIONS);
    return notifications.filter((n: Notification) => !n.read).length;
  },
  
  subscribe: async (channel: string): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(SUBSCRIPTIONS_KEY);
      const subscriptions = stored ? JSON.parse(stored) : [];
      
      if (!subscriptions.includes(channel)) {
        subscriptions.push(channel);
        localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subscriptions));
      }
      
      console.log(`[NotificationService] Subscribed to channel: ${channel}`);
      return true;
    } catch {
      return false;
    }
  },
  
  unsubscribe: async (channel: string): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(SUBSCRIPTIONS_KEY);
      const subscriptions = stored ? JSON.parse(stored) : [];
      const updated = subscriptions.filter((c: string) => c !== channel);
      
      localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(updated));
      console.log(`[NotificationService] Unsubscribed from channel: ${channel}`);
      return true;
    } catch {
      return false;
    }
  },
};
