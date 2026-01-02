/**
 * Appeal Detail Page - Server Component with Data Fetching
 * Detailed view of appellate case
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';


interface AppealDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for appeals detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of appeals IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.APPEALS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch appeals list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: AppealDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const appeal = await apiFetch(API_ENDPOINTS.APPEALS.DETAIL(id)) as any;
    return {
      title: `Appeal: ${appeal.caseName || id} | LexiFlow`,
      description: appeal.description || 'Appeal details',
    };
  } catch {
    return { title: 'Appeal Not Found' };
  }
}

export default async function AppealDetailPage({ params }: AppealDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let appeal: any;
  try {
    appeal = await apiFetch(API_ENDPOINTS.APPEALS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/appeals" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Appeals
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Appeal: {appeal.caseName || appeal.caseNumber}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grounds for Appeal */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Grounds for Appeal</h2>
            <div className="prose dark:prose-invert">
              {appeal.grounds ? (
                <p className="text-slate-700 dark:text-slate-300">{appeal.grounds}</p>
              ) : (
                <p className="text-slate-500 italic">No grounds specified</p>
              )}
            </div>
          </div>

          {/* Record on Appeal */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Record on Appeal</h2>
            {appeal.record && appeal.record.length > 0 ? (
              <ul className="space-y-2">
                {appeal.record.map((item: any, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 italic">No record items</p>
            )}
          </div>

          {/* Briefs */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Briefs</h2>
            {appeal.briefs && appeal.briefs.length > 0 ? (
              <div className="space-y-3">
                {appeal.briefs.map((brief: any) => (
                  <div
                    key={brief.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded border"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{brief.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {brief.type}
                        </p>
                      </div>
                      <span className="text-xs text-slate-500">
                        {brief.filedDate
                          ? new Date(brief.filedDate).toLocaleDateString()
                          : 'Not filed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No briefs filed</p>
            )}
          </div>

          {/* Oral Argument */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Oral Argument</h2>
            {appeal.oralArgument ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">Date</span>
                    <p className="font-medium">
                      {new Date(appeal.oralArgument.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Time</span>
                    <p className="font-medium">{appeal.oralArgument.time || 'TBD'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Location</span>
                    <p className="font-medium">{appeal.oralArgument.location || 'TBD'}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Duration</span>
                    <p className="font-medium">
                      {appeal.oralArgument.duration || 'Not specified'}
                    </p>
                  </div>
                </div>
                {appeal.oralArgument.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-sm text-slate-500 block mb-2">Notes</span>
                    <p className="text-slate-700 dark:text-slate-300">
                      {appeal.oralArgument.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 italic">No oral argument scheduled</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Appeal Information</h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-slate-500">Court</dt>
                <dd className="font-medium">{appeal.court}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Notice Date</dt>
                <dd className="font-medium">
                  {appeal.noticeDate
                    ? new Date(appeal.noticeDate).toLocaleDateString()
                    : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Status</dt>
                <dd>
                  <span className="px-3 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900">
                    {appeal.status}
                  </span>
                </dd>
              </div>
              {appeal.appellant && (
                <div>
                  <dt className="text-sm text-slate-500">Appellant</dt>
                  <dd className="font-medium">{appeal.appellant}</dd>
                </div>
              )}
              {appeal.appellee && (
                <div>
                  <dt className="text-sm text-slate-500">Appellee</dt>
                  <dd className="font-medium">{appeal.appellee}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
