/**
 * Production Requests List Page - Server Component with Data Fetching
 * List view of all production requests
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Production Requests | LexiFlow',
  description: 'Manage requests for production of documents',
};

export default async function ProductionRequestsPage() {
  // Fetch production requests from backend
  let productionRequests = [];

  try {
    productionRequests = (await apiFetch(API_ENDPOINTS.PRODUCTION_REQUESTS.LIST)) as any[];
  } catch (error) {
    console.error('Failed to load production requests:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Production Requests</h1>
        <Link
          href="/production-requests/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New
        </Link>
      </div>

      <Suspense fallback={<div>Loading production requests...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Document Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Requesting Party</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Compliance %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {productionRequests && productionRequests.length > 0 ? (
                productionRequests.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/production-requests/${item.id}`} className="text-blue-600 hover:text-blue-800">
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/production-requests/${item.id}`} className="font-medium hover:text-blue-600">
                        {item.categories}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.requestingParty}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm rounded bg-green-100 dark:bg-green-900">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.compliancePercentage || 0}%` }}
                          />
                        </div>
                        <span className="text-sm">{item.compliancePercentage || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                    No production requests available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Suspense>
    </div>
  );
}
