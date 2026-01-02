/**
 * Interrogatory Detail Page - Server Component with Data Fetching
 * Dynamic route for individual interrogatory view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface InterrogatoryDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for interrogatories detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of interrogatories IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.INTERROGATORIES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch interrogatories list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: InterrogatoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const interrogatory = await apiFetch(API_ENDPOINTS.INTERROGATORIES.DETAIL(id)) as any;
    return {
      title: `Interrogatory: ${interrogatory.title} | LexiFlow`,
      description: interrogatory.description || 'Interrogatory details',
    };
  } catch (error) {
    return { title: 'Interrogatory Not Found' };
  }
}

export default async function InterrogatoryDetailPage({ params }: InterrogatoryDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let interrogatory: any;
  try {
    interrogatory = await apiFetch(API_ENDPOINTS.INTERROGATORIES.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading interrogatory...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{interrogatory.title}</h1>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2 font-medium">{interrogatory.status}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Served:</span>
                <span className="ml-2">{interrogatory.servedDate}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Due:</span>
                <span className="ml-2">{interrogatory.dueDate}</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Parties</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Propounding Party:</span>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{interrogatory.propoundingParty}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Responding Party:</span>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{interrogatory.respondingParty}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Questions & Answers</h2>
              <div className="space-y-4">
                {interrogatory.questions?.map((qa: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      Q{index + 1}: {qa.question}
                    </div>
                    <div className="mt-2 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold">Answer:</span> {qa.answer || 'Pending response'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Attachments</h2>
              <div className="text-slate-700 dark:text-slate-300">
                {interrogatory.attachments?.length || 0} attachments
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
