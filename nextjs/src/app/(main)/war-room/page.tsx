/**
 * War Room Page - Server Component with Data Fetching
 * Fetches war room data and trial preparation info
 */
import React from 'react';
import { WarRoom } from '@/components/war-room/WarRoom';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'War Room',
  description: 'Strategic trial planning and case preparation',
};

export default async function WarRoomPage(): Promise<React.JSX.Element> {
  // Fetch war room data
  let warRoomData = null;

  try {
    warRoomData = await apiFetch(API_ENDPOINTS.WAR_ROOM.ROOT);
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <Suspense fallback={<div className="p-8">Loading war room...</div>}>
      <WarRoom initialData={warRoomData} />
    </Suspense>
  );
}
