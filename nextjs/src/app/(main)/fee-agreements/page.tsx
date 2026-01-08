/**
 * Fee Agreements List Page - Server Component
 * Overview of all fee agreements with client, billing method, and rates
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Fee Agreements | LexiFlow',
  description: 'Manage client fee agreements and billing structures',
};

export default async function FeeAgreementsPage(): Promise<React.JSX.Element> {
  const agreements = await apiFetch(API_ENDPOINTS.FEE_AGREEMENTS.LIST) as any[];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Fee Agreements</h1>
        <Link
          href="/fee-agreements/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + New Agreement
        </Link>
      </div>

      <Suspense fallback={<div className="animate-pulse">Loading agreements...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Billing Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Effective Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {agreements?.map((agreement: any) => (
                <tr key={agreement.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4">
                    <Link href={`/fee-agreements/${agreement.id}`} className="text-blue-600 hover:underline font-medium">
                      {agreement.clientName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm">{agreement.billingMethod}</td>
                  <td className="px-6 py-4 text-sm font-medium">${agreement.rate || agreement.hourlyRate}/hr</td>
                  <td className="px-6 py-4 text-sm">{new Date(agreement.effectiveDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${agreement.status === 'Active' ? 'bg-green-100 text-green-800' :
                      agreement.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {agreement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link href={`/fee-agreements/${agreement.id}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!agreements || agreements.length === 0) && (
            <div className="text-center py-12 text-slate-500">
              No fee agreements found. Create your first agreement to get started.
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}
