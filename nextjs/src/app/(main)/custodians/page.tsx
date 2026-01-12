/**
 * Custodians List Page - Server Component with Data Fetching
 * List view of all custodians
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Custodians | LexiFlow',
  description: 'Manage custodians and data sources',
};

export default async function CustodiansPage(): Promise<React.JSX.Element> {
  // Fetch custodians from backend
  let custodians = [];

  try {
    custodians = (await apiFetch(API_ENDPOINTS.CUSTODIANS.LIST)) as any[];
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Custodians</h1>
        <Link
          href="/custodians/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Custodian
        </Link>
      </div>

      <Suspense fallback={<div>Loading custodians...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {custodians && custodians.length > 0 ? (
                custodians.map((custodian: any) => (
                  <tr key={custodian.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3">
                      <Link href={`/custodians/${custodian.id}`} className="text-blue-600 hover:underline">
                        {custodian.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{custodian.email}</td>
                    <td className="px-4 py-3">{custodian.department}</td>
                    <td className="px-4 py-3">{custodian.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-600 dark:text-slate-400">
                    No custodians found
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
