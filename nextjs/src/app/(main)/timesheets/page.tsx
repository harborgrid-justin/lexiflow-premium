/**
 * Timesheets Page - Server Component with Data Fetching
 * Weekly timesheet management and submission
 */
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Timesheets | LexiFlow',
  description: 'Time entry and timesheet management',
};

async function TimesheetsList() {
  const timesheets = await apiFetch(API_ENDPOINTS.TIMESHEETS.LIST) as any[];

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Week Ending</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Hours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Billable Hours</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {timesheets.map((timesheet: any) => (
            <tr key={timesheet.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {timesheet.userName}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {timesheet.userRole}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {new Date(timesheet.weekEnding).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                {timesheet.totalHours.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                {timesheet.billableHours.toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(timesheet.status)}`}>
                  {timesheet.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                <Link href={`/timesheets/${timesheet.id}`} className="text-blue-600 hover:underline">
                  View Detail
                </Link>
                {timesheet.status === 'Draft' && (
                  <button className="text-green-600 hover:underline">Submit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TimesheetsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Timesheets</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage time entries and weekly submissions</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          New Timesheet
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">This Week</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">42.5h</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Billable %</p>
          <p className="text-2xl font-bold text-green-600">87%</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-amber-600">3</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
          <p className="text-2xl font-bold text-blue-600">12</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading timesheets...</div>}>
        <TimesheetsList />
      </Suspense>
    </div>
  );
}
