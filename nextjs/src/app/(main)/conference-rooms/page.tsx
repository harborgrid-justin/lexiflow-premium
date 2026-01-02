/**
 * Conference Rooms List Page - Server Component with Data Fetching
 * Manage conference room bookings and availability
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Conference Rooms | LexiFlow',
  description: 'Conference room booking and management',
};

async function ConferenceRoomsList() {
  const rooms = (await apiFetch(API_ENDPOINTS.CONFERENCE_ROOMS.LIST)) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Capacity</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Equipment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {rooms.map((room: any) => (
            <tr key={room.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {room.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {room.capacity} people
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                {room.equipment?.join(', ') || 'Basic'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${room.currentStatus === 'Available'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                  {room.currentStatus || 'Available'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <Link href={`/conference-rooms/${room.id}`} className="text-blue-600 hover:underline">
                  View Details
                </Link>
                <Link href={`/conference-rooms/${room.id}/calendar`} className="text-emerald-600 hover:underline">
                  Calendar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ConferenceRoomsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Conference Rooms</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Book Room
        </button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading conference rooms...</div>}>
        <ConferenceRoomsList />
      </Suspense>
    </div>
  );
}
