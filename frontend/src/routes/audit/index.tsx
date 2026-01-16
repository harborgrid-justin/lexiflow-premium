/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Audit Trail Route
 * Complete audit log viewer with filtering and search
 */

import { adminApi } from '@/lib/frontend-api';
import { DateRangeSelector } from '@/routes/analytics/components/enterprise';
import type { AuditLog } from '@/types/analytics-enterprise';
import { subDays } from 'date-fns';
import { AlertCircle, Download, Search, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

export function meta() {
  return createMeta({
    title: 'Audit Trail',
    description: 'System audit logs and compliance tracking',
  });
}

/**
 * Fetches audit logs on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader() {
  try {
    const result = await adminApi.getAuditLogs({ page: 1, limit: 500 });
    const logs = result.ok ? result.data.data : [];
    return { logs: logs as AuditLog[] };
  } catch (error) {
    console.error('Failed to load audit logs', error);
    return { logs: [] as AuditLog[] };
  }
}

clientLoader.hydrate = true as const;

export default function AuditTrailRoute() {
  const { logs } = useLoaderData<typeof clientLoader>();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: subDays(new Date(), 30),
    end: new Date(),
    label: 'Last 30 Days',
  });

  const filteredLogs = logs.filter((log: AuditLog) => {
    const matchesSearch =
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesAction && matchesCategory && matchesSeverity;
  });

  const getActionIcon = (action: string) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      login: '🔐',
      logout: '👋',
      export: '📤',
      access_denied: '🚫',
    };

    return icons[action as keyof typeof icons] || '📝';
  };

  const getActionColor = (action: string) => {
    const colors = {
      create: 'text-green-600 dark:text-green-400',
      update: 'text-[var(--color-primary)]',
      delete: 'text-red-600 dark:text-red-400',
      login: 'text-purple-600 dark:text-purple-400',
      logout: 'text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]',
      export: 'text-yellow-600 dark:text-yellow-400',
      access_denied: 'text-red-600 dark:text-red-400',
    };

    return colors[action as keyof typeof colors] || 'text-[var(--color-textMuted)]';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-[var(--color-surfaceRaised)] text-[var(--color-text)]',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };

    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      authentication: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      authorization: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30',
      data_access: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      data_modification: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      system_config: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      security: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      compliance: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    };

    return (
      colors[category as keyof typeof colors] ||
      'bg-[var(--color-surfaceRaised)] text-[var(--color-text)]'
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-surfaceRaised)] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-[var(--color-primary)]" />
            <h1 className="text-3xl font-bold text-[var(--color-text)]">Audit Trail</h1>
          </div>
          <p className="mt-1 text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
            Complete system activity log for compliance and security monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-700">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-textMuted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user, action, or entity..."
            className="w-full rounded-lg border border-[var(--color-border)] pl-10 pr-4 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="export">Export</option>
            <option value="access_denied">Access Denied</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm"
          >
            <option value="all">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="authorization">Authorization</option>
            <option value="data_access">Data Access</option>
            <option value="data_modification">Data Modification</option>
            <option value="system_config">System Config</option>
            <option value="security">Security</option>
            <option value="compliance">Compliance</option>
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm"
          >
            <option value="all">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {(filterAction !== 'all' ||
            filterCategory !== 'all' ||
            filterSeverity !== 'all' ||
            searchTerm) && (
              <button
                onClick={() => {
                  setFilterAction('all');
                  setFilterCategory('all');
                  setFilterSeverity('all');
                  setSearchTerm('');
                }}
                className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-700"
              >
                Clear Filters
              </button>
            )}
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-[var(--color-surfaceRaised)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  Entity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-[var(--color-surface)] dark:divide-gray-700">
              {filteredLogs.map((log: AuditLog) => (
                <tr
                  key={log.id}
                  className="hover:bg-[var(--color-surfaceRaised)] dark:hover:bg-gray-700/50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--color-text)]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-[var(--color-textMuted)]" />
                      <div>
                        <div className="text-sm font-medium text-[var(--color-text)]">
                          {log.userName}
                        </div>
                        <div className="text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                          {log.userEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-medium ${getActionColor(
                        log.action
                      )}`}
                    >
                      <span>{getActionIcon(log.action)}</span>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[var(--color-text)]">
                      {log.entityName || log.entityId}
                    </div>
                    <div className="text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                      {log.entityType}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(
                        log.category
                      )}`}
                    >
                      {log.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getSeverityColor(
                        log.severity
                      )}`}
                    >
                      {log.severity === 'critical' && <AlertCircle className="h-3 w-3" />}
                      {log.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-[var(--color-textMuted)]" />
            <h3 className="mt-4 text-lg font-medium text-[var(--color-text)]">
              No audit logs found
            </h3>
            <p className="mt-2 text-sm text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-medium text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
            Total Events
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">{filteredLogs.length}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-medium text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
            Unique Users
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
            {new Set(filteredLogs.map((log: AuditLog) => log.userId)).size}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-medium text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
            Critical Events
          </p>
          <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
            {filteredLogs.filter((log: AuditLog) => log.severity === 'critical').length}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-borderLight)] bg-[var(--color-surface)] p-4">
          <p className="text-sm font-medium text-[var(--color-textMuted)] dark:text-[var(--color-textMuted)]">
            Security Events
          </p>
          <p className="mt-1 text-2xl font-bold text-orange-600 dark:text-orange-400">
            {filteredLogs.filter((log: AuditLog) => log.category === 'security').length}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Audit Log Error"
      message="Failed to load audit logs. Please try again later."
    />
  );
}
