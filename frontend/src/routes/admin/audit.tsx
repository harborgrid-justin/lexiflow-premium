/** * Audit Logs Route * * Enterprise-grade audit logging interface with: * - Activity timeline * - Filter by user, action, resource * - Export capabilities * - Security event highlighting * * @module routes/admin/audit */ import { AdminService } from '@/services/domain/admin.service';
import type { AuditLogEntry } from '@/types';
import { useId, useState } from 'react';
import { Link } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createAdminMeta } from '../_shared/meta-utils'; // ============================================================================
// Meta Tags
// ============================================================================ export function meta() { return createAdminMeta({ section: 'Audit Logs', description: 'View system activity and security logs', });
} // ============================================================================
// Loader
// ============================================================================ import type { LoaderFunctionArgs } from 'react-router'; export async function loader({ request }: LoaderFunctionArgs) { const url = new URL(request.url); const page = parseInt(url.searchParams.get('page') || '1'); try { const logs = await AdminService.getLogs(); return { logs, pagination: { page, totalPages: 10, totalItems: logs.length, }, filters: { actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'PERMISSION_CHANGE'], resourceTypes: ['case', 'document', 'user', 'session', 'report', 'billing'], }, }; } catch (error) { console.error('Failed to load audit logs:', error); return { logs: [], pagination: { page: 1, totalPages: 1, totalItems: 0 }, filters: { actions: [], resourceTypes: [] } }; }
} // ============================================================================
// Action Helpers
// ============================================================================ function getActionColor(action: AuditLogEntry['action']): string { switch (action) { case 'CREATE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'; case 'UPDATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 '; case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'; case 'LOGIN': case 'LOGOUT': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'; case 'EXPORT': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'; case 'PERMISSION_CHANGE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'; default: return 'bg-[var(--color-surfaceRaised)] text-[var(--color-text)] '; }
} function getSeverityIcon(severity: AuditLogEntry['severity'] = 'info'): React.ReactNode { switch (severity) { case 'critical': return ( <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /> </svg> ); case 'warning': return ( <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /> </svg> ); default: return null; }
} function formatTimestamp(timestamp: string): string { const date = new Date(timestamp); const now = new Date(); const diff = now.getTime() - date.getTime(); if (diff < 60000) return 'Just now'; if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`; if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`; return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', });
} // ============================================================================
// Component
// ============================================================================

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LoaderData {
  logs: AuditLogEntry[];
  pagination: Pagination & { totalItems: number };
  filters: {
    actions: string[];
    resourceTypes: string[];
  };
}

export default function AuditLogsRoute({ loaderData }: { loaderData: LoaderData }) {
  const { logs, pagination, filters } = loaderData;
  const formId = useId();

  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleExport = () => {
    try {
      const headers = ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource Name', 'IP Address', 'Severity'];
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          new Date(log.timestamp).toLocaleString(),
          log.userEmail || log.user,
          log.action,
          log.resourceType || '',
          log.resourceName || log.resource,
          log.ipAddress || log.ip,
          log.severity || 'info'
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      alert('Failed to export audit logs. Please try again.');
    }
  };

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/admin" className="hover:text-gray-700 dark:hover:text-gray-200">
          Admin
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">Audit Logs</span>
      </nav>

      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Audit Logs
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and export system activity logs
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1">
          <label htmlFor={`${formId}-search`} className="sr-only">Search logs</label>
          <input
            id={`${formId}-search`}
            type="text"
            placeholder="Search by user, resource, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          />
        </div>
        <div>
          <label htmlFor={`${formId}-action-filter`} className="sr-only">Filter by action</label>
          <select
            id={`${formId}-action-filter`}
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="all">All Actions</option>
            {filters.actions.map((action: string) => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Resource
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                IP Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {logs.map((log: AuditLogEntry) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(log.severity || 'info')}
                    <span>{formatTimestamp(log.timestamp)}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {log.userEmail || log.user}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getActionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {log.resourceName || log.resource}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {log.resourceType || 'Unknown'} • {log.resourceId || ''}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {log.ipAddress || log.ip}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total entries)
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.page === 1}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination.page === pagination.totalPages}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:text-gray-200"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================ export { RouteErrorBoundary as ErrorBoundary };
