/**
 * Notifications Page - Server Component with Data Fetching
 * Displays system notifications with read/unread status
 */
import React from 'react';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View and manage system notifications',
};

export default async function NotificationsPage(): Promise<React.JSX.Element> {
  // Fetch initial notifications from backend
  let notifications = [];

  try {
    const data = await apiFetch(API_ENDPOINTS.NOTIFICATIONS.LIST).catch(() => ({ data: [] }));
    notifications = data?.data || [];
  } catch (error) {
    console.error('Failed to load notifications:', error);
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<div className="p-8">Loading notifications...</div>}>
        <NotificationsList initialNotifications={notifications} />
      </Suspense>
    </div>
  );
}
