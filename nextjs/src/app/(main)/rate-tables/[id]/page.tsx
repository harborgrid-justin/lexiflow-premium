/**
 * Rate Table Detail Page - Server Component with Data Fetching
 * Attorney/rate matrix with tiered billing
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for rate-tables detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of rate-tables IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.RATE_TABLES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch rate-tables list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Rate Table Detail | LexiFlow',
  description: 'Attorney rate matrix and historical rates',
};

async function RateTableDetail({ params }: { params: { id: string } }) {
  const rateTable = await apiFetch(API_ENDPOINTS.RATE_TABLES.DETAIL(params.id)) as any;
  const rates = await apiFetch(API_ENDPOINTS.RATE_TABLES.RATES(params.id)) as any[];
  const history = await apiFetch(API_ENDPOINTS.RATE_TABLES.HISTORY(params.id)) as any[];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Table Name</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{rateTable.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Matter Type</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{rateTable.matterType}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Effective Date</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {new Date(rateTable.effectiveDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
            <p className="text-lg font-semibold text-green-600">{rateTable.status}</p>
          </div>
        </div>
      </div>

      {/* Attorney Rate Matrix */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Attorney Rate Matrix</h3>
        </div>
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attorney</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Standard Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Discounted Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Premium Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Blended Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {rates.map((rate: any) => (
              <tr key={rate.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{rate.attorneyName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{rate.barNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {rate.level}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    defaultValue={rate.standardRate}
                    className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    defaultValue={rate.discountedRate}
                    className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    defaultValue={rate.premiumRate}
                    className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                  ${rate.blendedRate.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tiered Billing Configuration */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Tiered Billing Thresholds</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tier 1 Threshold (hours)
              </label>
              <input
                type="number"
                defaultValue={rateTable.tier1Threshold}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tier 2 Threshold (hours)
              </label>
              <input
                type="number"
                defaultValue={rateTable.tier2Threshold}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Volume Discount %
              </label>
              <input
                type="number"
                defaultValue={rateTable.volumeDiscount}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Historical Rates */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Rate History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Changed By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Change Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {history.map((change: any) => (
                <tr key={change.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(change.changeDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                    {change.changedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {change.changeType}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {change.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          Back to List
        </button>
        <div className="space-x-3">
          <button className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            Export
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RateTableDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Rate Table Detail</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Attorney rate matrix and historical changes</p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading rate table...</div>}>
        <RateTableDetail params={params} />
      </Suspense>
    </div>
  );
}
