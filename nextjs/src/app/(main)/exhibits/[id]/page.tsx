/**
 * Exhibit Detail Page - Server Component
 */
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exhibit Detail',
  description: 'View exhibit details',
};

export default async function ExhibitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Exhibit {id}</h1>
      <p className="text-slate-600 dark:text-slate-400">Exhibit detail interface coming soon.</p>
    </div>
  );
}
