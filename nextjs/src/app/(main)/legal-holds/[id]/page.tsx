/**
 * Legal Hold Detail Page - Server Component with Data Fetching
 * Dynamic route for individual legal hold view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface LegalHoldDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: LegalHoldDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const hold = await apiFetch(API_ENDPOINTS.LEGAL_HOLDS.DETAIL(id)) as any;
    return {
      title: `Legal Hold: ${hold.name} | LexiFlow`,
      description: hold.description || 'Legal hold details',
    };
  } catch (error) {
    return { title: 'Legal Hold Not Found' };
  }
}

export default async function LegalHoldDetailPage({ params }: LegalHoldDetailPageProps) {
  const { id } = await params;

  let hold: any;
  try {
    hold = await apiFetch(API_ENDPOINTS.LEGAL_HOLDS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading legal hold...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{hold.name}</h1>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2 font-medium">{hold.status}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Issued:</span>
                <span className="ml-2">{hold.issuedDate}</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Scope</h2>
              <p className="text-slate-700 dark:text-slate-300">{hold.description}</p>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Custodians</h2>
              <div className="text-slate-700 dark:text-slate-300">
                {hold.custodians?.length || 0} custodians
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
