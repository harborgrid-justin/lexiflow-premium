/**
 * Bar Requirements List Page - Server Component with Data Fetching
 * Track attorney bar requirements, CLE hours, and license status
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Bar Requirements | LexiFlow',
  description: 'Attorney bar requirements, CLE tracking, and license management',
};

async function BarRequirementsList() {
  const requirements = await apiFetch(API_ENDPOINTS.BAR_REQUIREMENTS.LIST) as any[];
  const today = new Date();

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = Math.floor((new Date(expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) return { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    if (daysUntilExpiry < 30) return { label: 'Expiring Soon', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    if (daysUntilExpiry < 90) return { label: 'Due Soon', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    return { label: 'Current', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attorney</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bar State</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">CLE Hours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Bar Dues</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">License Expiry</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {requirements.map((req: any) => {
            const expiryStatus = getExpiryStatus(req.licenseExpiry);
            return (
              <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                  {req.attorneyName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {req.barState}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <span className={`font-semibold ${req.cleHoursCompleted >= req.cleHoursRequired
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                    }`}>
                    {req.cleHoursCompleted}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500"> / {req.cleHoursRequired}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.barDuesPaid
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                    {req.barDuesPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  {new Date(req.licenseExpiry).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${expiryStatus.color}`}>
                    {expiryStatus.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  <Link
                    href={`/bar-requirements/${req.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export default function BarRequirementsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bar Requirements</h1>
        <p className="text-slate-600 dark:text-slate-400">Track attorney licensing, CLE hours, and bar compliance</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <BarRequirementsList />
      </Suspense>
    </div>
  );
}
