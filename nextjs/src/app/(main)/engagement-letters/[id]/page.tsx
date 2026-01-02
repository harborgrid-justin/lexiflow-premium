/**
 * Engagement Letter Detail Page - Server Component
 * Full engagement letter with scope, signatures, and terms
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface EngagementLetterDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EngagementLetterDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const letter = await apiFetch(API_ENDPOINTS.ENGAGEMENT_LETTERS.DETAIL(id)) as any;
    return {
      title: `Engagement Letter: ${letter.clientName || id} | LexiFlow`,
      description: letter.description || 'Engagement letter details',
    };
  } catch {
    return { title: 'Engagement Letter Not Found' };
  }
}

export default async function EngagementLetterDetailPage({ params }: EngagementLetterDetailPageProps) {
  const { id } = await params;

  let letter: any;
  try {
    letter = await apiFetch(API_ENDPOINTS.ENGAGEMENT_LETTERS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/engagement-letters" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Engagement Letters
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          {letter.clientName} - Engagement Letter
        </h1>
      </div>

      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Letter Content</h2>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: letter.fullText || '<p>No content available</p>' }} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Scope of Representation</h2>
              <p className="text-slate-700 dark:text-slate-300">{letter.scope || 'Not specified'}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Signatures</h2>
              <div className="space-y-4">
                {letter.signatures?.map((sig: any, idx: number) => (
                  <div key={idx} className="border-t pt-4">
                    <p className="font-medium">{sig.signerName}</p>
                    <p className="text-sm text-slate-600">{sig.role} - {new Date(sig.signedAt).toLocaleDateString()}</p>
                  </div>
                )) || <p className="text-slate-500">No signatures yet</p>}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Details</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Client</dt>
                  <dd className="font-medium">{letter.clientName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Matter</dt>
                  <dd className="font-medium">{letter.matterDescription || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Effective Date</dt>
                  <dd className="font-medium">{new Date(letter.effectiveDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Status</dt>
                  <dd>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${letter.status === 'Signed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {letter.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
