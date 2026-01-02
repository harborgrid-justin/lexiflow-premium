/**
 * Mediation Detail Page - Server Component
 * Complete mediation session with brief, offers, agreements, and follow-up
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface MediationDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for mediation detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of mediation IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.MEDIATION.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch mediation list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: MediationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const session = await apiFetch(API_ENDPOINTS.MEDIATION.DETAIL(id)) as any;
    return {
      title: `Mediation: ${session.caseName || id} | LexiFlow`,
      description: `Mediation session for ${session.caseName}`,
    };
  } catch {
    return { title: 'Mediation Not Found' };
  }
}

export default async function MediationDetailPage({ params }: MediationDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let session: any;
  try {
    session = await apiFetch(API_ENDPOINTS.MEDIATION.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/mediation" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Mediation
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {session.caseName}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">{session.caseNumber}</p>
      </div>

      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mediation Brief</h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {session.brief || 'No brief submitted yet.'}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Settlement Offers</h2>
              <div className="space-y-4">
                {session.offers?.map((offer: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{offer.party}</span>
                      <span className="text-sm text-slate-600">{new Date(offer.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">${offer.amount.toLocaleString()}</p>
                    <p className="text-sm text-slate-600 mt-2">{offer.terms}</p>
                  </div>
                )) || <p className="text-slate-500">No offers made yet.</p>}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Agreements Reached</h2>
              {session.agreements?.map((agreement: any, idx: number) => (
                <div key={idx} className="mb-4 pb-4 border-b last:border-b-0">
                  <h3 className="font-medium mb-2">{agreement.title}</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">{agreement.description}</p>
                  <div className="mt-2 flex items-center text-sm text-slate-600">
                    <span className="mr-4">✓ Agreed by all parties</span>
                    <span>{new Date(agreement.agreedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )) || <p className="text-slate-500">No formal agreements yet.</p>}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Follow-up Actions</h2>
              <ul className="space-y-3">
                {session.followUpActions?.map((action: any, idx: number) => (
                  <li key={idx} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={action.completed}
                      readOnly
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <p className={action.completed ? 'line-through text-slate-500' : ''}>{action.description}</p>
                      <p className="text-xs text-slate-600">
                        Assigned to: {action.assignedTo} | Due: {new Date(action.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                )) || <p className="text-slate-500">No follow-up actions required.</p>}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Session Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Mediator</dt>
                  <dd className="font-medium">{session.mediatorName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Session Date</dt>
                  <dd className="font-medium">{new Date(session.sessionDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Location</dt>
                  <dd className="font-medium">{session.location || 'Virtual'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Duration</dt>
                  <dd className="font-medium">{session.duration || 'TBD'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Outcome</dt>
                  <dd>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.outcome === 'Settled' ? 'bg-green-100 text-green-800' :
                      session.outcome === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        session.outcome === 'Failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {session.outcome || 'Scheduled'}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Parties</h2>
              <ul className="space-y-2">
                {session.parties?.map((party: any, idx: number) => (
                  <li key={idx} className="text-sm">
                    <p className="font-medium">{party.name}</p>
                    <p className="text-slate-600">{party.role}</p>
                    <p className="text-xs text-slate-500">Rep: {party.representative}</p>
                  </li>
                )) || <p className="text-slate-500 text-sm">No parties listed</p>}
              </ul>
            </div>

            {session.settlementAmount && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-2">Settlement Amount</h2>
                <p className="text-3xl font-bold text-green-600">
                  ${session.settlementAmount.toLocaleString()}
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Documents</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                  Upload Document
                </button>
                <button className="w-full px-4 py-2 border border-slate-300 rounded hover:bg-slate-50 text-sm">
                  View All Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
