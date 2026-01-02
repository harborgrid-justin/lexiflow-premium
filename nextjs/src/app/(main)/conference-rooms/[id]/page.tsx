/**
 * Conference Room Detail Page - Server Component with Data Fetching
 * Detailed view of a conference room with booking calendar and amenities
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';


interface PageProps {
  params: Promise<{ id: string }>;
}

// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for conference-rooms detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of conference-rooms IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CONFERENCE_ROOMS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch conference-rooms list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Conference Room Details | LexiFlow',
  description: 'Conference room information and booking calendar',
};

async function ConferenceRoomDetails({ id }: { id: string }) {
  const room = await apiFetch(API_ENDPOINTS.CONFERENCE_ROOMS.DETAIL(id));
  const bookings = await apiFetch(API_ENDPOINTS.CONFERENCE_ROOMS.BOOKINGS(id));

  return (
    <div className="space-y-6">
      {/* Room Information */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {room.name}
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Capacity:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100 font-semibold">
              {room.capacity} people
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Location:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100">{room.location || 'Main Office'}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Floor:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100">{room.floor || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${room.currentStatus === 'Available'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
              {room.currentStatus || 'Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Amenities & Equipment */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Amenities & Equipment
        </h3>
        <div className="flex flex-wrap gap-2">
          {room.equipment?.map((item: string, idx: number) => (
            <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              {item}
            </span>
          )) || <span className="text-slate-500">No equipment listed</span>}
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Upcoming Reservations
        </h3>
        <div className="space-y-3">
          {bookings.length > 0 ? (
            bookings.map((booking: any) => (
              <div key={booking.id} className="border border-slate-200 dark:border-slate-700 rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {booking.title || 'Meeting'}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {booking.organizer}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-900 dark:text-slate-100 font-medium">
                      {new Date(booking.startTime).toLocaleString()}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {booking.duration || '1 hour'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No upcoming reservations</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConferenceRoomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/conference-rooms" className="text-blue-600 hover:underline">
          ← Back to Conference Rooms
        </Link>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Book This Room
        </button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading room details...</div>}>
        <ConferenceRoomDetails id={params.id} />
      </Suspense>
    </div>
  );
}
