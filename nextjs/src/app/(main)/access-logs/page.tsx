/**
 * Access Logs Page - Server Component with Data Fetching (Read-Only)
 * Security audit trail for document access and user actions
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Access Logs | LexiFlow',
  description: 'Security audit trail and access logs',
};

async function AccessLogsList() {
  const logs = await apiFetch(API_ENDPOINTS.AUDIT_LOGS.LIST) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document/Resource</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {logs.map((log: any) => (
            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                {new Date(log.timestamp).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {log.user}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">
                {log.resource || log.documentName || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.action === 'View' || log.action === 'view'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : log.action === 'Edit' || log.action === 'edit'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    : log.action === 'Download' || log.action === 'download'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
                  }`}>
                  {log.action}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 font-mono">
                {log.ipAddress || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${log.status === 'Success' || log.status === 'success'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                  {log.status || 'Success'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AccessLogsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Access Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Security audit trail (Read-Only)
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Export Logs
        </button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading access logs...</div>}>
        <AccessLogsList />
      </Suspense>
    </div>
  );
}
