/**
 * Conflict Waiver Detail Page - Server Component with Data Fetching
 * Display waiver text, signatures, and review information
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

>;
}

// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for conflict-waivers detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of conflict-waivers IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CONFLICT_WAIVERS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch conflict-waivers list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Conflict Waiver ${params.id} | LexiFlow`,
    description: 'Conflict waiver details, text, and signatures',
  };
}

async function ConflictWaiverDetail({ id }: { id: string }) {
  const waiver = await apiFetch(API_ENDPOINTS.CONFLICT_WAIVERS.DETAIL(id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Waiver Information
        </h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Client</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{waiver.clientName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Conflict Type</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{waiver.conflictType}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Signed Date</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
              {new Date(waiver.signedDate).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</dt>
            <dd className="mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${waiver.status === 'Active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                {waiver.status}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Waiver Text */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Waiver Text
        </h2>
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {waiver.waiverText}
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Signatures
        </h2>
        <div className="space-y-4">
          {waiver.signatures?.map((sig: any, idx: number) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{sig.signerName}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{sig.signerRole}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Signed: {new Date(sig.signedAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Review Information */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Review Information
        </h2>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Reviewed By</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{waiver.reviewedBy || 'Pending'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Review Date</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">
              {waiver.reviewedAt ? new Date(waiver.reviewedAt).toLocaleDateString() : 'Not reviewed'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Review Notes</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{waiver.reviewNotes || 'No notes'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default function ConflictWaiverDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/conflict-waivers"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-2 inline-block"
          >
            ← Back to Conflict Waivers
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Conflict Waiver Details</h1>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ConflictWaiverDetail id={params.id} />
      </Suspense>
    </div>
  );
}
