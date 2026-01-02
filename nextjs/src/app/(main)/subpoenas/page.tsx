/**
 * Subpoenas List Page - Server Component with Data Fetching
 * List view of all subpoenas
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Subpoenas | LexiFlow',
  description: 'Manage subpoenas and service records',
};

export default async function SubpoenasPage(): Promise<JSX.Element> {
  // Fetch subpoenas from backend
  let subpoenas = [];

  try {
    subpoenas = (await apiFetch(API_ENDPOINTS.SUBPOENAS.LIST)) as any[];
  } catch (error) {
    console.error('Failed to load subpoenas:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Subpoenas</h1>
        <Link
          href="/subpoenas/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New
        </Link>
      </div>

      <Suspense fallback={<div>Loading subpoenas...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Subpoena Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Served To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Service Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Compliance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {subpoenas && subpoenas.length > 0 ? (
                subpoenas.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/subpoenas/${item.id}`} className="text-blue-600 hover:text-blue-800">
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/subpoenas/${item.id}`} className="font-medium hover:text-blue-600">
                        {item.type}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.servedTo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.serviceDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-sm rounded ${item.complianceStatus === 'Complied' ? 'bg-green-100 dark:bg-green-900' :
                          item.complianceStatus === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900' :
                            'bg-red-100 dark:bg-red-900'
                        }`}>
                        {item.complianceStatus}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                    No subpoenas available
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
