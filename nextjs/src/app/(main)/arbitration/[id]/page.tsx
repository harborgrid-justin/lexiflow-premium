/**
 * Arbitration Detail Page - Server Component with Data Fetching
 * Detailed view of arbitration matter with agreement, submissions, and award
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface ArbitrationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ArbitrationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const arbitration = await apiFetch(API_ENDPOINTS.ARBITRATION.DETAIL(id)) as any;
    return {
      title: `Arbitration: ${arbitration.matterName || id} | LexiFlow`,
      description: arbitration.description || 'Arbitration matter details',
    };
  } catch {
    return { title: 'Arbitration Not Found' };
  }
}

async function ArbitrationDetails({ id }: { id: string }) {
  const arbitration = await apiFetch(API_ENDPOINTS.ARBITRATION.DETAIL(id));

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Matter Information</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-slate-500">Matter Name</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.matterName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Case Number</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.caseNumber}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Arbitrator</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.arbitratorName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Forum</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.forum}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Status</dt>
            <dd className="mt-1">
              <span className={`px-2 py-1 rounded text-xs ${arbitration.status === 'Awarded' ? 'bg-green-100 text-green-800' :
                arbitration.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                {arbitration.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Hearing Date</dt>
            <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.hearingDate || 'Not scheduled'}</dd>
          </div>
        </dl>
        <div className="mt-4">
          <dt className="text-sm font-medium text-slate-500">Description</dt>
          <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.description}</dd>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Arbitration Agreement</h2>
        {arbitration.agreement ? (
          <div className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-slate-500">Agreement Date</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.agreement.date}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Governing Rules</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.agreement.rules}</dd>
            </div>
            {arbitration.agreement.documentUrl && (
              <a
                href={arbitration.agreement.documentUrl}
                className="inline-block text-blue-600 hover:underline text-sm"
              >
                View Agreement Document →
              </a>
            )}
          </div>
        ) : (
          <p className="text-slate-500">No agreement information available</p>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Submissions & Filings</h2>
        <div className="space-y-3">
          {arbitration.submissions?.map((submission: any) => (
            <div key={submission.id} className="border border-slate-200 dark:border-slate-700 rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{submission.title}</p>
                  <p className="text-sm text-slate-500">{submission.type} • Filed by {submission.filedBy}</p>
                </div>
                <span className="text-sm text-slate-500">{submission.date}</span>
              </div>
              {submission.documentUrl && (
                <a href={submission.documentUrl} className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                  Download
                </a>
              )}
            </div>
          )) || <p className="text-slate-500">No submissions filed yet</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Award Information</h2>
        {arbitration.award ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-slate-500">Award Date</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.award.date}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Award Amount</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {arbitration.award.amount}
                </dd>
              </div>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Summary</dt>
              <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{arbitration.award.summary}</dd>
            </div>
            {arbitration.award.documentUrl && (
              <a
                href={arbitration.award.documentUrl}
                className="inline-block text-blue-600 hover:underline text-sm"
              >
                View Full Award Document →
              </a>
            )}
          </div>
        ) : (
          <p className="text-slate-500">Award pending</p>
        )}
      </div>
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
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

export default async function ArbitrationDetailPage({ params }: ArbitrationDetailPageProps) {
  const { id } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/arbitration" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Arbitration
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Arbitration Details
        </h1>
      </div>

      <div className="space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <ArbitrationDetails id={id} />
        </Suspense>
      </div>
    </div>
  );
}
