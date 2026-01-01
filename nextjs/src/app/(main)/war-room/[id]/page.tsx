/**
 * War Room Detail Page - Server Component
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'War Room Detail',
  description: 'View war room details',
};

export default async function WarRoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">War Room {id}</h1>
      <p className="text-slate-600 dark:text-slate-400">War Room detail interface coming soon.</p>
    </div>
  );
}
