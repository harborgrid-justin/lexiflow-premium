/**
 * Retainer Detail Page - Server Component with Data Fetching
 * Dynamic route for individual retainer view
 */
import { apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface RetainerDetailPageProps {
  params: Promise<{ id: string }>;
}

interface BalanceHistoryItem {
  date: string;
  type: 'draw' | 'replenishment';
  amount: number;
  balance: number;
  description: string;
}

interface RetainerDetail {
  id: string;
  clientName: string;
  amount: number;
  balance: number;
  lastReplenishDate: string;
  status: string;
  caseNumber: string;
  balanceHistory: BalanceHistoryItem[];
  draws: BalanceHistoryItem[];
  replenishments: BalanceHistoryItem[];
  trustAccountNumber: string;
  startDate: string;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for retainers detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of retainers IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.RETAINERS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch retainers list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: RetainerDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const retainer = await apiFetch(`/retainers/${id}`) as RetainerDetail;
    return {
      title: `${retainer.clientName} Retainer | LexiFlow`,
      description: `Retainer for case ${retainer.caseNumber}`,
    };
  } catch (error) {
    return { title: 'Retainer Not Found' };
  }
}

export default async function RetainerDetailPage({ params }: RetainerDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let retainer: RetainerDetail;
  try {
    retainer = await apiFetch(`/retainers/${id}`);
  } catch (error) {
    notFound();
  }

  const balancePercentage = (retainer.balance / retainer.amount) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading retainer...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{retainer.clientName}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Case: {retainer.caseNumber}</p>
              <p className="text-slate-600 dark:text-slate-400">Trust Account: {retainer.trustAccountNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                ${retainer.balance.toLocaleString()}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                of ${retainer.amount.toLocaleString()}
              </div>
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {retainer.status}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${balancePercentage}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {balancePercentage.toFixed(1)}% remaining
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mb-6">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Start Date:</span>
              <span className="ml-2">{retainer.startDate}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Last Replenish:</span>
              <span className="ml-2">{retainer.lastReplenishDate}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Balance History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Balance</th>
                      <th className="px-4 py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retainer.balanceHistory && retainer.balanceHistory.map((item, index) => (
                      <tr key={index} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-4 py-2">{item.date}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'draw'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className={`px-4 py-2 font-semibold ${item.type === 'draw' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {item.type === 'draw' ? '-' : '+'}${Math.abs(item.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 font-semibold">${item.balance.toLocaleString()}</td>
                        <td className="px-4 py-2">{item.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Replenish Retainer
            </button>
            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
              Draw from Retainer
            </button>
            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
              View Trust Account
            </button>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
