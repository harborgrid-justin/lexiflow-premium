/**
 * Fee Agreement Detail Page - Server Component
 * Rate schedule, payment terms, and billing details
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface FeeAgreementDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for fee-agreements detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of fee-agreements IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.FEE_AGREEMENTS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch fee-agreements list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: FeeAgreementDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const agreement = await apiFetch(API_ENDPOINTS.FEE_AGREEMENTS.DETAIL(id)) as any;
    return {
      title: `Fee Agreement: ${agreement.clientName || id} | LexiFlow`,
      description: `Fee agreement for ${agreement.clientName}`,
    };
  } catch {
    return { title: 'Fee Agreement Not Found' };
  }
}

export default async function FeeAgreementDetailPage({ params }: FeeAgreementDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let agreement: any;
  try {
    agreement = await apiFetch(API_ENDPOINTS.FEE_AGREEMENTS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/fee-agreements" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Fee Agreements
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Fee Agreement: {agreement.clientName}
        </h1>
      </div>

      <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Rate Schedule</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">Role/Service</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">Rate</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {agreement.rateSchedule?.map((rate: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-4 py-3">{rate.role || rate.service}</td>
                        <td className="px-4 py-3 font-medium">${rate.amount}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{rate.unit || 'hour'}</td>
                      </tr>
                    )) || (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-center text-slate-500">
                            No rate schedule defined
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Billing Frequency</h3>
                  <p className="text-slate-700 dark:text-slate-300">{agreement.billingFrequency || 'Monthly'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Payment Due</h3>
                  <p className="text-slate-700 dark:text-slate-300">
                    {agreement.paymentTerms?.dueWithin || 30} days from invoice date
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Retainer Amount</h3>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold">
                    ${agreement.retainerAmount?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Additional Terms</h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm">
                    {agreement.paymentTerms?.additionalTerms || 'Standard payment terms apply.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Expenses & Costs</h2>
              <p className="text-slate-700 dark:text-slate-300">
                {agreement.expensePolicy || 'Client responsible for all reasonable out-of-pocket expenses.'}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Agreement Info</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Client</dt>
                  <dd className="font-medium">{agreement.clientName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Matter</dt>
                  <dd className="font-medium">{agreement.matterDescription || 'General Representation'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Billing Method</dt>
                  <dd className="font-medium">{agreement.billingMethod}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Effective Date</dt>
                  <dd className="font-medium">{new Date(agreement.effectiveDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">Status</dt>
                  <dd>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${agreement.status === 'Active' ? 'bg-green-100 text-green-800' :
                      agreement.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {agreement.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Download PDF
                </button>
                <button className="w-full px-4 py-2 border border-slate-300 rounded hover:bg-slate-50">
                  Edit Agreement
                </button>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
