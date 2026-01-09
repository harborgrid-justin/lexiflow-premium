/**
 * War Room Detail Page - Server Component with Data Fetching
 * Fetches specific war room from backend
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';


interface WarRoomDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for war-room detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of cases for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CASES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch war-room list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: WarRoomDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const warRoom = await apiFetch(API_ENDPOINTS.WAR_ROOM.DETAIL(id));
    return {
      title: `War Room - Case ${warRoom.caseId || id} | LexiFlow`,
      description: 'Strategic trial planning and case preparation',
    };
  } catch {
    return { title: 'War Room Not Found' };
  }
}

import { WarRoom } from '@/components/war-room/WarRoom';
import { Suspense } from 'react';

// ... (Metadata part can stay similar but safe access)

export default async function WarRoomDetailPage({ params }: WarRoomDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let warRoomData;
  try {
    warRoomData = await apiFetch(API_ENDPOINTS.WAR_ROOM.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="p-8">Loading war room for case {id}...</div>}>
      <WarRoom initialData={warRoomData} />
    </Suspense>
  );
}
