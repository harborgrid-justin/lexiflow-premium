/**
 * Conflict Detail Page - Server Component with Data Fetching
 * Dynamic route for individual conflict check with analysis, waiver, ethical review
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface ConflictDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for conflicts detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of conflicts IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CONFLICTS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch conflicts list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: ConflictDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const conflict = await apiFetch(API_ENDPOINTS.CONFLICTS.DETAIL(id)) as any;
    return {
      title: `Conflict Check ${conflict.conflictNumber} | LexiFlow`,
      description: `Conflict check for ${conflict.parties?.join(', ')}`,
    };
  } catch (error) {
    return { title: 'Conflict Not Found' };
  }
}

export default async function ConflictDetailPage({ params }: ConflictDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let conflict: any;
  try {
    conflict = await apiFetch(API_ENDPOINTS.CONFLICTS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading conflict check...</div>}>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">Conflict Check {conflict.conflictNumber}</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Type: {conflict.type}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${conflict.status === 'Cleared'
                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                    : conflict.status === 'Flagged'
                      ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                      : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                  }`}
              >
                {conflict.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Created:</span>
                <span className="ml-2">{conflict.createdDate}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Cleared:</span>
                <span className="ml-2">{conflict.clearedDate || '—'}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Reviewed By:</span>
                <span className="ml-2">{conflict.reviewedBy || '—'}</span>
              </div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Parties Involved</h2>
            <div className="space-y-2">
              {conflict.parties?.map((party: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="font-semibold">{party}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Conflict Analysis */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Conflict Analysis</h2>
            <div className="prose dark:prose-invert max-w-none">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Potential Conflicts Identified</h3>
                  <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded border border-rose-200 dark:border-rose-800">
                    {conflict.analysis?.potentialConflicts?.map((issue: any, idx: number) => (
                      <div key={idx} className="mb-2">
                        <div className="font-medium text-rose-900 dark:text-rose-200">
                          {issue.title}
                        </div>
                        <div className="text-sm text-rose-700 dark:text-rose-300">
                          {issue.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Risk Level</div>
                      <div className="text-2xl font-bold">{conflict.analysis?.riskLevel}</div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                      <div className="text-sm text-slate-600 dark:text-slate-400">Severity</div>
                      <div className="text-2xl font-bold">{conflict.analysis?.severity}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-900 dark:text-blue-200">
                      {conflict.analysis?.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Waiver Information */}
          {conflict.waiver && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Conflict Waiver</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Waiver Status:</span>
                  <span className="font-semibold">{conflict.waiver.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Signed Date:</span>
                  <span className="font-semibold">{conflict.waiver.signedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Signed By:</span>
                  <span className="font-semibold">{conflict.waiver.signedBy}</span>
                </div>
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <p className="text-sm">{conflict.waiver.terms}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ethical Review */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Ethical Review</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Rules of Professional Conduct</h3>
                <div className="space-y-2">
                  {conflict.ethicalReview?.rulesApplicable?.map((rule: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700 rounded">
                      <div className="font-medium">{rule.ruleNumber}: {rule.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {rule.summary}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Reviewer Notes</h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <p className="text-sm">{conflict.ethicalReview?.notes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
