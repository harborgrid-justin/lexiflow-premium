/**
 * Trial Exhibit Detail Page - Server Component with Data Fetching
 * Detailed view of trial exhibit with preview and chain of custody
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';


interface TrialExhibitDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for trial-exhibits detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of trial-exhibits IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.TRIAL_EXHIBITS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch trial-exhibits list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: TrialExhibitDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const exhibit = await apiFetch(API_ENDPOINTS.EXHIBITS.DETAIL(id)) as any;
    return {
      title: `Exhibit: ${exhibit.exhibitNumber || id} | LexiFlow`,
      description: exhibit.description || 'Trial exhibit details',
    };
  } catch {
    return { title: 'Exhibit Not Found' };
  }
}

async function ExhibitDetails({ id }: { id: string }) {
  const exhibit = await apiFetch(API_ENDPOINTS.EXHIBITS.DETAIL(id)) as any;

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Exhibit Information</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-slate-500">Exhibit Number</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{exhibit.exhibitNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Type</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{exhibit.type}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Status</dt>
            <dd className="mt-1">
              <span className={`px-2 py-1 rounded text-xs ${exhibit.status === 'Admitted' ? 'bg-green-100 text-green-800' :
                exhibit.status === 'Marked' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-800'
                }`}>
                {exhibit.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Date Marked</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{exhibit.dateMarked || 'N/A'}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <dt className="text-sm font-medium text-slate-500">Description</dt>
          <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{exhibit.description}</dd>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Chain of Custody</h2>
        <div className="space-y-3">
          {exhibit.chainOfCustody?.map((entry: any, idx: number) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-medium text-slate-900 dark:text-slate-100">{entry.custodian}</p>
              <p className="text-sm text-slate-500">{entry.action} • {entry.date}</p>
              {entry.notes && <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{entry.notes}</p>}
            </div>
          )) || <p className="text-slate-500">No custody records available</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Document Preview</h2>
        {exhibit.documentUrl ? (
          <iframe
            src={exhibit.documentUrl}
            className="w-full h-96 border border-slate-200 dark:border-slate-700 rounded"
            title="Exhibit Preview"
          />
        ) : (
          <p className="text-slate-500">No document available for preview</p>
        )}
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function TrialExhibitDetailPage({ params }: TrialExhibitDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/exhibits" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Exhibits
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Trial Exhibit Details
        </h1>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <ExhibitDetails id={id} />
        </Suspense>
      </div>
    </div>
  );
}
