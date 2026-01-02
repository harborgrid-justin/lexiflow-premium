/**
 * Reports Page - Server Component with Data Fetching
 * Report templates, schedules, and generation
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Reports | LexiFlow',
  description: 'Report templates and scheduled reports',
};

async function ReportsList() {
  const reports = await apiFetch(API_ENDPOINTS.REPORTS.LIST);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Template Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Schedule</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Run</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {reports.map((report: any) => (
            <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {report.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {report.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {report.schedule || 'Manual'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {report.lastRun ? new Date(report.lastRun).toLocaleDateString() : 'Never'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                <button className="text-blue-600 hover:underline">Run Now</button>
                <button className="text-green-600 hover:underline">Export</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Generate and schedule reports</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Create Template
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Templates</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">24</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled</p>
          <p className="text-2xl font-bold text-blue-600">8</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Run Today</p>
          <p className="text-2xl font-bold text-green-600">3</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Favorites</p>
          <p className="text-2xl font-bold text-amber-600">5</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading reports...</div>}>
        <ReportsList />
      </Suspense>
    </div>
  );
}
