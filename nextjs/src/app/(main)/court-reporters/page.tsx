/**
 * Court Reporters List Page - Server Component with Data Fetching
 * Manage court reporters, assignments, and transcripts
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Court Reporters | LexiFlow',
  description: 'Court reporter and transcript management',
};

async function CourtReportersList() {
  const reporters = await apiFetch(API_ENDPOINTS.COURT_REPORTERS.LIST) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reporter Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Certification</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Assignments</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transcripts</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {reporters.map((reporter: any) => (
            <tr key={reporter.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {reporter.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {reporter.certification || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {reporter.activeAssignments || 0} assignment{reporter.activeAssignments !== 1 ? 's' : ''}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                <div className="space-y-1">
                  <div>Total: {reporter.transcriptsTotal || 0}</div>
                  {reporter.transcriptsPending > 0 && (
                    <div className="text-amber-600 dark:text-amber-400 text-xs">
                      {reporter.transcriptsPending} pending
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="space-y-1">
                  <div>{reporter.email}</div>
                  <div className="text-xs">{reporter.phone}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <Link href={`/court-reporters/${reporter.id}`} className="text-blue-600 hover:underline">
                  View Details
                </Link>
                <Link href={`/court-reporters/${reporter.id}/transcripts`} className="text-emerald-600 hover:underline">
                  Transcripts
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-pulse bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default function CourtReportersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Court Reporters</h1>
        <Link
          href="/court-reporters/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Reporter
        </Link>
      </div>
      <Suspense fallback={<LoadingState />}>
        <CourtReportersList />
      </Suspense>
    </div>
  );
}
