/**
 * Timesheet Detail Page - Server Component with Data Fetching
 * Daily time entry grid with approval workflow
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 900; // Revalidate every 15 minutes

/**
 * Generate static params for timesheets detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of timesheets IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.TIMESHEETS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch timesheets list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Timesheet Detail | LexiFlow',
  description: 'Daily time entry details and approval',
};

async function TimesheetDetail({ params }: { params: { id: string } }) {
  const timesheet = await apiFetch(API_ENDPOINTS.TIMESHEETS.DETAIL(params.id)) as any;
  const entries = await apiFetch(API_ENDPOINTS.TIMESHEETS.ENTRIES(params.id)) as any[];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">User</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{timesheet.userName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Week Ending</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {new Date(timesheet.weekEnding).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Hours</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{timesheet.totalHours.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
            <p className={`text-lg font-semibold ${timesheet.status === 'Approved' ? 'text-green-600' :
              timesheet.status === 'Submitted' ? 'text-blue-600' : 'text-slate-600'
              }`}>
              {timesheet.status}
            </p>
          </div>
        </div>
      </div>

      {/* Time Entry Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-48">
                Matter / Activity
              </th>
              {days.map(day => (
                <th key={day} className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {day}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {entries.map((entry: any) => (
              <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.matterName}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{entry.activityCode}</div>
                </td>
                {days.map(day => (
                  <td key={day} className="px-4 py-3 text-center">
                    <input
                      type="number"
                      step="0.25"
                      defaultValue={entry.hours[day] || ''}
                      className="w-16 px-2 py-1 text-sm text-center border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700"
                      placeholder="0.00"
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">
                  {entry.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">Daily Totals</td>
              {days.map(day => (
                <td key={day} className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-slate-100">
                  {timesheet.dailyTotals?.[day]?.toFixed(2) || '0.00'}
                </td>
              ))}
              <td className="px-4 py-3 text-center font-bold text-blue-600">
                {timesheet.totalHours.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Notes & Comments */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-3">Notes & Comments</h3>
        <textarea
          defaultValue={timesheet.notes}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-100"
          rows={4}
          placeholder="Add notes or comments..."
        />
      </div>

      {/* Approval Workflow */}
      {timesheet.status === 'Submitted' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-3">Pending Approval</h3>
          <div className="flex space-x-3">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Approve
            </button>
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Reject
            </button>
            <button className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
              Request Revision
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          Back to List
        </button>
        <div className="space-x-3">
          <button className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            Save Draft
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TimesheetDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Timesheet Detail</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Daily time entries and approval workflow</p>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading timesheet...</div>}>
        <TimesheetDetail params={params} />
      </Suspense>
    </div>
  );
}
