/**
 * Clause Detail Page - Server Component with Data Fetching
 * Dynamic route for individual clause view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface ClauseDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ClauseDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const clause = await apiFetch(API_ENDPOINTS.CLAUSES.DETAIL(id));
    return {
      title: `${clause.title || 'Clause'} | LexiFlow`,
      description: clause.description || 'Clause details',
    };
  } catch (error) {
    return { title: 'Clause Not Found' };
  }
}

export default async function ClauseDetailPage({ params }: ClauseDetailPageProps) {
  const { id } = await params;

  let clause;
  try {
    clause = await apiFetch(API_ENDPOINTS.CLAUSES.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading clause...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{clause.title || clause.name}</h1>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Category:</span>
              <span className="ml-2 font-medium">{clause.category}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Clause Text</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {clause.text || clause.content || 'No content available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
