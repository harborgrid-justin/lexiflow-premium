/**
 * Time Entries List Page - Server Component with Data Fetching
 * List view of all time entries
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Time Entries | LexiFlow',
  description: 'View and manage time entries',
};

export default async function TimeEntriesPage() {
  // Fetch time entries from backend
  let timeEntries = [];

  try {
    timeEntries = await apiFetch(API_ENDPOINTS.TIME_ENTRIES.LIST);
  } catch (error) {
    console.error('Failed to load time entries:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Time Entries</h1>
        <Link
          href="/time-entries/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Log Time
        </Link>
      </div>

      <Suspense fallback={<div>Loading time entries...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 dark:bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3 text-right">Rate</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries && timeEntries.length > 0 ? (
                timeEntries.map((entry: any) => (
                  <tr key={entry.id} className="border-t hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3">
                      <Link href={`/time-entries/${entry.id}`} className="text-blue-600 hover:underline">
                        {entry.date}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{entry.description}</td>
                    <td className="px-4 py-3 text-right">{entry.hours}</td>
                    <td className="px-4 py-3 text-right">${entry.rate}</td>
                    <td className="px-4 py-3 text-right font-medium">${entry.total}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-600 dark:text-slate-400">
                    No time entries found
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
