/**
 * Announcements Page - Server Component with Data Fetching
 * Displays firm-wide and department announcements
 */
import React from 'react';
import { AnnouncementsList } from '@/components/announcements/AnnouncementsList';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Announcements',
  description: 'Firm-wide and department announcements',
};

export default async function AnnouncementsPage(): Promise<React.JSX.Element> {
  // Fetch initial announcements from backend
  let announcements = [];

  try {
    const data = await apiFetch(API_ENDPOINTS.ANNOUNCEMENTS.LIST).catch(() => ({ data: [] })) as any;
    announcements = data?.data || [];
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<div className="p-8">Loading announcements...</div>}>
        <AnnouncementsList initialAnnouncements={announcements} />
      </Suspense>
    </div>
  );
}
