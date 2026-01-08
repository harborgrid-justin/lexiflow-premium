/**
 * Rate Tables Page - Server Component with Data Fetching
 * Billing rate tables and attorney rate management
 */
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Rate Tables | LexiFlow',
  description: 'Attorney billing rate management',
};

async function RateTablesList() {
  const rateTables = await apiFetch(API_ENDPOINTS.RATE_TABLES.LIST) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rate Table Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matter Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Effective Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attorney Count</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rate Range</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {rateTables.map((table: any) => (
            <tr key={table.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {table.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {table.matterType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {new Date(table.effectiveDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                {table.attorneyCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                ${table.minRate} - ${table.maxRate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                <Link href={`/rate-tables/${table.id}`} className="text-blue-600 hover:underline">
                  View Detail
                </Link>
                <button className="text-green-600 hover:underline">Duplicate</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RateTablesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Rate Tables</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage attorney billing rates and fee schedules</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Create Rate Table
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Tables</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">8</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Active Attorneys</p>
          <p className="text-2xl font-bold text-blue-600">24</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Avg Rate</p>
          <p className="text-2xl font-bold text-green-600">$425</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Last Updated</p>
          <p className="text-2xl font-bold text-amber-600">3d ago</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading rate tables...</div>}>
        <RateTablesList />
      </Suspense>
    </div>
  );
}
