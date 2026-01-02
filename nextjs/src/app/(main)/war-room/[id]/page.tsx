/**
 * War Room Detail Page - Server Component with Data Fetching
 * Fetches specific war room from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface WarRoomDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: WarRoomDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const warRoom = await apiFetch(API_ENDPOINTS.WAR_ROOM.DETAIL(id));
    return {
      title: `War Room ${warRoom.name || id} | LexiFlow`,
      description: warRoom.description || 'War room details',
    };
  } catch {
    return { title: 'War Room Not Found' };
  }
}

export default async function WarRoomDetailPage({ params }: WarRoomDetailPageProps) {
  const { id } = await params;

  let warRoom;
  try {
    warRoom = await apiFetch(API_ENDPOINTS.WAR_ROOM.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        War Room: {warRoom.name || id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{warRoom.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Status: {warRoom.status}</p>
        </div>
      </div>
    </div>
  );
}
