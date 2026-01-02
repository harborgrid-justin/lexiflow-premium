/**
 * Interrogatories List Page - Server Component with Data Fetching
 * List view of all interrogatories
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Interrogatories | LexiFlow',
  description: 'Manage interrogatories and written questions',
};

export default async function InterrogatoriesPage(): Promise<React.JSX.Element> {
  // Fetch interrogatories from backend
  let interrogatories = [];

  try {
    interrogatories = (await apiFetch(API_ENDPOINTS.INTERROGATORIES.LIST)) as any[];
  } catch (error) {
    console.error('Failed to load interrogatories:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Interrogatories</h1>
        <Link
          href="/interrogatories/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New
        </Link>
      </div>

      <Suspense fallback={<div>Loading interrogatories...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Served Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {interrogatories && interrogatories.length > 0 ? (
                interrogatories.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/interrogatories/${item.id}`} className="text-blue-600 hover:text-blue-800">
                        {item.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/interrogatories/${item.id}`} className="font-medium hover:text-blue-600">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.servedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-slate-600 dark:text-slate-400">
                    No interrogatories available
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
