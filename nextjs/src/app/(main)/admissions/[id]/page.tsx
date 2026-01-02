/**
 * Admission Detail Page - Server Component with Data Fetching
 * Dynamic route for individual admission request view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';

interface AdmissionDetailPageProps {
  params: Promise<{ id: string }>;
}

interface AdmissionStatement {
  statement: string;
  response?: string;
  deemedAdmitted?: boolean;
}

interface Admission {
  title: string;
  description?: string;
  status: string;
  matter: string;
  responseDeadline: string;
  requestingParty: string;
  respondingParty: string;
  statements?: AdmissionStatement[];
  deemedAdmittedCount?: number;
}

interface AdmissionDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for admissions detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of admissions IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.ADMISSIONS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch admissions list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: AdmissionDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const admission = await apiFetch<Admission>(API_ENDPOINTS.ADMISSIONS.DETAIL(id));
    return {
      title: `Admission Request: ${admission.title} | LexiFlow`,
      description: admission.description || 'Admission request details',
    };
  } catch (error) {
    return { title: 'Admission Not Found' };
  }
}

export default async function AdmissionDetailPage({ params }: AdmissionDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let admission: Admission;
  try {
    admission = await apiFetch<Admission>(API_ENDPOINTS.ADMISSIONS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading admission request...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{admission.title}</h1>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2 font-medium">{admission.status}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Matter:</span>
                <span className="ml-2">{admission.matter}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Response Deadline:</span>
                <span className="ml-2">{admission.responseDeadline}</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Parties</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Requesting Party:</span>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{admission.requestingParty}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Responding Party:</span>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{admission.respondingParty}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Admission Statements & Responses</h2>
              <div className="space-y-4">
                {admission.statements?.map((statement, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-700">
                    <div className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Request #{index + 1}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 mb-3">
                      {statement.statement}
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Response:</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${statement.response === 'Admitted' ? 'bg-green-100 dark:bg-green-900' :
                          statement.response === 'Denied' ? 'bg-red-100 dark:bg-red-900' :
                            'bg-yellow-100 dark:bg-yellow-900'
                          }`}>
                          {statement.response || 'Pending'}
                        </span>
                      </div>
                      {statement.deemedAdmitted && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          ⚠ Deemed Admitted
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Deemed Status</h2>
              <div className="text-slate-700 dark:text-slate-300">
                {admission.deemedAdmittedCount || 0} deemed admitted by failure to respond
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
