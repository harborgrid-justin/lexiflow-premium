/**
 * Jury Selection Detail Page - Server Component with Data Fetching
 * View juror list, voir dire responses, and peremptory strikes
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for jury-selection detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of jury-selection IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.JURY_SELECTION.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch jury-selection list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Jury Selection Details | LexiFlow',
  description: 'Detailed jury selection information',
};

async function JurySelectionDetail({ id }: { id: string }) {
  const selection = await apiFetch(API_ENDPOINTS.JURY_SELECTION.DETAIL(id)) as any;

  return (
    <div className="space-y-6">
      {/* Case Information */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Case Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Case Name:</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">{selection.caseName}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Trial Date:</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {new Date(selection.trialDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Jurors:</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">{selection.jurors?.length || 0}</p>
          </div>
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
            <p className="font-medium text-slate-900 dark:text-slate-100">{selection.status}</p>
          </div>
        </div>
      </div>

      {/* Juror List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Juror List</h2>
        </div>
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Juror #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Voir Dire</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {selection.jurors?.map((juror: any) => (
              <tr key={juror.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                  #{juror.jurorNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                  {juror.name || 'Anonymous'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {juror.voirDireComplete ? 'Completed' : 'Pending'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${juror.status === 'Selected'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : juror.status === 'Struck'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
                    }`}>
                    {juror.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {juror.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strikes Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">Strikes Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selection.strikes?.forCause || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">For Cause</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selection.strikes?.peremptory || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Peremptory</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {selection.strikes?.remaining || 0}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Remaining</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function JurySelectionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/jury-selection" className="text-blue-600 hover:underline text-sm mb-2 block">
            ← Back to Jury Selection
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Jury Selection Details</h1>
        </div>
      </div>
      <Suspense fallback={<LoadingState />}>
        <JurySelectionDetail id={params.id} />
      </Suspense>
    </div>
  );
}
