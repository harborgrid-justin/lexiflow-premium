/**
 * Time Entry Detail Page - Server Component with Data Fetching
 * Dynamic route for individual time entry view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface TimeEntryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TimeEntryDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const entry = await apiFetch(API_ENDPOINTS.TIME_ENTRIES.DETAIL(id));
    return {
      title: `Time Entry ${entry.id} | LexiFlow`,
      description: 'Time entry details',
    };
  } catch (error) {
    return { title: 'Time Entry Not Found' };
  }
}

export default async function TimeEntryDetailPage({ params }: TimeEntryDetailPageProps) {
  const { id } = await params;

  let entry;
  try {
    entry = await apiFetch(API_ENDPOINTS.TIME_ENTRIES.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading time entry...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Time Entry</h1>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Hours:</span>
              <span className="ml-2 font-medium text-xl">{entry.hours}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Rate:</span>
              <span className="ml-2">${entry.rate}/hr</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total:</span>
              <span className="ml-2 font-bold">${entry.total}</span>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-slate-700 dark:text-slate-300">{entry.description}</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
