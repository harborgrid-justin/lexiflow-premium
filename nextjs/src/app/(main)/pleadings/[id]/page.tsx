/**
 * Pleading Detail Page - Server Component with Data Fetching
 * Dynamic route for individual pleading view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PleadingDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PleadingDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const pleading = await apiFetch(API_ENDPOINTS.PLEADINGS.DETAIL(id));
    return {
      title: `${pleading.title || 'Pleading'} | LexiFlow`,
      description: pleading.description || 'Pleading details',
    };
  } catch (error) {
    return { title: 'Pleading Not Found' };
  }
}

export default async function PleadingDetailPage({ params }: PleadingDetailPageProps) {
  const { id } = await params;

  let pleading;
  try {
    pleading = await apiFetch(API_ENDPOINTS.PLEADINGS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading pleading...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{pleading.title}</h1>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
              <span className="ml-2 font-medium">{pleading.type}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
              <span className="ml-2 font-medium">{pleading.status}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Filed Date:</span>
              <span className="ml-2">{pleading.filedDate}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Content</h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {pleading.content || 'No content available'}
              </p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
